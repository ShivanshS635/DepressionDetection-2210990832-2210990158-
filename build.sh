#!/usr/bin/env bash
set -e

echo "=== Installing Git LFS (standalone binary) ==="
curl -sL https://github.com/git-lfs/git-lfs/releases/download/v3.5.1/git-lfs-linux-amd64-v3.5.1.tar.gz -o git-lfs.tar.gz
tar -xzf git-lfs.tar.gz
mv git-lfs-3.5.1/git-lfs ./git-lfs-bin
rm -rf git-lfs.tar.gz git-lfs-3.5.1
./git-lfs-bin install --force
./git-lfs-bin pull

echo "=== Installing backend dependencies ==="
cd SourceCode/backend-node
npm install

echo "=== Build complete ==="
