# Snake and Ladder (JavaScript)

Simple, single-page Snake and Ladder for 2 players. Open `index.html` in a browser and play.

## How to run
- Open the folder `snake-ladders-js/`.
- Double-click `index.html` to open in your browser.

## Rules
- Roll 1–6 to move forward.
- Land on ladder base to climb; land on snake head to slide down.
- You must land exactly on 100 to win (overshoot = no move).

## Files
- `index.html` – page layout and controls.
- `style.css` – board and UI styling.
- `script.js` – game logic (board generation, turns, dice, snakes/ladders, win).

## Animations
- Snakes and ladders are rendered as SVG paths in `index.html` overlay (`<svg id="overlay">`).
- When you land on a snake/ladder, the token animates along the path (see `animateTeleport()` in `script.js`).
- Paths redraw responsively on resize.

---

# Git and Docker workflow

## 1) Clone the repo
```bash
git clone <your-repo-url> snake-ladders-js
cd snake-ladders-js
```

If you used this template locally, initialize a new repo:
```bash
git init
git add .
git commit -m "feat: snake & ladder with SVG animations and Docker"
```

## 2) Run locally without Docker
- Open `index.html` directly in a browser, or
- Serve with a simple HTTP server (optional):
```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

## 3) Build Docker image
Requirements: Docker Desktop or Docker Engine

Using the helper script:
```bash
chmod +x docker-build.sh
./docker-build.sh
```

Or directly:
```bash
docker build -t snake-ladders:latest .
```

## 4) Run container
Using the helper script:
```bash
chmod +x docker-run.sh
./docker-run.sh
# Opens on http://localhost:8080
```

Or directly:
```bash
docker run --rm -p 8080:80 --name snake-ladders snake-ladders:latest
# Visit http://localhost:8080
```

## 5) Push to registry (Docker Hub example)
```bash
# Log in first
docker login

# Tag image for your namespace
docker tag snake-ladders:latest <dockerhub-username>/snake-ladders:latest

# Push
docker push <dockerhub-username>/snake-ladders:latest
```

## 6) Deploy from a Docker container (any host)
On your server/VM with Docker installed:
```bash
docker pull <dockerhub-username>/snake-ladders:latest
docker run -d --restart unless-stopped -p 80:80 --name snake-ladders <dockerhub-username>/snake-ladders:latest
# App will be available on http://<server-ip>/
```

If port 80 is occupied, use another port:
```bash
docker run -d -p 8080:80 --name snake-ladders <dockerhub-username>/snake-ladders:latest
# http://<server-ip>:8080
```

## Notes
- Static hosting is served by Nginx configured in `nginx.conf`.
- Docker context is controlled by `.dockerignore`.
- Modify snakes/ladders mapping in `teleports` inside `script.js`.
