#!/bin/bash
# ============================================================
#  set-felipe-login.sh: give Felipe's account his REAL email
#  and password, on the live database (cloud day).
#
#  It ASKS for both when you run it, so they are never written
#  in the code, on GitHub, or in your terminal history.
#  It prints one SQL line with his email and the bcrypt HASH of
#  the password. Paste that line into Cloud SQL Studio (or the
#  mysql prompt) and press Run.
#
#  Run it in Cloud Shell (it has PHP):
#    bash scripts/set-felipe-login.sh
# ============================================================
set -e

read -r  -p "Felipe's email: " EMAIL
read -r -s -p "His new password (not shown while typing): " PASS; echo
read -r -s -p "Type it again: " PASS2; echo
[ "$PASS" = "$PASS2" ] || { echo "The two passwords don't match. Nothing was made."; exit 1; }
[ ${#PASS} -ge 8 ] && [ ${#PASS} -le 72 ] || { echo "The password must be 8 to 72 characters."; exit 1; }

# PHP makes the bcrypt hash (the same way the site checks it) and the SQL.
# Email and password go in as separate arguments, never inside the code.
php -r '
  $email = strtolower(trim($argv[1]));
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { fwrite(STDERR, "That email doesn'\''t look right.\n"); exit(1); }
  $hash = password_hash($argv[2], PASSWORD_DEFAULT);
  echo "\n-- Paste this into Cloud SQL (database voz_del_desierto):\n";
  echo "UPDATE users SET email = '\''$email'\'', password_hash = '\''$hash'\'' WHERE id = 1 AND role = '\''felipe'\'';\n";
  echo "DELETE FROM sessions WHERE user_id = 1;  -- signs out the old demo login everywhere\n\n";
' "$EMAIL" "$PASS"

unset PASS PASS2
