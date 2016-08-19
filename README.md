# Meezz
HTML5 WebRTC Videochat

## Installation

1) install dependencies: npm install

2) create a "data" directory for the database

3) install and start MongoDB (on port 27017): mongod --dbpath /PATH_TO_MEEZZ/data

4) generate SSL server certificates: bash ssl/generate-ssl-certs.sh

5) set signalmaster server variable in public/javascripts/meezz.js

6) start webapp: npm start (debug mode: SET DEBUG=meezz:* & npm start)

7) Meezz runs on port 3000 (HTTP) and 3100 (HTTPS)

## Signalmaster Server

https://github.com/andyet/signalmaster

## UI Text

All the texts used in the application can be set in variables in the file /views/layout.jade.
