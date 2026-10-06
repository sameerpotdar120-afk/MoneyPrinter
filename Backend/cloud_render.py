"""One-shot cloud render using MoneyPrinter's existing video functions.

Uses a reviewed script, fresh Pexels video, and Edge TTS. This entry point does
not require Ollama or a TikTok cookie and never uploads to social platforms.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent


def checked_manifest(data: dict) -> dict:
    if not isinstance(data, dict) or not isinstance(data.get("sentences"), list):
        raise ValueError("Manifest must contain a sentences list.")
    if not data["sentences"] or any(
        not isinstance(text, str) or not text.strip() for text in data["sentences"]
    ):
        raise ValueError("Narration sentences must be nonempty strings.")
    if not data.get("search_terms") or any(
        not isinstance(term, str) or not term.strip() for term in data["search_terms"]
    ):
        raise ValueError("Manifest needs stock footage search terms.")
    if not isinstance(data.get("voice"), str) or not data["voice"]:
        raise ValueError("Manifest needs a narration voice.")
    return data


def srt_time(seconds: float) -> str:
    milliseconds = max(0, round(seconds * 1000))
    hours, rest = divmod(milliseconds, 3600000)
    minutes, rest = divmod(rest, 60000)
    seconds, milliseconds = divmod(rest, 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02},{milliseconds:03}"


def seconds_from_srt(value: str) -> float:
    hours, minutes, rest = value.split(":")
    seconds, milliseconds = rest.split(",")
    return int(hours) * 3600 + int(minutes) * 60 + int(seconds) + int(milliseconds) / 1000


def caption_groups(text: str, maximum: int = 18) -> list[str]:
    groups = []
    current = ""
    for word in text.split():
        candidate = (current + " " + word).strip()
        if current and len(candidate) > maximum:
            groups.append(current)
            current = word
        else:
            current = candidate
    if current:
        groups.append(current)
    return groups


def normalize_subtitles(source: str, speed: float, duration: float) -> str:
    output = []
    for block in re.split(r"\n\s*\n", source.strip()):
        lines = block.strip().splitlines()
        if len(lines) < 3 or " --> " not in lines[1]:
            continue
        start_text, end_text = lines[1].split(" --> ")
        start = seconds_from_srt(start_text) / speed
        end = min(seconds_from_srt(end_text) / speed, duration)
        groups = caption_groups(" ".join(lines[2:]))
        total_chars = sum(len(group) for group in groups)
        if end <= start or not total_chars:
            continue
        cursor = start
        for group in groups:
            next_time = min(end, cursor + (end - start) * len(group) / total_chars)
            output.append(
                f"{len(output) + 1}\n{srt_time(cursor)} --> {srt_time(next_time)}\n{group}\n"
            )
            cursor = next_time
    if not output:
        raise RuntimeError("Narration service returned no timed captions.")
    return "\n".join(output)


def probe_duration(path: Path) -> float:
    result = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "csv=p=0", str(path),
    ], text=True)
    return float(result)


def select_video(video: dict, excluded: set[int]) -> dict | None:
    if video.get("id") in excluded or video.get("duration", 0) < 6:
        return None
    files = [
        item for item in video.get("video_files", [])
        if item.get("file_type") == "video/mp4"
        and item.get("width") and item.get("height")
        and item["width"] >= 720 and item["height"] >= 720
        and urlparse(item.get("link", "")).scheme == "https"
    ]
    if not files:
        return None
    # Prefer vertical footage, then full HD material, without giant 4K downloads.
    def rank(item: dict) -> tuple:
        aspect = item["width"] / item["height"]
        area = item["width"] * item["height"]
        return (abs(aspect - 9 / 16), abs(area - 1920 * 1080))
    return min(files, key=rank)


def download_stock(terms: list[str], key: str, target: Path) -> tuple[list[str], list[dict]]:
    import requests

    paths = []
    credits = []
    selected = set()
    session = requests.Session()
    for term in terms:
        response = session.get(
            "https://api.pexels.com/videos/search",
            params={"query": term, "per_page": 20},
            headers={"Authorization": key},
            timeout=45,
        )
        response.raise_for_status()
        for video in response.json().get("videos", []):
            item = select_video(video, selected)
            if item is None:
                continue
            # Do not forward the Pexels Authorization header to the media host.
            media = session.get(item["link"], stream=True, timeout=90)
            media.raise_for_status()
            path = target / f"pexels_{video['id']}.mp4"
            with path.open("wb") as handle:
                for chunk in media.iter_content(1024 * 1024):
                    handle.write(chunk)
            if probe_duration(path) < 6:
                path.unlink()
                continue
            selected.add(video["id"])
            paths.append(str(path))
            credits.append({
                "query": term,
                "id": video["id"],
                "url": video.get("url"),
                "creator": video.get("user", {}).get("name"),
                "source": "Pexels",
                "footage_type": "Illustrative stock footage, not footage of the incident",
            })
            break
    if len(paths) < 5:
        raise RuntimeError("Fewer than five fresh usable stock clips were found.")
    return paths, credits


def render(manifest: Path, output_dir: Path) -> None:
    data = checked_manifest(json.loads(manifest.read_text(encoding="utf-8")))
    key = os.getenv("PEXELS_API_KEY", "").strip()
    if not key:
        raise RuntimeError(
            "Add PEXELS_API_KEY under Settings > Secrets and variables > Actions."
        )
    from moviepy import AudioFileClip
    import video as moneyprinter_video

    output_dir.mkdir(parents=True, exist_ok=True)
    work = ROOT / "temp" / "cloud_render"
    work.mkdir(parents=True, exist_ok=True)
    script = " ".join(data["sentences"])
    script_file = work / "narration.txt"
    script_file.write_text(script, encoding="utf-8")
    raw_audio = work / "raw_narration.mp3"
    raw_subtitles = work / "raw_subtitles.srt"
    subprocess.run([
        sys.executable, "-m", "edge_tts", "--file", str(script_file),
        "--voice", data["voice"], "--rate=+5%",
        "--write-media", str(raw_audio), "--write-subtitles", str(raw_subtitles),
    ], check=True, timeout=180)
    raw_duration = probe_duration(raw_audio)
    target_duration = 55.0
    speed = raw_duration / target_duration
    if not 0.8 <= speed <= 1.25:
        raise RuntimeError(
            "Narration requires more than 25% speed adjustment. Revise the script "
            "for a natural 50-60 second delivery."
        )
    audio = work / "narration.wav"
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(raw_audio), "-af", f"atempo={speed},apad,atrim=0:55",
        str(audio),
    ], check=True)
    captions = work / "captions.srt"
    captions.write_text(
        normalize_subtitles(raw_subtitles.read_text(encoding="utf-8"), speed, 55),
        encoding="utf-8",
    )
    paths, credits = download_stock(data["search_terms"], key, work)
    # Reuse the repository's production concatenation and final-render code.
    combined = moneyprinter_video.combine_videos(paths, 55, 5, 2)
    font = Path(data.get("font", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
    if not font.is_file():
        raise RuntimeError(f"Caption font unavailable: {font}")
    fonts = work / "fonts"
    fonts.mkdir(exist_ok=True)
    shutil.copy2(font, fonts / "bold_font.ttf")
    moneyprinter_video.FONTS_DIR = fonts
    moneyprinter_video.generate_video(combined, str(audio), str(captions), 2, "center,bottom", "#FFFFFF")
    rendered = moneyprinter_video.TEMP_DIR / "output.mp4"
    final = output_dir / "FZ1073_Short.mp4"
    # A persistent label distinguishes real stock from actual incident footage.
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(rendered),
        "-vf", "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:"
        "text='ILLUSTRATIVE STOCK FOOTAGE':fontsize=25:fontcolor=white:"
        "box=1:boxcolor=black@0.55:boxborderw=8:x=24:y=82",
        "-c:v", "libx264", "-preset", "fast", "-crf", "19",
        "-c:a", "copy", "-movflags", "+faststart", str(final),
    ], check=True)
    if not 50 <= probe_duration(final) <= 60:
        raise RuntimeError("Final render is outside the requested duration range.")
    shutil.copy2(captions, output_dir / "captions.srt")
    (output_dir / "narration.txt").write_text(script, encoding="utf-8")
    (output_dir / "sources_and_credits.json").write_text(json.dumps({
        "research_as_of": data["research_as_of"],
        "sources": data["sources"],
        "footage": credits,
        "note": "Fresh real stock video illustrates the report. No incident footage is claimed.",
    }, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Rendered {final.name}: {probe_duration(final):.2f} seconds")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "cloud_output")
    args = parser.parse_args()
    render(args.manifest, args.output_dir)


if __name__ == "__main__":
    main()
