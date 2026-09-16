#!/usr/bin/env bash
set -euo pipefail

input_dir="${1:?input directory required}"
output_dir="${2:?output directory required}"
mkdir -p "$output_dir/frames"

for file in "$input_dir"/*.mp4; do
  name="$(basename "$file" .mp4)"
  for second in 1 5 9; do
    ffmpeg -hide_banner -loglevel error -ss "$second" -i "$file" -frames:v 1 \
      -vf "scale=270:-1" "$output_dir/frames/${name}_${second}.jpg" -y
  done
done

ffmpeg -hide_banner -loglevel error -pattern_type glob -i "$output_dir/frames/*.jpg" \
  -vf "tile=6x4:padding=8:margin=8:color=black" -frames:v 1 "$output_dir/contact-sheet.jpg" -y
