#!/bin/bash
# ============================================================
#  Checks every API address. Run it on a FRESH database
#  (import 01_schema.sql and 02_seed.sql first).
#
#    bash server/tests/api-test.sh                                  # default: http://127.0.0.1:8088
#    API=http://localhost/voz-api bash server/tests/api-test.sh     # XAMPP
#    MYSQL=mariadb ...                                              # if your client is called mariadb
# ============================================================
A=${API:-http://127.0.0.1:8088}
SQL="${MYSQL:-mysql} -N -u root voz_del_desierto -e"
pass=0; failn=0
check() { # name, expected substring, actual
  if [[ "$3" == *"$2"* ]]; then pass=$((pass+1)); echo "ok   $1"; else failn=$((failn+1)); echo "FAIL $1"; echo "     wanted: $2"; echo "     got:    ${3:0:300}"; fi
}
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
field() { php -r '$d=json_decode(stream_get_contents(STDIN),true); foreach(explode(".",$argv[1]) as $k){$d=$d[$k]??null;} echo is_array($d)?json_encode($d):$d;' "$1"; }
J='Content-Type: application/json'

echo "--- public reads"
r=$(curl -s $A/articles.php); check "articles list" '"slug":"mercado-nocturno-plaza-de-armas"' "$r"
check "articles count=12" "12" "$(echo "$r" | php -r 'echo count(json_decode(stream_get_contents(STDIN)));')"
check "comment_count" '"comment_count":3' "$r"
r=$(curl -s "$A/articles.php?category=Music"); check "filter Music" '"category":"Music"' "$r"
check "filter has no Local" "0" "$(echo "$r" | grep -c '"category":"Local"')"
r=$(curl -s "$A/articles.php?q=horse"); check "search horse" 'Wild horse' "$r"
r=$(curl -s "$A/articles.php?slug=caballos-salvajes"); check "one article body array" '"body":["Rangers' "$r"
check "one article comments" '"comments":[{' "$r"
check "accents" 'mija' "$r"
check "Felipe's seed comment linked to his account" '"user_id":1,"name":"Felipe Lerma"' "$r"
check "404 article" "404" "$(code "$A/articles.php?slug=nope")"
r=$(curl -s $A/videos.php?from=felipe); check "videos felipe" '"from_who":"felipe"' "$r"
r=$(curl -s $A/videos.php?slug=amanecer-en-la-sierra); check "one video" '"comments":[' "$r"
r=$(curl -s "$A/songs.php?genre=Norte%C3%B1o"); check "songs genre ñ" 'Viento del norte' "$r"
r=$(curl -s $A/episodes.php); check "episodes chapters array" '"chapters":[["0:00","Welcome"]' "$r"
r=$(curl -s $A/dedications.php); check "dedications join" '"song_title":"Luna de Parral"' "$r"
r=$(curl -s $A/desk.php); check "desk" '"kind":"shared"' "$r"

echo "--- register"
r=$(curl -s -X POST -H "$J" -d '{"name":"Carlos Prueba","email":"Carlos@Example.com","password":"cactus123","town":"Delicias"}' $A/register.php)
check "register gives token" '"token":"' "$r"
check "register role is user" '"role":"user"' "$r"
check "email saved lowercase" '"email":"carlos@example.com"' "$r"
U=$(echo "$r" | field token); UH="Authorization: Bearer $U"
check "password not in answer" "0" "$(echo "$r" | grep -c password)"
check "hash stored, not password" '$2y$' "$($SQL "SELECT password_hash FROM users WHERE email='carlos@example.com'")"
check "same email again 409" "409" "$(code -X POST -H "$J" -d '{"name":"x","email":"carlos@example.com","password":"cactus123"}' $A/register.php)"
check "short password 400" "400" "$(code -X POST -H "$J" -d '{"name":"x","email":"new@example.com","password":"123"}' $A/register.php)"
check "bad email 400" "400" "$(code -X POST -H "$J" -d '{"name":"x","email":"not-an-email","password":"cactus123"}' $A/register.php)"
check "missing name 400" "400" "$(code -X POST -H "$J" -d '{"email":"n2@example.com","password":"cactus123"}' $A/register.php)"
r=$(curl -s -X POST -H "$J" -d '{"name":"Hacker","email":"h@example.com","password":"cactus123","role":"felipe"}' $A/register.php)
check "can't register as felipe" '"role":"user"' "$r"

echo "--- sign in / who am I"
check "wrong password 401" "401" "$(code -X POST -H "$J" -d '{"email":"carlos@example.com","password":"nope"}' $A/login.php)"
check "unknown email 401 (same answer)" "401" "$(code -X POST -H "$J" -d '{"email":"nobody@example.com","password":"cactus123"}' $A/login.php)"
r=$(curl -s -X POST -H "$J" -d '{"email":"CARLOS@example.com","password":"cactus123"}' $A/login.php); check "login any case email" '"name":"Carlos Prueba"' "$r"
r=$(curl -s -H "$UH" $A/login.php); check "who am I" '"town":"Delicias"' "$r"
check "no token who am I 401" "401" "$(code $A/login.php)"

echo "--- comments need an account"
check "guest comment 401" "401" "$(code -X POST -H "$J" -d '{"type":"article","id":1,"name":"Guest","text":"hi"}' $A/comments.php)"
r=$(curl -s -X POST -H "$UH" -H "$J" -d '{"type":"article","id":1,"name":"Felipe Lerma","text":"¡Hola desde la API!"}' $A/comments.php)
check "user comment uses account name" '"name":"Carlos Prueba"' "$r"
check "user can't fake felipe badge" '"is_felipe":0' "$r"
check "comment accent" '¡Hola' "$r"
MYC=$(echo "$r" | field id)
check "comment bad type" "400" "$(code -X POST -H "$UH" -H "$J" -d '{"type":"song","id":1,"text":"x"}' $A/comments.php)"
check "comment no such article" "404" "$(code -X POST -H "$UH" -H "$J" -d '{"type":"article","id":999,"text":"x"}' $A/comments.php)"
check "comment too long" "400" "$(code -X POST -H "$UH" -H "$J" -d "{\"type\":\"article\",\"id\":1,\"text\":\"$(printf 'x%.0s' {1..2100})\"}" $A/comments.php)"
check "can't delete someone else's comment" "403" "$(code -X DELETE -H "$UH" "$A/comments.php?id=1")"
check "delete my own comment" "200" "$(code -X DELETE -H "$UH" "$A/comments.php?id=$MYC")"

echo "--- open to everyone"
r=$(curl -s -X POST "$A/songs.php?id=1&play=1"); check "play +1" '"plays":18001' "$r"
r=$(curl -s -X POST -H "$J" -d '{"name":"Ana","to_whom":"Mi abuela","song_id":2,"message":"Para ti"}' $A/dedications.php); check "guest dedication" '"name":"Ana"' "$r"
r=$(curl -s -X POST -H "$UH" -H "$J" -d '{"to_whom":"Mi abuela","song_id":2}' $A/dedications.php); check "signed-in dedication uses account" '"name":"Carlos Prueba"' "$r"
check "dedication bad song" "409" "$(code -X POST -H "$J" -d '{"name":"Ana","to_whom":"x","song_id":999}' $A/dedications.php)"
check "guest message" "201" "$(code -X POST -H "$J" -d '{"name":"Ana","message":"Hola Felipe"}' $A/messages.php)"
check "signed-in message" "201" "$(code -X POST -H "$UH" -H "$J" -d '{"message":"Saludos desde Delicias"}' $A/messages.php)"

echo "--- users can NOT do Felipe things"
check "guest read messages 401" "401" "$(code $A/messages.php)"
check "user read messages 403" "403" "$(code -H "$UH" $A/messages.php)"
check "user add article 403" "403" "$(code -X POST -H "$UH" -H "$J" -d '{"title":"x","summary":"x","category":"Local"}' $A/articles.php)"
check "guest add article 401" "401" "$(code -X POST -H "$J" -d '{"title":"x","summary":"x","category":"Local"}' $A/articles.php)"
check "fake token 401" "401" "$(code -H "Authorization: Bearer $(printf 'a%.0s' {1..64})" $A/messages.php)"
check "SQL injection is just text" "200" "$(code "$A/articles.php?q=%27%20OR%201%3D1%20--")"
check "injection finds nothing" "[]" "$(curl -s "$A/articles.php?q=%27%20OR%201%3D1%20--")"

echo "--- submissions (Upload page)"
check "guest can't send 401" "401" "$(code -X POST -H "$J" -d '{"kind":"video","title":"x","link":"https://example.com"}' $A/submissions.php)"
r=$(curl -s -X POST -H "$UH" -H "$J" -d '{"kind":"video","title":"Boda en Delicias","description":"La banda tocó toda la noche","file_name":"boda.mp4"}' $A/submissions.php)
check "send a video" '"status":"pending"' "$r"
check "sender is me" '"sender_name":"Carlos Prueba"' "$r"
SUB=$(echo "$r" | field id)
r=$(curl -s -X POST -H "$UH" -H "$J" -d '{"kind":"news","title":"Feria en Parral","link":"https://example.com/feria"}' $A/submissions.php)
check "send a news link" '"link":"https://example.com/feria"' "$r"
SUB2=$(echo "$r" | field id)
check "needs file or link 400" "400" "$(code -X POST -H "$UH" -H "$J" -d '{"kind":"photo","title":"x"}' $A/submissions.php)"
check "bad link 400" "400" "$(code -X POST -H "$UH" -H "$J" -d '{"kind":"news","title":"x","link":"javascript:alert(1)"}' $A/submissions.php)"
check "bad kind 400" "400" "$(code -X POST -H "$UH" -H "$J" -d '{"kind":"movie","title":"x","link":"https://example.com"}' $A/submissions.php)"
check "missing title 400" "400" "$(code -X POST -H "$UH" -H "$J" -d '{"kind":"news","link":"https://example.com"}' $A/submissions.php)"
r=$(curl -s -H "$UH" $A/submissions.php)
check "I see my 2" "2" "$(echo "$r" | php -r 'echo count(json_decode(stream_get_contents(STDIN)));')"
check "I don't see Rosa's" "0" "$(echo "$r" | grep -c 'night market')"
check "user can't list everyone's 403" "403" "$(code -H "$UH" "$A/submissions.php?all=1")"
check "user can't approve 403" "403" "$(code -X PUT -H "$UH" -H "$J" -d '{"status":"approved"}' "$A/submissions.php?id=$SUB")"
check "can't remove Rosa's 403" "403" "$(code -X DELETE -H "$UH" "$A/submissions.php?id=1")"
check "take back my pending one" "200" "$(code -X DELETE -H "$UH" "$A/submissions.php?id=$SUB2")"
check "spam limit: 10 a day" "429" "$(for i in 1 2 3 4 5 6 7 8 9 10; do code -X POST -H "$UH" -H "$J" -d '{"kind":"news","title":"x","link":"https://example.com"}' $A/submissions.php >/dev/null; done; code -X POST -H "$UH" -H "$J" -d '{"kind":"news","title":"x","link":"https://example.com"}' $A/submissions.php)"
$SQL "DELETE FROM submissions WHERE title='x'" >/dev/null

echo "--- my account"
r=$(curl -s -H "$UH" $A/account.php); check "account details" '"comment_count":0' "$r"
check "account counts submissions" '"submission_count":1' "$r"
r=$(curl -s -X PUT -H "$UH" -H "$J" -d '{"name":"Carlos Z.","town":"Parral"}' $A/account.php); check "change name/town" '"name":"Carlos Z."' "$r"
check "wrong current password 401" "401" "$(code -X PUT -H "$UH" -H "$J" -d '{"current_password":"nope","new_password":"nopal4567"}' $A/account.php)"
check "change password" "200" "$(code -X PUT -H "$UH" -H "$J" -d '{"current_password":"cactus123","new_password":"nopal4567"}' $A/account.php)"
check "old password stops working" "401" "$(code -X POST -H "$J" -d '{"email":"carlos@example.com","password":"cactus123"}' $A/login.php)"
check "new password works" "201" "$(code -X POST -H "$J" -d '{"email":"carlos@example.com","password":"nopal4567"}' $A/login.php)"

echo "--- Felipe signs in like everyone, and gets his panel"
r=$(curl -s -X POST -H "$J" -d '{"email":"felipe@example.com","password":"desierto"}' $A/login.php); check "felipe login role" '"role":"felipe"' "$r"
H="Authorization: Bearer $(echo "$r" | field token)"
r=$(curl -s -H "$H" "$A/submissions.php?all=1&status=pending"); check "felipe sees pending" 'Boda en Delicias' "$r"
check "pending list has Rosa's too" 'The night market' "$r"
check "felipe sees sender email" '"sender_email":"carlos@example.com"' "$r"
r=$(curl -s -X PUT -H "$H" -H "$J" -d '{"status":"approved","felipe_note":"¡Qué bonita boda! La comparto el domingo."}' "$A/submissions.php?id=$SUB")
check "felipe approves with note" '"status":"approved"' "$r"
check "reviewed time set" '"reviewed_at":"20' "$r"
r=$(curl -s -H "$UH" $A/submissions.php); check "user sees Felipe's note" 'La comparto el domingo' "$r"
check "can't take back once reviewed 409" "409" "$(code -X DELETE -H "$UH" "$A/submissions.php?id=$SUB")"
check "bad status 400" "400" "$(code -X PUT -H "$H" -H "$J" -d '{"status":"maybe"}' "$A/submissions.php?id=$SUB")"
r=$(curl -s -H "$H" $A/messages.php); check "felipe reads messages" 'Hola Felipe' "$r"
check "sees sender email" '"sender_email":"carlos@example.com"' "$r"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"title":"La feria de Santa Rita","summary":"Prueba","category":"Local","body":["Uno.","Dos."],"take":"¡Vayan!"}' $A/articles.php)
check "felipe adds article" '"slug":"la-feria-de-santa-rita"' "$r"
check "body saved as paragraphs" '"body":["Uno.","Dos."]' "$r"
NEW=$(echo "$r" | field id)
check "duplicate slug 409" "409" "$(code -X POST -H "$H" -H "$J" -d '{"title":"La feria de Santa Rita","summary":"x","category":"Local"}' $A/articles.php)"
check "bad category 400" "400" "$(code -X POST -H "$H" -H "$J" -d '{"title":"x2","summary":"x","category":"Sports"}' $A/articles.php)"
r=$(curl -s -X PUT -H "$H" -H "$J" -d '{"take":"Editado"}' "$A/articles.php?id=$NEW"); check "felipe edits" '"take":"Editado"' "$r"
r=$(curl -s -X POST -H "$H" -H "$J" -d "{\"type\":\"article\",\"id\":$NEW,\"text\":\"Gracias a todos\"}" $A/comments.php); check "felipe comment badge" '"is_felipe":1' "$r"
check "felipe comment name" '"name":"Felipe Lerma"' "$r"
check "felipe deletes anyone's comment" "200" "$(code -X DELETE -H "$H" "$A/comments.php?id=2")"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"title":"Episodio nuevo","chapters":[["0:00","Hola"],["5:30","La historia"]]}' $A/episodes.php)
check "felipe adds episode" '"number":13' "$r"
check "chapters round trip" '["5:30","La historia"]' "$r"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"title":"Canción","artist":"Alguien","genre":"Bolero","length_seconds":200}' $A/songs.php); check "felipe adds song" '"genre":"Bolero"' "$r"
check "bad genre 400" "400" "$(code -X POST -H "$H" -H "$J" -d '{"title":"x","artist":"y","genre":"Rock"}' $A/songs.php)"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"title":"Video nuevo"}' $A/videos.php); check "felipe adds video" '"creator":"Felipe Lerma"' "$r"
r=$(curl -s -X POST -H "$H" -H "$J" -d '{"text":"Buenos días"}' $A/desk.php); check "felipe desk note" '"kind":"note"' "$r"
check "felipe deletes article" "200" "$(code -X DELETE -H "$H" "$A/articles.php?id=$NEW")"
check "its comments are gone" "0" "$($SQL "SELECT COUNT(*) FROM comments WHERE item_type='article' AND item_id=$NEW")"
check "felipe account can't be deleted" "403" "$(code -X DELETE -H "$H" -H "$J" -d '{"password":"desierto"}' $A/account.php)"

echo "--- CORS"
check "CORS github.io" "access-control-allow-origin: https://carlosz98.github.io" "$(curl -s -I -H 'Origin: https://carlosz98.github.io' $A/articles.php | tr A-Z a-z)"
check "CORS other site blocked" "0" "$(curl -s -I -H 'Origin: https://evil.example' $A/articles.php | grep -ci allow-origin)"
check "preflight 204" "204" "$(code -X OPTIONS -H 'Origin: https://carlosz98.github.io' $A/comments.php)"

echo "--- sign out and delete account"
check "felipe sign out" "200" "$(code -X DELETE -H "$H" $A/login.php)"
check "his ticket is dead" "401" "$(code -H "$H" $A/messages.php)"
r=$(curl -s -X POST -H "$UH" -H "$J" -d '{"type":"article","id":1,"text":"Un comentario antes de irme"}' $A/comments.php)
check "wrong password can't delete account" "401" "$(code -X DELETE -H "$UH" -H "$J" -d '{"password":"nope"}' $A/account.php)"
check "delete my account" "200" "$(code -X DELETE -H "$UH" -H "$J" -d '{"password":"nopal4567"}' $A/account.php)"
check "my submissions went with it" "0" "$($SQL "SELECT COUNT(*) FROM submissions WHERE title='Boda en Delicias'")"
check "my comments went with it" "0" "$($SQL "SELECT COUNT(*) FROM comments WHERE name='Carlos Z.'")"
check "my dedication stays, unlinked" "1" "$($SQL "SELECT COUNT(*) FROM dedications WHERE name='Carlos Prueba' AND user_id IS NULL")"
check "my ticket is dead" "401" "$(code -H "$UH" $A/login.php)"

echo; echo "passed $pass, failed $failn"
[ "$failn" = 0 ]
