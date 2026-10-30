#!/bin/bash
# Hits every API endpoint and checks the answers.
A=${API:-http://127.0.0.1:8088}   # XAMPP: API=http://localhost/voz-api bash server/tests/api-test.sh
pass=0; failn=0
check() { # name, expected substring, actual
  if [[ "$3" == *"$2"* ]]; then pass=$((pass+1)); echo "ok   $1"; else failn=$((failn+1)); echo "FAIL $1"; echo "     wanted: $2"; echo "     got:    ${3:0:300}"; fi
}
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
J='Content-Type: application/json'

# --- public reads
r=$(curl -s $A/articles.php); check "articles list" '"slug":"mercado-nocturno-plaza-de-armas"' "$r"
check "articles count=12" "12" "$(echo "$r" | php -r 'echo count(json_decode(stream_get_contents(STDIN)));')"
check "comment_count" '"comment_count":3' "$r"
r=$(curl -s "$A/articles.php?category=Music"); check "filter Music" '"category":"Music"' "$r"
check "filter has no Local" "0" "$(echo "$r" | grep -c '"category":"Local"')"
r=$(curl -s "$A/articles.php?q=horse"); check "search horse" 'Wild horse' "$r"
r=$(curl -s "$A/articles.php?slug=caballos-salvajes"); check "one article body array" '"body":["Rangers' "$r"
check "one article comments" '"comments":[{' "$r"
check "accents" 'mija' "$r"
check "404 article" "404" "$(code "$A/articles.php?slug=nope")"
r=$(curl -s $A/videos.php?from=felipe); check "videos felipe" '"from_who":"felipe"' "$r"
r=$(curl -s $A/videos.php?slug=amanecer-en-la-sierra); check "one video" '"comments":[' "$r"
r=$(curl -s "$A/songs.php?genre=Norte%C3%B1o"); check "songs genre ñ" 'Viento del norte' "$r"
r=$(curl -s $A/episodes.php); check "episodes chapters array" '"chapters":[["0:00","Welcome"]' "$r"
r=$(curl -s $A/dedications.php); check "dedications join" '"song_title":"Luna de Parral"' "$r"
r=$(curl -s $A/desk.php); check "desk" '"kind":"shared"' "$r"

# --- public writes
r=$(curl -s -X POST -H "$J" -d '{"type":"article","id":1,"name":"Carlos","text":"¡Hola desde la API!"}' $A/comments.php)
check "visitor comment" '"is_felipe":0' "$r"
check "visitor comment accent" '¡Hola' "$r"
check "comment missing name" "400" "$(code -X POST -H "$J" -d '{"type":"article","id":1,"text":"x"}' $A/comments.php)"
check "comment bad type" "400" "$(code -X POST -H "$J" -d '{"type":"song","id":1,"name":"a","text":"x"}' $A/comments.php)"
check "comment no such article" "404" "$(code -X POST -H "$J" -d '{"type":"article","id":999,"name":"a","text":"x"}' $A/comments.php)"
check "comment too long" "400" "$(code -X POST -H "$J" -d "{\"type\":\"article\",\"id\":1,\"name\":\"a\",\"text\":\"$(printf 'x%.0s' {1..2100})\"}" $A/comments.php)"
r=$(curl -s -X POST "$A/songs.php?id=1&play=1"); check "play +1" '"plays":18001' "$r"
r=$(curl -s -X POST -H "$J" -d '{"name":"Ana","to_whom":"Mi abuela","song_id":2,"message":"Para ti"}' $A/dedications.php); check "dedication" '"song_title":"Luna de Parral"' "$r"
check "dedication bad song" "409" "$(code -X POST -H "$J" -d '{"name":"Ana","to_whom":"x","song_id":999}' $A/dedications.php)"
check "message send" "201" "$(code -X POST -H "$J" -d '{"name":"Ana","message":"Hola Felipe"}' $A/messages.php)"

# --- visitors can NOT do Felipe things
check "visitor read messages 401" "401" "$(code $A/messages.php)"
check "visitor add article 401" "401" "$(code -X POST -H "$J" -d '{"title":"x","summary":"x","category":"Local"}' $A/articles.php)"
check "visitor delete comment 401" "401" "$(code -X DELETE "$A/comments.php?id=1")"
check "fake token 401" "401" "$(code -H "Authorization: Bearer $(printf 'a%.0s' {1..64})" $A/messages.php)"
check "SQL injection is just text" "200" "$(code "$A/articles.php?q=%27%20OR%201%3D1%20--")"
check "injection finds nothing" "[]" "$(curl -s "$A/articles.php?q=%27%20OR%201%3D1%20--")"

# --- login
check "wrong password 401" "401" "$(code -X POST -H "$J" -d '{"email":"felipe@example.com","password":"nope"}' $A/login.php)"
r=$(curl -s -X POST -H "$J" -d '{"email":"felipe@example.com","password":"desierto"}' $A/login.php); check "login" '"token":"' "$r"
T=$(echo "$r" | php -r 'echo json_decode(stream_get_contents(STDIN))->token;')
H="Authorization: Bearer $T"
r=$(curl -s -H "$H" $A/login.php); check "who am I" '"name":"Felipe Lerma"' "$r"

# --- Felipe's panel
r=$(curl -s -H "$H" $A/messages.php); check "felipe reads messages" 'Hola Felipe' "$r"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"title":"La feria de Santa Rita","summary":"Prueba","category":"Local","body":["Uno.","Dos."],"take":"¡Vayan!"}' $A/articles.php)
check "felipe adds article" '"slug":"la-feria-de-santa-rita"' "$r"
check "body saved as paragraphs" '"body":["Uno.","Dos."]' "$r"
NEW=$(echo "$r" | php -r 'echo json_decode(stream_get_contents(STDIN))->id;')
check "duplicate slug 409" "409" "$(code -X POST -H "$H" -H "$J" -d '{"title":"La feria de Santa Rita","summary":"x","category":"Local"}' $A/articles.php)"
r=$(curl -s -X PUT -H "$H" -H "$J" -d '{"take":"Editado"}' "$A/articles.php?id=$NEW"); check "felipe edits" '"take":"Editado"' "$r"
r=$(curl -s -X POST -H "$H" -H "$J" -d "{\"type\":\"article\",\"id\":$NEW,\"text\":\"Gracias a todos\"}" $A/comments.php); check "felipe comment badge" '"is_felipe":1' "$r"
check "felipe comment name" '"name":"Felipe Lerma"' "$r"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"title":"Episodio nuevo","chapters":[["0:00","Hola"],["5:30","La historia"]]}' $A/episodes.php)
check "felipe adds episode" '"number":13' "$r"
check "chapters round trip" '["5:30","La historia"]' "$r"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"title":"Canción","artist":"Alguien","genre":"Bolero","length_seconds":200}' $A/songs.php); check "felipe adds song" '"genre":"Bolero"' "$r"
check "bad genre rejected" "400" "$(code -X POST -H "$H" -H "$J" -d '{"title":"x","artist":"y","genre":"Rock"}' $A/songs.php)"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"title":"Video nuevo"}' $A/videos.php); check "felipe adds video" '"creator":"Felipe Lerma"' "$r"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"text":"Buenos días"}' $A/desk.php); check "felipe desk note" '"kind":"note"' "$r"
check "felipe deletes article" "200" "$(code -X DELETE -H "$H" "$A/articles.php?id=$NEW")"
check "its comments are gone" "0" "$(${MYSQL:-mysql} -N -u root voz_del_desierto -e "SELECT COUNT(*) FROM comments WHERE item_type='article' AND item_id=$NEW")"

# --- CORS
check "CORS github.io" "access-control-allow-origin: https://carlosz98.github.io" "$(curl -s -I -H 'Origin: https://carlosz98.github.io' $A/articles.php | tr A-Z a-z)"
check "CORS other site blocked" "0" "$(curl -s -I -H 'Origin: https://evil.example' $A/articles.php | grep -ci allow-origin)"
check "preflight 204" "204" "$(code -X OPTIONS -H 'Origin: https://carlosz98.github.io' $A/comments.php)"

# --- sign out
check "sign out" "200" "$(code -X DELETE -H "$H" $A/login.php)"
check "token dead after sign out" "401" "$(code -H "$H" $A/messages.php)"

echo; echo "passed $pass, failed $failn"
