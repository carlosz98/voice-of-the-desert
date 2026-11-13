# ============================================================
#  Dockerfile: the "box" Google Cloud Run runs.
#
#  A Dockerfile is a recipe. Each line adds one layer:
#  start from a computer that already has PHP + Apache,
#  add what's missing, copy our files in, done.
#
#  Cloud Run reads this file, builds the box (an "image"),
#  and starts copies of it whenever someone visits the API.
#
#  Build and run it on a computer with Docker:
#    docker build -t voz-api server
#    docker run -p 8080:8080 -e DB_HOST=... -e DB_PASS=... voz-api
# ============================================================

# 1. Start from the official PHP 8.3 image that already has the
#    Apache web server inside (like XAMPP, but in a box).
FROM php:8.3-apache

# 2. Add the MySQL driver for PDO (our db() function needs it).
RUN docker-php-ext-install pdo_mysql

# 3. Cloud Run sends visitors to the port in the PORT variable
#    (8080). Apache listens on 80 by default, so we point it at ${PORT}.
ENV PORT=8080
RUN sed -i 's/Listen 80/Listen ${PORT}/' /etc/apache2/ports.conf \
 && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/' /etc/apache2/sites-available/000-default.conf

# 4. Let the "Authorization: Bearer <ticket>" header reach PHP.
#    Apache hides it by default, and without it nobody could stay signed in.
RUN echo 'SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1' > /etc/apache2/conf-enabled/authorization.conf

# 5. Safety: don't tell visitors which versions we run, never show
#    PHP errors on the page (they go to the Cloud Run logs instead),
#    and no folder listings.
#    (named zz-... so Apache reads it LAST and it wins over the image's security.conf)
RUN printf 'ServerName localhost\nServerTokens Prod\nServerSignature Off\n<Directory /var/www/html>\n  Options -Indexes\n</Directory>\n' > /etc/apache2/conf-enabled/zz-voz-security.conf \
 && printf 'expose_php = Off\ndisplay_errors = Off\nlog_errors = On\nerror_log = /dev/stderr\n' > /usr/local/etc/php/conf.d/voz.ini

# 6. Copy our PHP files into Apache's web folder.
#    (.dockerignore keeps out the tests, the SQL files and the
#    hello-db.php learning example.)
COPY api/ /var/www/html/

# 7. Document the port. Apache starts by itself (the image's default command).
EXPOSE 8080
