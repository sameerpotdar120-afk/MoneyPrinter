# Render from Android

This one-shot workflow renders reviewed narration with fresh Pexels stock clips
using MoneyPrinter's existing combine_videos and generate_video functions.
It does not need a web server, local Ollama, or a TikTok session cookie.
Narration uses Edge TTS, an unofficial online voice client; service failures
stop the render rather than silently switching to a low-quality narrator.

Stock clips are real camera footage. They are illustrative, not verified
recordings of the FZ1073 incident. A visible label and a credits file preserve
that distinction. No prior project media or generated artwork is loaded.

## One-time setup in Chrome

1. Open https://www.pexels.com/api/, sign in, and request your API key.
2. Open your GitHub repository's Settings > Secrets and variables > Actions.
3. Tap New repository secret.
4. Name it PEXELS_API_KEY and paste your key into Secret, then save.
5. Merge the cloud-render setup pull request into main after checks pass.

If buttons are missing, use Chrome's menu and enable Desktop site.
Never commit the key to a file, a workflow input, or a chat message.

## Render and download

1. Open Actions in your MoneyPrinter repository.
2. Select Render short from phone.
3. Tap Run workflow, select main and choose hindi or english.
4. Open the new run. Once it succeeds, scroll to Artifacts.
5. Download FZ1073-short-hindi or FZ1073-short-english.
6. Extract the ZIP on your phone; FZ1073_Short.mp4 is the video.

The ZIP also includes captions, narration text, source links and stock credits.
The render targets 1080 x 1920 at 30 fps and 55 seconds. It refuses excessive
speech acceleration or missing media rather than inventing footage.

## Checks and limitations

Local syntax and isolated unit checks do not verify Pexels access, the online
narration service, footage suitability, or an end-to-end cloud render.
A successful cloud job plus visual and audio review is still required.
MoneyPrinter's existing backend, queue and UI are unchanged by this entry point.
The reviewed incident manifests record their research date; update evidence
and script when new information changes material claims.

Validation:
python -m unittest discover -s tests -p test_cloud_render.py -v
