# Migration: edl-lesmaterialen → onderwijsmateriaal-buurtaal

This guide covers migrating from the old production server to the new one.

## Overview

| | Old | New |
|---|---|---|
| **CapRover server** | captain.caprover.thomasg.be | captain.hive.thomasg.be |
| **URL** | https://edl-lesmaterialen.in-ontwikkeling.be/ | https://onderwijsmateriaal-buurtaal.nl/ |
| **CapRover app** | edl-lesmaterialen-main | onderwijsmateriaal-buurtaal-main |
| **MongoDB** | mongo:4 | mongo:8 |
| **Uploads volume** | edl-lesmaterialen-main-uploads | onderwijsmateriaal-buurtaal-main-uploads |

## Prerequisites

- SSH access to the CapRover server(s)
- Both apps deployed (old can be stopped after migration)

## Option A: Same server (both apps on one CapRover)

If both apps run on the same CapRover instance:

```bash
# SSH to your server first
ssh root@your-caprover-server

# Then run the migration script locally
cd /path/to/onderwijsmateriaal-buurtaal
chmod +x scripts/migrate-from-edl.sh
./scripts/migrate-from-edl.sh
```

Or run remotely:

```bash
./scripts/migrate-from-edl.sh root@your-caprover-server
```

## Option B: Different servers (migration between hosts)

The old and new apps run on different CapRover servers:

```bash
chmod +x scripts/migrate-from-edl-remote.sh
./scripts/migrate-from-edl-remote.sh root@captain.caprover.thomasg.be root@captain.hive.thomasg.be
```

## Manual steps (if scripts fail)

### 1. MongoDB migration

```bash
# On OLD server - find MongoDB container and dump
docker ps -a  # find container name (e.g. srv-captain--edl-lesmaterialen-main-mongo--0)
docker exec <OLD_MONGO_CONTAINER> mongodump --out=/tmp/dump
docker cp <OLD_MONGO_CONTAINER>:/tmp/dump ./mongo-dump

# Transfer dump to new server (if different)
scp -r ./mongo-dump root@new-server:/tmp/

# On NEW server - restore
docker cp /tmp/mongo-dump <NEW_MONGO_CONTAINER>:/tmp/dump
docker exec <NEW_MONGO_CONTAINER> mongorestore --drop /tmp/dump
```

### 2. Uploads volume migration

```bash
# List volumes to find exact names
docker volume ls | grep -E 'edl|onderwijsmateriaal|upload'

# Copy volume contents (run on server with both volumes, or use tar stream for cross-server)
docker run --rm \
  -v captain--edl-lesmaterialen-main-uploads:/source:ro \
  -v captain--onderwijsmateriaal-buurtaal-main-uploads:/dest \
  alpine sh -c "cp -a /source/. /dest/"
```

**Cross-server volume copy** (stream via SSH):

```bash
# From your local machine
ssh old-server "docker run --rm -v captain--edl-lesmaterialen-main-uploads:/data:ro alpine tar czf - -C /data ." | \
  ssh new-server "docker run -i --rm -v captain--onderwijsmateriaal-buurtaal-main-uploads:/data alpine tar xzf - -C /data"
```

## Post-migration

1. **Restart the app** in CapRover dashboard: onderwijsmateriaal-buurtaal-main
2. **Verify** at https://onderwijsmateriaal-buurtaal.nl/
3. **Check** that media uploads and course materials display correctly
4. **Decommission** the old edl-lesmaterialen app when satisfied

## Notes

- CapRover volume names may use `captain--` or `srv-captain--` prefixes
- MongoDB 4 → 8: `mongodump`/`mongorestore` are compatible
- The `--drop` flag in mongorestore replaces existing data; omit if you need to merge
