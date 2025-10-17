#!/usr/bin/env sh
set -e
IMAGE_NAME=${IMAGE_NAME:-snake-ladders:latest}
CONTAINER_NAME=${CONTAINER_NAME:-snake-ladders}
PORT=${PORT:-8080}

echo "Running $IMAGE_NAME on http://localhost:$PORT"
exec docker run --rm -p "$PORT:80" --name "$CONTAINER_NAME" "$IMAGE_NAME"
