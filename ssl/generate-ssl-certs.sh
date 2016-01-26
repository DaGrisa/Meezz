#!/bin/bash

if [ ! -e app.js ]
then
	echo "Error: could not find main application app.js file"
	echo "You should run the generate-ssl-certs.sh script from the main application root directory"
	echo "i.e: bash ssl/generate-ssl-certs.sh"
	exit -1
fi

echo "Generating self-signed certificates..."
openssl genrsa -out ./ssl/key.pem 2048
openssl req -new -key ./ssl/key.pem -out ./ssl/csr.pem
openssl x509 -req -days 9999 -in ./ssl/csr.pem -signkey ./ssl/key.pem -out ./ssl/cert.pem
rm ./ssl/csr.pem
chmod 600 ./ssl/key.pem ./ssl/cert.pem

# copied from https://github.com/andyet/signalmaster