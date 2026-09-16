# Ira AI Race documentary

An 80-second, 1080×1920, 30fps Remotion edit built from eight Ira presenter clips.

## Commands

```bash
npm install
npm run studio
npm run render
```

The presenter clips are pre-keyed and composited over one consistent AI research hall.
Editorial sources and claim notes live in `src/sources.ts`.

Raw presenter footage and rendered output are intentionally excluded from Git. Prepare local
assets with FFmpeg before opening Studio:

```bash
chmod +x tools/prepare-assets.sh
./tools/prepare-assets.sh /path/to/raw-clips
```

Expected raw filenames are listed in `tools/prepare-assets.sh` in their 0–80 second order.
