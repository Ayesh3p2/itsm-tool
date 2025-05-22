# ITSM Tool

A modern IT Service Management tool built with React and Node.js, featuring comprehensive security, monitoring, and deployment automation.

## Features

- Secure MongoDB Atlas integration
- Real-time monitoring dashboard
- Automated backups
- Rate limiting and security protection
- SSL/TLS support
- CI/CD pipeline
- Prometheus metrics
- Detailed logging

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Cloud Platform account
- Firebase account
- GitHub account

## Environment Variables

Create `.env` files in both frontend and backend directories:

### Backend `.env`
```
# MongoDB Configuration
MONGODB_ATLAS_URI=your-atlas-uri
MONGODB_ATLAS_USER=your-atlas-user
MONGODB_ATLAS_PASS=your-atlas-password
MONGODB_SSL_CA=path/to/ca.pem
MONGODB_SSL_CERT=path/to/cert.pem
MONGODB_SSL_KEY=path/to/key.pem
MONGODB_SSL_PASS=your-ssl-password

# Security
JWT_SECRET=your-secret-key
ALLOWED_IPS=192.168.1.1,192.168.1.2
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
BACKUP_DIR=/path/to/backups
BACKUP_RETENTION_DAYS=7
BACKUP_INTERVAL_MINUTES=60
MAX_BACKUP_SIZE_MB=100
MAX_BACKUP_FILES=10

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT=your-service-account.json

# Google Cloud
GCP_PROJECT_ID=your-project-id
GCP_SA_KEY=your-service-account-key.json
```

### Frontend `.env`
```
REACT_APP_API_URL=https://your-backend-url
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/itsm-tool.git
cd itsm-tool
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
- Copy `.env.example` files to `.env` in both frontend and backend directories
- Update the values with your configuration

4. Start the development servers:
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in a new terminal)
cd frontend
npm start
```

## Deployment

1. Set up GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/itsm-tool.git
git push -u origin main
```

2. Configure GitHub Secrets:
- Go to your repository settings
- Navigate to "Secrets and variables" > "Actions"
- Add the following secrets:
  - `FIREBASE_SERVICE_ACCOUNT`
  - `GCP_SA_KEY`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `BACKUP_DIR`
  - `BACKUP_RETENTION_DAYS`
  - `BACKUP_INTERVAL_MINUTES`
  - `MAX_BACKUP_SIZE_MB`
  - `MAX_BACKUP_FILES`

3. Set up Firebase:
```bash
firebase init
```
- Select hosting
- Configure your project
- Deploy: `firebase deploy`

4. Set up Google Cloud:
```bash
gcloud auth login
```
- Enable required APIs
- Configure Cloud Run
- Deploy: `gcloud run deploy`

## Monitoring

The application includes a monitoring dashboard accessible at `/monitoring` that shows:
- Database query metrics
- Security events
- Backup status
- Performance metrics

## Security Features

- Rate limiting
- CORS protection
- XSS prevention
- CSRF protection
- SSL/TLS encryption
- Automated backups
- Security monitoring
- Detailed logging

## License

MIT
