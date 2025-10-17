#!/usr/bin/env sh
set -e
IMAGE_NAME=${IMAGE_NAME:-snake-ladders:latest}

echo "Building image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" .

echo "Done."
