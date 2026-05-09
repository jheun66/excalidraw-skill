#!/usr/bin/env bash
# Thin wrapper around scripts/render.mjs (in-house Node renderer).
# Renders <input>.excalidraw to a sibling .png (scale 2x) and .svg.
#
# Usage:
#   ./scripts/render.sh <input.excalidraw>

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $(basename "$0") <input.excalidraw>" >&2
  exit 64
fi

input="$1"

if [[ ! -f "$input" ]]; then
  echo "error: file not found: $input" >&2
  exit 66
fi

dir="$(cd "$(dirname "$0")" && pwd)"
node "$dir/render.mjs" "$input"
