#!/bin/zsh
# Puts the furigana dictionary server online on Google Cloud Run.
# The password is read from ~/.config/furigana/server-secret and kept in Secret Manager.
set -e

PROJECT=furigana-for-sheets
REGION=us-west1
SECRET_FILE="$HOME/.config/furigana/server-secret"
export PATH="$HOME/.local/bin:$PATH"
cd "$(dirname "$0")"

echo "1/3 Saving the server password in Secret Manager..."
gcloud services enable secretmanager.googleapis.com --project "$PROJECT"
if ! gcloud secrets describe furigana-secret --project "$PROJECT" >/dev/null 2>&1; then
  gcloud secrets create furigana-secret --project "$PROJECT" --replication-policy=automatic --data-file="$SECRET_FILE"
fi
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding furigana-secret --project "$PROJECT" \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role=roles/secretmanager.secretAccessor --format=none

echo "2/3 Building and deploying the server (takes a few minutes)..."
gcloud run deploy furigana-server --source . --region "$REGION" --project "$PROJECT" \
  --allow-unauthenticated --max-instances 2 --min-instances 0 \
  --memory 512Mi --cpu 1 --concurrency 20 --timeout 30 \
  --set-secrets FURIGANA_SECRET=furigana-secret:latest --quiet

echo "3/3 Done. Server address:"
gcloud run services describe furigana-server --region "$REGION" --project "$PROJECT" --format='value(status.url)'
