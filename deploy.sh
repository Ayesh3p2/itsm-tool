#!/bin/bash

# Ensure we're in the project root
cd $(dirname "$0")

# Build and deploy frontend
echo "Building and deploying frontend..."
cd frontend
npm run build
firebase deploy

echo "Frontend deployed successfully"

cd ../backend

echo "Building and deploying backend..."

# Build the Docker image
docker build -t itsm-backend .

# Push to Google Container Registry
gcloud auth configure-docker
docker tag itsm-backend gcr.io/${PROJECT_ID}/itsm-backend
docker push gcr.io/${PROJECT_ID}/itsm-backend

# Deploy to Cloud Run
gcloud run deploy itsm-backend \
  --image gcr.io/${PROJECT_ID}/itsm-backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "MONGODB_URI=${MONGODB_URI},
    JWT_SECRET=${JWT_SECRET},
    SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN},
    SLACK_SIGNING_SECRET=${SLACK_SIGNING_SECRET},
    EMAIL_USER=${EMAIL_USER},
    EMAIL_PASS=${EMAIL_PASS},
    FRONTEND_URL=${FRONTEND_URL},
    SLACK_APPROVAL_CHANNEL=${SLACK_APPROVAL_CHANNEL},
    MONGODB_SSL_CA=${MONGODB_SSL_CA},
    MONGODB_SSL_CERT=${MONGODB_SSL_CERT},
    MONGODB_SSL_KEY=${MONGODB_SSL_KEY},
    MONGODB_SSL_PASS=${MONGODB_SSL_PASS}"

echo "Backend deployed successfully"

echo "Deployment complete!"

echo "Frontend URL: https://$(firebase hosting:sites:list | grep default | awk '{print $2}')"
echo "Backend URL: $(gcloud run services describe itsm-backend --region us-central1 --platform managed --format 'value(status.url)')"
