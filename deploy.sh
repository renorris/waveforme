# Waveforme deploy.sh
# Copyright (C) 2023 Reese Norris - All Rights Reserved

# Kill dist
rm -r dist

# Build browser dist files
echo "Building browser files"
webpack --config webpack.config.browser.js --env IS_OFFLINE=false

# Deploy lambda functions
echo "Deploying lambda functions"
sls deploy

# Compress files with gzip
echo "Compressing files"
find dist \( -iname '*.html' -o -iname '*.htm' -o -iname '*.css' -o -iname '*.js' -o -iname '*.xml' -o -iname '*.txt' \) -exec gzip -v9 -n {} \; -exec mv {}.gz {} \;

# Upload to waveforme-dist S3
echo "Syncing S3 dist bucket"

# Delete all existing files
echo "Deleting current objects"
aws s3 rm s3://waveforme-dist --recursive

# Upload all gzipped files flagged as gzip
echo "Uploading gzip files"
aws s3 sync dist/ s3://waveforme-dist --exclude '*' --include '*.html' --include '*.htm' --include '*.css' --include '*.js' --include '*.xml' --include '*.txt' --content-encoding 'gzip'

# Upload all other files
echo "Uploading all other files"
aws s3 sync dist/ s3://waveforme-dist --exclude '*.html' --exclude '*.htm' --exclude '*.css' --exclude '*.js' --exclude '*.xml' --exclude '*.txt'