#!/usr/bin/env bash
# =============================================================
#  build.sh
#
#  A Theme = Layout + curated Styles.
#  Builds both layout subfolders (modern/ and sober/) so the
#  theme switcher can navigate between them without a 404.
#
#  Usage:
#    CLIENT_ID=client-1 bash build.sh
#    CLIENT_ID=client-3 bash build.sh
#
#  Output:
#    dist/
#      modern/          ← standard layout HTML
#      sober/           ← sober layout HTML
#      styles/          ← all shared CSS
#      js/              ← all shared JS
#      client.config.js ← generated from client config
#
#  Local preview:
#    cd dist && python3 -m http.server 8080
#    Then navigate to:
#      http://localhost:8080/modern/   (for modern theme)
#      http://localhost:8080/sober/    (for sober theme)
# =============================================================

set -e

CLIENT_ID="${CLIENT_ID:-client-1}"
CORE="core"
CLIENT_DIR="clients/${CLIENT_ID}"
DIST="dist"

# ── Validate ──────────────────────────────────────────────────
if [ ! -f "$CLIENT_DIR/client.config.json" ]; then
  echo "❌  Missing: $CLIENT_DIR/client.config.json"
  echo "    Available clients:"; ls clients/
  exit 1
fi

# ── Read config values ────────────────────────────────────────
THEME=$(python3 -c "import json; d=json.load(open('$CLIENT_DIR/client.config.json')); print(d.get('theme','modern'))")
STYLE=$(python3 -c "import json; d=json.load(open('$CLIENT_DIR/client.config.json')); print(d.get('style','style-1-editorial'))")

echo "🔨  Building"
echo "    Client : $CLIENT_ID"
echo "    Theme  : $THEME"
echo "    Style  : $STYLE"

# ── Clean dist ───────────────────────────────────────────────
rm -rf "$DIST"
mkdir -p "$DIST/modern" "$DIST/sober" "$DIST/simplistic" "$DIST/styles" "$DIST/js"

# ── Shared: styles and JS ────────────────────────────────────
cp "$CORE/styles/"*.css "$DIST/styles/"
cp "$CORE/js/"*.js      "$DIST/js/"
echo "✓   Copied styles/ and js/"

# ── Client assets ─────────────────────────────────────────────
if [ -d "$CLIENT_DIR/assets" ] && [ "$(ls -A $CLIENT_DIR/assets)" ]; then
  mkdir -p "$DIST/assets"
  cp -r "$CLIENT_DIR/assets/." "$DIST/assets/"
  echo "✓   Copied client assets"
else
  echo "⚠   No assets for $CLIENT_ID (skipping)"
fi

# ── Generate client.config.js at dist root ───────────────────
CONFIG_JSON=$(cat "$CLIENT_DIR/client.config.json")
echo "window.__CLIENT_CONFIG__ = ${CONFIG_JSON};" > "$DIST/client.config.js"
echo "✓   Generated client.config.js"

# ── Copy HTML into both layout subfolders ────────────────────
for layout in modern sober simplistic; do
  LAYOUT_DIR="$CORE/layouts/$layout"
  if [ ! -d "$LAYOUT_DIR" ]; then
    echo "⚠   Layout directory not found: $LAYOUT_DIR (skipping)"
    continue
  fi
  for page in index.html about.html services.html contact.html; do
    if [ -f "$LAYOUT_DIR/$page" ]; then
      cp "$LAYOUT_DIR/$page" "$DIST/$layout/$page"
    fi
  done
  echo "✓   Copied $layout/ HTML pages"
done

# ── Inject <script src="../client.config.js"> into all HTML ──
for layout in modern sober simplistic; do
  for html in "$DIST/$layout/"*.html; do
    [ -f "$html" ] || continue
    if ! grep -q 'client.config.js' "$html"; then
      sed -i 's|</head>|  <script src="../client.config.js"></script>\n</head>|' "$html"
    fi
  done
done
echo "✓   Injected client.config.js into all HTML pages"

# ── Root redirect: dist/index.html → correct theme subfolder ─
cat > "$DIST/index.html" << REDIRECT
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script>
    // Redirect to the client's configured theme, or localStorage override
    var theme = '${THEME}';
    try { var t = localStorage.getItem('theme_override'); if(t) theme = t; } catch(e){}
    window.location.replace(theme + '/index.html');
  </script>
</head>
<body></body>
</html>
REDIRECT
echo "✓   Created root redirect → $THEME/index.html"

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "✅  Build complete!"
echo "    Output : $DIST/"
echo ""
echo "    Preview:"
echo "    cd $DIST && python3 -m http.server 8080"
echo "    http://localhost:8080/              (redirects to $THEME)"
echo "    http://localhost:8080/modern/       (Modern theme)"
echo "    http://localhost:8080/sober/        (Sober theme)"
    echo "    http://localhost:8080/simplistic/  (Simplistic theme)"
