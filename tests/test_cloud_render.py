import importlib.util
from pathlib import Path
import unittest

SOURCE = Path(__file__).resolve().parents[1] / "Backend" / "cloud_render.py"
SPEC = importlib.util.spec_from_file_location("cloud_render", SOURCE)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class CloudRenderTests(unittest.TestCase):
    def test_subtitle_speed_and_clamping(self):
        original = "1\n00:00:00,000 --> 00:00:04,000\nThe captain opened the cockpit door.\n"
        result = MODULE.normalize_subtitles(original, 2, 1.5)
        self.assertIn("00:00:00,000 -->", result)
        self.assertIn("00:00:01,500", result)
        self.assertNotIn("00:00:02,000", result)
        self.assertIn("captain", result)

    def test_missing_caption_timings_fail(self):
        with self.assertRaises(RuntimeError):
            MODULE.normalize_subtitles("", 1, 55)

    def test_manifest_rejects_missing_voice(self):
        with self.assertRaises(ValueError):
            MODULE.checked_manifest({"sentences": ["Test."], "search_terms": ["airplane"]})

    def test_stock_selection_requires_real_usable_mp4(self):
        video = {"id": 1, "duration": 10, "video_files": [
            {"file_type": "video/mp4", "width": 1080, "height": 1920, "link": "https://videos.pexels.com/1.mp4"},
            {"file_type": "video/mp4", "width": 3840, "height": 2160, "link": "https://videos.pexels.com/2.mp4"},
        ]}
        self.assertEqual(MODULE.select_video(video, set())["width"], 1080)
        self.assertIsNone(MODULE.select_video(video, {1}))
        video["duration"] = 4
        self.assertIsNone(MODULE.select_video(video, set()))


if __name__ == "__main__":
    unittest.main()
