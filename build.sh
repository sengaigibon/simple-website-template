#!/usr/bin/env bash
# =============================================================
#  build.sh
#
#  Build modes (controlled by demo_mode in client.config.json):
#
#  demo_mode: true  — Full build. All layouts and all styles are
#    included so the Theme Switcher UI can navigate between them.
#    HTML lives in dist/<layout>/ subfolders; a root index.html
#    redirects to the configured theme. Used during client review.
#
#  demo_mode: false — Locked build. Only the configured layout
#    and style are included. HTML is placed directly in dist/
#    root (no subfolder, no redirect). No other themes or styles
#    are shipped, so the URL cannot be manipulated. Used for
#    live production deployments.
#
#  Usage:
#    CLIENT_ID=client-1 bash build.sh
#    CLIENT_ID=client-3 bash build.sh
#
#  Output (demo):       Output (production):
#    dist/                dist/
#      modern/              index.html
#      sober/               about.html
#      simplistic/          services.html
#      styles/ (all)        contact.html
#      js/                  styles/<style>.css
#      assets/              js/
#      client.config.js     assets/
#      index.html (→)       client.config.js
#
#  Local preview:
#    cd dist && python3 -m http.server 8080
#    http://localhost:8080/
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
DEMO_MODE=$(python3 -c "import json; d=json.load(open('$CLIENT_DIR/client.config.json')); print(str(d.get('demo_mode',True)).lower())")

echo "🔨  Building"
echo "    Client    : $CLIENT_ID"
echo "    Theme     : $THEME"
echo "    Style     : $STYLE"
echo "    Demo mode : $DEMO_MODE"

# ── Clean dist ───────────────────────────────────────────────
rm -rf "$DIST"
mkdir -p "$DIST/styles" "$DIST/js"

# ── Shared JS ────────────────────────────────────────────────
cp "$CORE/js/"*.js "$DIST/js/"
echo "✓   Copied js/"

# ── Client assets ─────────────────────────────────────────────
if [ -d "$CLIENT_DIR/assets" ] && [ "$(ls -A $CLIENT_DIR/assets)" ]; then
  mkdir -p "$DIST/assets"
  cp -r "$CLIENT_DIR/assets/." "$DIST/assets/"
  echo "✓   Copied client assets"
else
  echo "⚠   No assets for $CLIENT_ID (skipping)"
fi

# ── Generate client.config.js ────────────────────────────────
if [ "$DEMO_MODE" = "true" ]; then
  # Demo: paths in config stay as-is (../assets/ works from subfolder)
  echo "window.__CLIENT_CONFIG__ = $(cat "$CLIENT_DIR/client.config.json");" > "$DIST/client.config.js"
else
  # Production: strip leading ../ from logo_image since HTML is at root
  python3 -c "
import json, re
d = json.load(open('$CLIENT_DIR/client.config.json'))
if d.get('brand') and d['brand'].get('logo_image'):
    d['brand']['logo_image'] = re.sub(r'^\.\.\/', '', d['brand']['logo_image'])
print('window.__CLIENT_CONFIG__ = ' + json.dumps(d) + ';')
" > "$DIST/client.config.js"
fi
echo "✓   Generated client.config.js"

# ── Styles ───────────────────────────────────────────────────
if [ "$DEMO_MODE" = "true" ]; then
  cp "$CORE/styles/"*.css "$DIST/styles/"
  echo "✓   Copied all styles/ (demo mode)"
else
  cp "$CORE/styles/${STYLE}.css" "$DIST/styles/"
  echo "✓   Copied styles/${STYLE}.css (production mode)"
fi

# ── HTML ─────────────────────────────────────────────────────
if [ "$DEMO_MODE" = "true" ]; then
  # Demo: all layouts in subfolders so the switcher can navigate
  for layout in modern sober simplistic; do
    LAYOUT_DIR="$CORE/layouts/$layout"
    if [ ! -d "$LAYOUT_DIR" ]; then
      echo "⚠   Layout not found: $LAYOUT_DIR (skipping)"
      continue
    fi
    mkdir -p "$DIST/$layout"
    for page in index.html about.html services.html contact.html; do
      [ -f "$LAYOUT_DIR/$page" ] && cp "$LAYOUT_DIR/$page" "$DIST/$layout/$page"
    done
    echo "✓   Copied $layout/ HTML pages"
  done
else
  # Production: configured layout only, placed directly at dist/ root
  LAYOUT_DIR="$CORE/layouts/$THEME"
  if [ ! -d "$LAYOUT_DIR" ]; then
    echo "❌  Layout not found: $LAYOUT_DIR"; exit 1
  fi
  for page in index.html about.html services.html contact.html; do
    [ -f "$LAYOUT_DIR/$page" ] && cp "$LAYOUT_DIR/$page" "$DIST/$page"
  done
  echo "✓   Copied $THEME/ HTML pages to dist/ root (production mode)"
fi

# ── Inject client.config.js script tag into HTML ─────────────
if [ "$DEMO_MODE" = "true" ]; then
  # HTML is in subfolders — reference is ../client.config.js
  for layout in modern sober simplistic; do
    for html in "$DIST/$layout/"*.html; do
      [ -f "$html" ] || continue
      grep -q 'client.config.js' "$html" || \
        sed -i 's|</head>|  <script src="../client.config.js"></script>\n</head>|' "$html"
    done
  done
else
  # Fix remaining ../ references (../js/ → js/, ../styles/ → styles/)
  for html in "$DIST/"*.html; do
    [ -f "$html" ] || continue
    sed -i 's|\.\./||g' "$html"
  done
  # Inject two scripts at the very top of <head>, before the inline style-loader:
  #   1. localStorage cleanup — removes stale demo overrides
  #   2. client.config.js — makes cfg available to the style-loader that follows
  # Both must come before the existing inline <script> that reads cfg and
  # style_override, which is why they go at <head> not </head>.
  for html in "$DIST/"*.html; do
    [ -f "$html" ] || continue
    sed -i 's|<head>|<head>\n  <script>try{localStorage.removeItem("style_override");localStorage.removeItem("theme_override");}catch(e){}</script>\n  <script src="client.config.js"></script>|' "$html"
  done
fi
echo "✓   Injected client.config.js and fixed paths in all HTML pages"

# ── Root redirect (demo mode only) ───────────────────────────
if [ "$DEMO_MODE" = "true" ]; then
  cat > "$DIST/index.html" << REDIRECT
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script>
    var theme = '${THEME}';
    try { var t = localStorage.getItem('theme_override'); if(t) theme = t; } catch(e){}
    window.location.replace(theme + '/index.html');
  </script>
</head>
<body></body>
</html>
REDIRECT
  echo "✓   Created root redirect → $THEME/index.html"
fi

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "✅  Build complete!"
echo "    Output : $DIST/"
if [ "$DEMO_MODE" = "true" ]; then
  echo "    Mode   : demo — all themes/styles, switcher enabled"
else
  echo "    Mode   : production — $THEME + $STYLE only, HTML at root"
fi
echo ""
echo "    Preview:"
echo "    cd $DIST && python3 -m http.server 8080"
echo "    http://localhost:8080/"
