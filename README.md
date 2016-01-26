# Meezz
HTML5 WebRTC Videochat written in Node.js

## Installation

1) install dependencies: npm install

2) generate SSL server certificates: bash ssl/generate-ssl-certs.sh

4) set signalmaster server in public/javascripts/meezz.js

5) start webapp: npm start (debug mode: SET DEBUG=meezz:* & npm start)

6) Meezz runs on port 80 (HTTP) and 443 (HTTPS)

## Signalmaster Server

https://github.com/andyet/signalmaster