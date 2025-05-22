#!/bin/bash

# Directory for SSL certificates
SSL_DIR="./ssl"

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

# Generate CA key and certificate
openssl genrsa -out $SSL_DIR/ca.key 2048
openssl req -x509 -new -nodes -key $SSL_DIR/ca.key -sha256 -days 3650 -out $SSL_DIR/ca.pem -subj "/C=IN/ST=Karnataka/L=Bengaluru/O=ITSM Tool/CN=ITSM Tool CA"

# Generate server key and certificate
openssl genrsa -out $SSL_DIR/server.key 2048
openssl req -new -key $SSL_DIR/server.key -out $SSL_DIR/server.csr -subj "/C=IN/ST=Karnataka/L=Bengaluru/O=ITSM Tool/CN=localhost"
openssl x509 -req -in $SSL_DIR/server.csr -CA $SSL_DIR/ca.pem -CAkey $SSL_DIR/ca.key -CAcreateserial -out $SSL_DIR/server.pem -days 3650 -sha256

# Generate client key and certificate
openssl genrsa -out $SSL_DIR/client.key 2048
openssl req -new -key $SSL_DIR/client.key -out $SSL_DIR/client.csr -subj "/C=IN/ST=Karnataka/L=Bengaluru/O=ITSM Tool/CN=client"
openssl x509 -req -in $SSL_DIR/client.csr -CA $SSL_DIR/ca.pem -CAkey $SSL_DIR/ca.key -CAcreateserial -out $SSL_DIR/client.pem -days 3650 -sha256

# Generate client key password
openssl rsa -in $SSL_DIR/client.key -out $SSL_DIR/client-key.pem -des3

# Clean up temporary files
rm $SSL_DIR/*.csr $SSL_DIR/*.srl

# Set permissions
chmod 600 $SSL_DIR/*.key $SSL_DIR/*.pem
chmod 644 $SSL_DIR/ca.pem

# Print paths for .env file
echo "MONGODB_SSL_CA=$SSL_DIR/ca.pem"
echo "MONGODB_SSL_CERT=$SSL_DIR/client.pem"
echo "MONGODB_SSL_KEY=$SSL_DIR/client-key.pem"
echo "MONGODB_SSL_PASS=your-ssl-password"  # You should set a secure password here
