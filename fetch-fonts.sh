#!/usr/bin/env bash
# הורדת הפונטים לשימוש אופליין. מריצים פעם אחת, עם אינטרנט, לפני הערב.
#   bash fetch-fonts.sh
# אחרי זה האתר עובד לגמרי במצב טיסה.
set -u
cd "$(dirname "$0")"
mkdir -p fonts

get () {  # get <family:weight> <output-name>
  local fam="$1" out="$2"
  local css
  css=$(curl -sfL -A "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1" \
        "https://fonts.googleapis.com/css?family=${fam}&subset=hebrew,latin") || { echo "  ✗ ${out} (נכשלה בקשת ה-CSS)"; return 1; }
  local url
  url=$(printf '%s' "$css" | sed -n 's/.*src: *url(\([^)]*\)).*/\1/p' | head -1)
  if [ -z "$url" ]; then echo "  ✗ ${out} (לא נמצא קובץ)"; return 1; fi
  if curl -sfL "$url" -o "fonts/${out}.ttf"; then
    echo "  ✓ fonts/${out}.ttf  ($(du -h "fonts/${out}.ttf" | cut -f1))"
  else
    echo "  ✗ ${out} (ההורדה נכשלה)"
  fi
}

echo "מוריד פונטים לתיקיית fonts/ ..."
get "Suez+One"                 "SuezOne-Regular"
get "Heebo:300"                "Heebo-Light"
get "Heebo:500"                "Heebo-Medium"
get "Heebo:800"                "Heebo-ExtraBold"
get "Frank+Ruhl+Libre:400"     "FrankRuhlLibre-Regular"
get "Frank+Ruhl+Libre:700"     "FrankRuhlLibre-Bold"
echo "סיימתי. אם משהו נכשל — האתר עדיין עובד עם פונטים של המערכת."
