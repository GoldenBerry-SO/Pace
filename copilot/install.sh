#!/bin/sh
# ABOUTME: Installs Pace's engineering skills for GitHub Copilot into the current repo's .github/ folder.
# ABOUTME: curl -fsSL https://raw.githubusercontent.com/GoldenBerry-SO/Pace/main/copilot/install.sh | sh

set -eu

REPO="${PACE_REPO:-GoldenBerry-SO/Pace}"
REF="${PACE_REF:-main}"
TARBALL="${PACE_TARBALL:-https://codeload.github.com/$REPO/tar.gz/$REF}"
FORCE=0
DRY=0
ANYWHERE=0

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --dry-run) DRY=1 ;;
    --anywhere) ANYWHERE=1 ;;
    -h|--help)
      cat <<'EOF'
Installs Pace for GitHub Copilot into ./.github/

  --force      replace skills, prompts and agents that already exist
  --dry-run    show what would change, write nothing
  --anywhere   run outside a git repository
  PACE_REF     branch or tag to install from (default: main)
EOF
      exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

if [ "$ANYWHERE" -eq 0 ] && [ ! -d .git ] && ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This does not look like a git repository. Run it from the repo you want Copilot to work in, or pass --anywhere." >&2
  exit 1
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [ -f "$TARBALL" ]; then
  cp "$TARBALL" "$TMP/pace.tar.gz"
elif command -v curl >/dev/null 2>&1; then
  curl -fsSL "$TARBALL" -o "$TMP/pace.tar.gz"
elif command -v wget >/dev/null 2>&1; then
  wget -q "$TARBALL" -O "$TMP/pace.tar.gz"
else
  echo "Need curl or wget to download $TARBALL" >&2
  exit 1
fi

mkdir -p "$TMP/x"
tar -xzf "$TMP/pace.tar.gz" -C "$TMP/x"
SRC="$(find "$TMP/x" -type d -path '*/copilot/.github' | head -n 1)"
if [ -z "$SRC" ]; then
  echo "The download has no copilot/.github folder. Is PACE_REF=$REF right?" >&2
  exit 1
fi

DST=".github"
added=0
kept=0
replaced=0

say() { [ "$DRY" -eq 1 ] && echo "would add  $1" || echo "added      $1"; }
put() {
  # put <source path> <destination path> <label>
  if [ -e "$2" ]; then
    if [ "$FORCE" -eq 1 ]; then
      [ "$DRY" -eq 1 ] || { rm -rf "$2"; cp -R "$1" "$2"; }
      echo "replaced   $3"; replaced=$((replaced + 1))
    else
      echo "kept       $3 (already there; --force replaces it)"; kept=$((kept + 1))
    fi
  else
    [ "$DRY" -eq 1 ] || { mkdir -p "$(dirname "$2")"; cp -R "$1" "$2"; }
    say "$3"; added=$((added + 1))
  fi
}

for dir in "$SRC"/skills/*/; do
  name="$(basename "$dir")"
  put "$dir" "$DST/skills/$name" "skill    $name"
done
put "$SRC/skills/CONNECTORS.md" "$DST/skills/CONNECTORS.md" "skills/CONNECTORS.md"
for file in "$SRC"/prompts/*.prompt.md; do
  put "$file" "$DST/prompts/$(basename "$file")" "prompt   /$(basename "$file" .prompt.md)"
done
for file in "$SRC"/agents/*.agent.md; do
  put "$file" "$DST/agents/$(basename "$file")" "agent    $(basename "$file" .agent.md)"
done

# The instructions file is merged, never overwritten: the block between the pace
# markers is added or refreshed, and everything else in the file stays as it is.
INS="$DST/copilot-instructions.md"
sed -n '/<!-- pace:start -->/,/<!-- pace:end -->/p' "$SRC/copilot-instructions.md" > "$TMP/block"
if [ ! -e "$INS" ]; then
  [ "$DRY" -eq 1 ] || { mkdir -p "$DST"; cp "$SRC/copilot-instructions.md" "$INS"; }
  say "copilot-instructions.md"; added=$((added + 1))
elif grep -q '<!-- pace:start -->' "$INS"; then
  [ "$DRY" -eq 1 ] || {
    awk -v blockfile="$TMP/block" '
      BEGIN { while ((getline l < blockfile) > 0) b = b l "\n" }
      /<!-- pace:start -->/ { printf "%s", b; skip = 1; next }
      /<!-- pace:end -->/ { skip = 0; next }
      !skip { print }
    ' "$INS" > "$TMP/ins" && mv "$TMP/ins" "$INS"
  }
  echo "refreshed  copilot-instructions.md (the pace block; your own text is untouched)"; replaced=$((replaced + 1))
else
  [ "$DRY" -eq 1 ] || { printf '\n' >> "$INS"; cat "$TMP/block" >> "$INS"; }
  echo "appended   copilot-instructions.md (the pace block, after your own text)"; added=$((added + 1))
fi

echo
echo "Pace for GitHub Copilot: $added added, $replaced replaced, $kept kept."
echo "In Copilot chat, in agent mode, try: /grill-me <a brief>, then /to-prd, then /to-issues."
echo "Assign an issue to Copilot to have the coding agent take it. @reviewer reads a pull request against the standards."
echo "In the Copilot CLI the same names work (/grill-me calls the skill); run /skills reload in an open session, and restart it for the instructions."
