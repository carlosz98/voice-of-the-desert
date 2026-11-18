#!/bin/bash
# ============================================================
#  Checks Felipe's tools: news search, music search, YouTube link
#  and the writing helper, against PRETEND versions of Google News,
#  iTunes, YouTube and Gemini (server/tests/mocks/router.php).
#
#  1. start the pretend sites:
#       php -S 127.0.0.1:8099 server/tests/mocks/router.php
#  2. start the API pointing at them:
#       NEWS_RSS_URL=http://127.0.0.1:8099/news BING_RSS_URL=http://127.0.0.1:8099/bing ITUNES_URL=http://127.0.0.1:8099/itunes \
#       YOUTUBE_OEMBED_URL=http://127.0.0.1:8099/oembed GEMINI_URL=http://127.0.0.1:8099/gemini \
#       GEMINI_API_KEY=test-key php -S 127.0.0.1:8088 -t server/api
#  3. FELIPE_PASSWORD=... bash server/tests/tools-test.sh
# ============================================================
A=${API:-http://127.0.0.1:8088}
FP=${FELIPE_PASSWORD:?"Set FELIPE_PASSWORD"}
LAST=server/tests/mocks/last-request.txt
pass=0; failn=0
check() { if [[ "$3" == *"$2"* ]]; then pass=$((pass+1)); echo "ok   $1"; else failn=$((failn+1)); echo "FAIL $1"; echo "     wanted: $2"; echo "     got:    ${3:0:300}"; fi; }
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
J='Content-Type: application/json'
token() { php -r '$d=json_decode(stream_get_contents(STDIN),true); echo $d["token"]??"";'; }

H="Authorization: Bearer $(curl -s -X POST -H "$J" -d "{\"email\":\"felipe@example.com\",\"password\":\"$FP\"}" $A/login.php | token)"
U="Authorization: Bearer $(curl -s -X POST -H "$J" -d "{\"name\":\"Tools Test\",\"email\":\"tools$RANDOM@example.com\",\"password\":\"cactus123\"}" $A/register.php | token)"

echo "--- only Felipe"
for f in "news-search.php?q=x" "music-search.php?q=x" "video-info.php?url=https://youtu.be/dQw4w9WgXcQ"; do
  check "guest can't use $f" "401" "$(code "$A/$f")"
  check "reader can't use $f" "403" "$(code -H "$U" "$A/$f")"
done
check "guest can't use write-help" "401" "$(code -X POST -H "$J" -d '{}' $A/write-help.php)"
check "reader can't use write-help" "403" "$(code -X POST -H "$U" -H "$J" -d '{"kind":"news","notes":"hola amigos"}' $A/write-help.php)"

echo "--- news search (Bing first: it has pictures)"
r=$(curl -s -H "$H" "$A/news-search.php?q=gobierno%20prepararse")
check "bing story" '"title":"Familias se preparan para el invierno","source":"El Heraldo"' "$r"
check "newspaper's own link (not bing's)" '"link":"https://www.elheraldo.mx/invierno"' "$r"
check "picture, made https" '"image":"https://www.bing.com/th?id=OVFT.abc&pid=News"' "$r"
check "bad picture dropped" '"title":"Sin foto","source":"El Diario","link":"https://www.diario.mx/nota","published":"2026-11-17T09:00:00+00:00","image":null' "$r"
check "asked bing in Mexican Spanish" 'mkt=es-MX' "$(head -1 $LAST)"

echo "--- news search (Bing not answering → Google)"
r=$(curl -s -H "$H" "$A/news-search.php?q=solo%20google")
check "headline without the newspaper" '"title":"El gobierno pide a la población prepararse ante la ola de frío"' "$r"
check "newspaper name" '"source":"El Heraldo de Chihuahua"' "$r"
check "& decoded" 'Ciudad Juárez & Delicias' "$r"
check "date as ISO" '"published":"2026-11-16T14:00:00+00:00"' "$r"
check "google has no picture" '"image":null' "$r"
check "javascript: link dropped" "0" "$(echo "$r" | grep -c javascript)"
check "only last 7 days asked" 'when%3A7d' "$(head -1 $LAST)"
check "spanish Mexico region" 'ceid=MX:es-419' "$(head -1 $LAST)"
r=$(curl -s -H "$H" "$A/news-search.php?q=nada"); check "nothing found → empty list" "[]" "$r"
check "no words → 400" "400" "$(code -H "$H" "$A/news-search.php?q=%20")"
r=$(curl -s -H "$H" "$A/news-search.php?topic=top"); check "topic top from bing, with picture" '"image":"https://www.bing.com/th' "$r"
r=$(curl -s -H "$H" "$A/news-search.php?topic=world"); check "topic world (google)" '"title":"Tema: /news/headlines/section/topic/WORLD"' "$r"
r=$(curl -s -H "$H" "$A/news-search.php?topic=chihuahua"); check "topic chihuahua asks right" 'q=Chihuahua%20when%3A2d&hl=es-419' "$(head -1 $LAST)"
check "unknown topic 400" "400" "$(code -H "$H" "$A/news-search.php?topic=../../etc")"
check "guest can't see topics" "401" "$(code "$A/news-search.php?topic=top")"

echo "--- music search"
r=$(curl -s -H "$H" "$A/music-search.php?q=viento")
check "song found" '"title":"Viento del Norte","artist":"Los Norteños","album":"Sierra","genre":"Norteño","seconds":202' "$r"
check "big cover" '600x600bb' "$r"
check "html removed" '"title":"Canción dos"' "$r"
check "http cover refused" '"artwork":null' "$r"
check "asked for songs in MX" 'country=MX' "$(head -1 $LAST)"

echo "--- YouTube link"
r=$(curl -s -H "$H" "$A/video-info.php?url=https://youtu.be/dQw4w9WgXcQ?si=abc")
check "youtu.be link → id" '"youtube_id":"dQw4w9WgXcQ"' "$r"
check "title from YouTube" '"title":"Amanecer en la Sierra Tarahumara"' "$r"
check "channel" '"channel":"Canal del Desierto"' "$r"
r=$(curl -s -H "$H" "$A/video-info.php?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ%26t%3D30")
check "watch?v= link" '"video_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"' "$r"
r=$(curl -s -H "$H" "$A/video-info.php?url=https://www.youtube.com/shorts/dQw4w9WgXcQ"); check "shorts link" '"youtube_id":"dQw4w9WgXcQ"' "$r"
check "not youtube → 400" "400" "$(code -H "$H" "$A/video-info.php?url=https://evil.example.com/watch?v=dQw4w9WgXcQ")"
check "youtube.com.evil → 400" "400" "$(code -H "$H" "$A/video-info.php?url=https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ")"
check "removed video → 404" "404" "$(code -H "$H" "$A/video-info.php?url=https://youtu.be/GONEgone123")"

echo "--- writing helper"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"kind":"news","notes":"escribe que el gobierno pide prepararse porque viene el frío","about":{"title":"El gobierno pide prepararse","source":"El Heraldo"}}' $A/write-help.php)
check "draft title" '"title":"El gobierno pide prepararse"' "$r"
check "draft take, tags removed" '"take":"Yo creo que hay que estar listos, vecinos. x"' "$r"
check "only the form's fields" "0" "$(echo "$r" | grep -c extra)"
req=$(cat $LAST)
check "key sent in a header, not the address" "0" "$(head -1 $LAST | grep -c test-key)"
check "rule: no made-up facts" 'Never add facts' "$req"
check "his notes sent" 'viene el fr' "$req"
check "the news headline sent" 'Headline: El gobierno pide prepararse' "$req"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"kind":"verse","notes":"me habla de compañía","about":{"reference":"Salmos 23:1","text":"Jehová es mi pastor"}}' $A/write-help.php)
check "verse reflection" '"reflection":"Este vers' "$r"
check "unknown kind 400" "400" "$(code -X POST -H "$H" -H "$J" -d '{"kind":"hack","notes":"hola amigos"}' $A/write-help.php)"
check "empty notes 400" "400" "$(code -X POST -H "$H" -H "$J" -d '{"kind":"news","notes":"  "}' $A/write-help.php)"
check "free limit → 429" "429" "$(code -X POST -H "$H" -H "$J" -d '{"kind":"news","notes":"LIMITE de prueba"}' $A/write-help.php)"
check "GET not allowed" "405" "$(code -H "$H" $A/write-help.php)"

echo; echo "passed $pass, failed $failn"
[ "$failn" = 0 ]
