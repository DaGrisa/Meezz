# Meezz
HTML5 WebRTC Videochat written in Node.js

## Installation

1) install dependencies: npm install

2) create a "data" directory for the database

3) install and start MongoDB (on port 27017): mongod --dbpath /PATH_TO_MEEZZ/data

4) generate SSL server certificates: bash ssl/generate-ssl-certs.sh

5) set signalmaster server in public/javascripts/meezz.js

6) start webapp: npm start (debug mode: SET DEBUG=meezz:* & npm start)

7) Meezz runs on port 80 (HTTP) and 443 (HTTPS)

## Signalmaster Server

https://github.com/andyet/signalmaster