#!/bin/bash
# Migration script for DIFFERENT servers (old → new)
# Use when edl-lesmaterialen and onderwijsmateriaal-buurtaal run on different CapRover hosts
#
# Usage:
#   ./scripts/migrate-from-edl-remote.sh OLD_SSH_HOST NEW_SSH_HOST
#
# Example (default servers):
#   ./scripts/migrate-from-edl-remote.sh root@captain.caprover.thomasg.be root@captain.hive.thomasg.be

set -e

if [ $# -lt 2 ]; then
  echo "Usage: $0 OLD_SSH_HOST NEW_SSH_HOST"
  echo "Example: $0 root@old.example.com root@new.example.com"
  exit 1
fi

OLD_HOST="$1"
NEW_HOST="$2"
WORK_DIR="/tmp/edl-migration-$$"
OLD_APP="edl-lesmaterialen-main"
NEW_APP="onderwijsmateriaal-buurtaal-main"

echo "=== EDL → Onderwijsmateriaal Migration (Cross-Server) ==="
echo "Source: $OLD_HOST"
echo "Target: $NEW_HOST"
echo ""

# Step 1: Find and dump MongoDB on OLD server
echo "=== Step 1: Dumping MongoDB on old server ==="
OLD_MONGO=$(ssh "$OLD_HOST" "docker ps -a --format '{{.Names}}' | grep -E '${OLD_APP}.*mongo|mongo.*${OLD_APP}' | head -1")
if [ -z "$OLD_MONGO" ]; then
  echo "Trying alternative: any mongo container..."
  OLD_MONGO=$(ssh "$OLD_HOST" "docker ps --format '{{.Names}}' | grep mongo | head -1")
fi
if [ -z "$OLD_MONGO" ]; then
  echo "ERROR: Could not find MongoDB container on old server"
  ssh "$OLD_HOST" "docker ps -a --format '{{.Names}}'"
  exit 1
fi
echo "Found MongoDB: $OLD_MONGO"

ssh "$OLD_HOST" "mkdir -p $WORK_DIR"
ssh "$OLD_HOST" "docker exec $OLD_MONGO mongodump --out=/tmp/dump"
ssh "$OLD_HOST" "docker cp $OLD_MONGO:/tmp/dump $WORK_DIR/mongo-dump"
ssh "$OLD_HOST" "docker exec $OLD_MONGO rm -rf /tmp/dump"

# Step 2: Copy dump to NEW server
echo ""
echo "=== Step 2: Transferring MongoDB dump to new server ==="
ssh "$NEW_HOST" "mkdir -p $WORK_DIR"
ssh "$OLD_HOST" "tar czf - -C $WORK_DIR mongo-dump" | ssh "$NEW_HOST" "tar xzf - -C $WORK_DIR"

# Step 3: Restore MongoDB on NEW server
echo ""
echo "=== Step 3: Restoring MongoDB on new server ==="
NEW_MONGO=$(ssh "$NEW_HOST" "docker ps -a --format '{{.Names}}' | grep -E '${NEW_APP}.*mongo|mongo.*${NEW_APP}' | head -1")
if [ -z "$NEW_MONGO" ]; then
  NEW_MONGO=$(ssh "$NEW_HOST" "docker ps --format '{{.Names}}' | grep mongo | head -1")
fi
if [ -z "$NEW_MONGO" ]; then
  echo "ERROR: Could not find MongoDB container on new server"
  exit 1
fi
echo "Found MongoDB: $NEW_MONGO"

ssh "$NEW_HOST" "docker cp $WORK_DIR/mongo-dump $NEW_MONGO:/tmp/dump"
ssh "$NEW_HOST" "docker exec $NEW_MONGO mongorestore --drop /tmp/dump"
ssh "$NEW_HOST" "docker exec $NEW_MONGO rm -rf /tmp/dump"

# Step 4: Copy uploads volume (via tar stream)
echo ""
echo "=== Step 4: Migrating uploads volume ==="
OLD_UPLOADS=$(ssh "$OLD_HOST" "docker volume ls -q | grep -E 'edl.*upload|upload.*edl' | head -1")
NEW_UPLOADS=$(ssh "$NEW_HOST" "docker volume ls -q | grep -E 'onderwijsmateriaal.*upload|upload.*onderwijsmateriaal' | head -1")

if [ -z "$OLD_UPLOADS" ]; then
  OLD_UPLOADS="captain--${OLD_APP}-uploads"
fi
if [ -z "$NEW_UPLOADS" ]; then
  NEW_UPLOADS="captain--${NEW_APP}-uploads"
fi

echo "Source volume: $OLD_UPLOADS"
echo "Target volume: $NEW_UPLOADS"

# Stream uploads: old server -> tar -> new server -> extract to volume
ssh "$OLD_HOST" "docker run --rm -v $OLD_UPLOADS:/data:ro alpine tar czf - -C /data ." | \
  ssh "$NEW_HOST" "docker run -i --rm -v $NEW_UPLOADS:/data alpine tar xzf - -C /data"

# Cleanup
echo ""
echo "=== Cleanup ==="
ssh "$OLD_HOST" "rm -rf $WORK_DIR"
ssh "$NEW_HOST" "rm -rf $WORK_DIR"

echo ""
echo "=== Migration complete ==="
echo "1. Restart onderwijsmateriaal-buurtaal-main in CapRover dashboard"
echo "2. Verify https://onderwijsmateriaal-buurtaal.nl/"
