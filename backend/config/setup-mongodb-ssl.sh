#!/bin/bash

# Create necessary directories
mkdir -p /data/db
mkdir -p /var/run/mongodb
mkdir -p /var/log/mongodb

# Set permissions
chown -R mongodb:mongodb /data/db
chown -R mongodb:mongodb /var/run/mongodb
chown -R mongodb:mongodb /var/log/mongodb

# Copy SSL certificates to MongoDB directory
SSL_DIR="/Users/sudhir/CascadeProjects/windsurf-project/itsm-tool/backend/config/ssl"

# Create symbolic links for certificates
ln -sf $SSL_DIR/ca.pem /etc/ssl/mongodb/ca.pem
ln -sf $SSL_DIR/server.pem /etc/ssl/mongodb/server.pem
ln -sf $SSL_DIR/client.pem /etc/ssl/mongodb/client.pem
ln -sf $SSL_DIR/client-key.pem /etc/ssl/mongodb/client-key.pem

# Set permissions for certificates
chmod 644 /etc/ssl/mongodb/*.pem
chmod 600 /etc/ssl/mongodb/client-key.pem

# Create MongoDB user if it doesn't exist
if ! id "mongodb" &>/dev/null; then
    useradd -r -s /bin/false mongodb
fi

# Set ownership of SSL certificates
chown mongodb:mongodb /etc/ssl/mongodb/*.pem

# Create MongoDB service file
SERVICE_FILE="/etc/systemd/system/mongodb.service"
if [ ! -f "$SERVICE_FILE" ]; then
    cat > $SERVICE_FILE << EOL
[Unit]
Description=High-performance, schema-free document-oriented database
After=network.target

[Service]
User=mongodb
ExecStart=/usr/bin/mongod --config /Users/sudhir/CascadeProjects/windsurf-project/itsm-tool/backend/config/mongodb.conf
Restart=always

[Install]
WantedBy=multi-user.target
EOL
fi

# Reload systemd and enable MongoDB
systemctl daemon-reload
systemctl enable mongodb

# Start MongoDB
systemctl start mongodb

# Check status
echo "MongoDB SSL/TLS configuration complete"
systemctl status mongodb --no-pager
