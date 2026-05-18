#!/usr/bin/env bash
set -e

echo "=== Installing Git LFS ==="
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash
apt-get install -y git-lfs
git lfs install
git lfs pull

echo "=== Installing backend dependencies ==="
cd SourceCode/backend-node
npm install

echo "=== Build complete ==="
