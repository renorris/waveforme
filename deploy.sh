# Build browser dist files
echo "Building browser files"
npm run build:browser

# Deploy lambda functions
echo "Deploying lambda functions"
sls deploy

# Upload to waveforme-dist S3
echo "Syncing S3 dist bucket"
aws s3 sync dist/ s3://waveforme-dist --delete