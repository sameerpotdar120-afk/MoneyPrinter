#!/usr/bin/env bash
set -euo pipefail

source_dir="${1:?usage: prepare-assets.sh RAW_CLIP_DIR}"
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
background="$project_dir/public/images/ai-hall-background.png"
output_dir="$project_dir/public/presenter"
audio_dir="$project_dir/public/audio"

files=(
  1000102495.mp4
  1000102496.mp4
  1000102497.mp4
  1000102499.mp4
  1000102500.mp4
  1000102501.mp4
  1000102502.mp4
  1000102503.mp4
)

mkdir -p "$output_dir" "$audio_dir"

for index in "${!files[@]}"; do
  number="$(printf '%02d' "$((index + 1))")"
  input="$source_dir/${files[$index]}"
  ffmpeg -hide_banner -loglevel error \
    -loop 1 -i "$background" -i "$input" \
    -filter_complex "[0:v]scale=1080:1920,setpts=PTS-STARTPTS[bg];[1:v]setpts=PTS-STARTPTS,format=rgba,colorkey=0x56955f:0.10:0.04,despill=green:mix=0.15,scale=1080:-1[fg];[bg][fg]overlay=(W-w)/2:H-h:format=auto" \
    -t 10 -r 30 -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -ar 48000 "$output_dir/$number.mp4" -y
done

ffmpeg -hide_banner -loglevel error \
  -f lavfi -i "anoisesrc=color=brown:amplitude=0.018:duration=80:sample_rate=48000" \
  -f lavfi -i "sine=frequency=62:duration=80:sample_rate=48000" \
  -filter_complex "[1:a]volume=0.025[hum];[0:a][hum]amix=inputs=2:duration=longest,lowpass=f=420,afade=t=in:st=0:d=2,afade=t=out:st=78:d=2" \
  -c:a pcm_s16le "$audio_dir/ambient.wav" -y

echo "Prepared eight presenter plates and the ambient bed."
