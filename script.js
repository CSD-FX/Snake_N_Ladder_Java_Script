// Basic Snake and Ladder implementation for 2 players
(function(){
  const boardEl = document.getElementById('board');
  const overlay = document.getElementById('overlay');
  const boardWrap = boardEl.parentElement;
  const rollBtn = document.getElementById('rollBtn');
  const resetBtn = document.getElementById('resetBtn');
  const diceEl = document.getElementById('dice');
  const turnLabel = document.getElementById('turnLabel');

  // Snakes and ladders mapping: start -> end
  // Ladders: start < end, Snakes: start > end
  const teleports = {
    3: 22, 5: 8, 11: 26, 20: 29, // ladders
    17: 4, 19: 7, 21: 9, 27: 1,  // snakes
    36: 44, 39: 59, 40: 64, 52: 72, // ladders
    50: 34, 54: 31, 62: 18, 63: 60,  // snakes
    70: 90, 71: 92, 80: 99,         // ladders
    73: 53, 84: 28, 87: 24, 94: 74, 98: 79 // snakes
  };

  const players = [
    { id: 0, name: 'Player 1', pos: 1, colorClass: 'token-p1' },
    { id: 1, name: 'Player 2', pos: 1, colorClass: 'token-p2' }
  ];
  let turn = 0; // 0 or 1
  let gameOver = false;

  function buildBoard(){
    boardEl.innerHTML = '';
    const cells = [];
    // Create serpentine numbering 1..100
    let num = 100;
    for(let r=0; r<10; r++){
      const row = [];
      for(let c=0; c<10; c++){
        const index = r % 2 === 0 ? (9 - c) : c; // alternate direction each row from top
        const n = num - index;
        const cell = document.createElement('div');
        cell.className = 'cell';
        if(teleports[n] && teleports[n] > n) cell.classList.add('ladder');
        if(teleports[n] && teleports[n] < n) cell.classList.add('snake');
        const numEl = document.createElement('div');
        numEl.className = 'num';
        numEl.textContent = String(n);
        const tokensEl = document.createElement('div');
        tokensEl.className = 'tokens';
        tokensEl.dataset.for = n;
        cell.appendChild(numEl);
        cell.appendChild(tokensEl);
        row.push(cell);
      }
      // Append row
      row.forEach(cell => boardEl.appendChild(cell));
      num -= 10;
    }
    updateTokens();
    drawOverlayPaths();
  }

  function cellTokensEl(n){
    return boardEl.querySelector(`.tokens[data-for="${n}"]`);
  }

  // Convert board number to grid row/col (0-based from top-left)
  function numberToGrid(n){
    const row = Math.floor((100 - n) / 10);
    const rowStart = 100 - row * 10; // highest number in that row
    const isEvenRow = (row % 2) === 0; // matches buildBoard
    let col;
    if(isEvenRow){
      // numbers go 91..100 (row 0) left->right
      col = 9 - (rowStart - n);
    } else {
      // numbers go 81..90 (row 1) left->right
      col = n - (rowStart - 9);
    }
    return { row, col };
  }

  // Get center position (px) inside overlay for a cell number
  function cellCenter(n){
    const { row, col } = numberToGrid(n);
    const wrapRect = boardWrap.getBoundingClientRect();
    const size = Math.min(wrapRect.width, wrapRect.height);
    const x = (col + 0.5) / 10 * size;
    const y = (row + 0.5) / 10 * size;
    return { x, y };
  }

  function pathId(from, to){
    return `path-${from}-${to}`;
  }

  function drawOverlayPaths(){
    // clear
    overlay.innerHTML = '';
    // set viewBox sized to square 0..size
    const wrapRect = boardWrap.getBoundingClientRect();
    const size = Math.min(wrapRect.width, wrapRect.height);
    overlay.setAttribute('viewBox', `0 0 ${size} ${size}`);

    Object.entries(teleports).forEach(([fromStr, to]) => {
      const from = Number(fromStr);
      const a = cellCenter(from);
      const b = cellCenter(to);
      // Curved cubic path with control points offset perpendicular to line
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len; // normal x
      const ny = dx / len;  // normal y
      const bulge = 20 + Math.min(40, len * 0.25); // curve amount
      const c1x = a.x + dx * 0.33 + nx * bulge;
      const c1y = a.y + dy * 0.33 + ny * bulge;
      const c2x = a.x + dx * 0.66 - nx * bulge;
      const c2y = a.y + dy * 0.66 - ny * bulge;
      const d = `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('id', pathId(from, to));
      path.classList.add('path', to > from ? 'path-ladder' : 'path-snake');
      overlay.appendChild(path);
    });
  }

  function updateTokens(){
    // Clear all tokens
    boardEl.querySelectorAll('.tokens').forEach(t => t.innerHTML = '');
    // Place tokens
    for(const p of players){
      const el = cellTokensEl(p.pos);
      const dot = document.createElement('div');
      dot.className = `token ${p.colorClass}`;
      dot.title = `${p.name}: ${p.pos}`;
      el.appendChild(dot);
    }
  }

  function animateMove(p, steps, done){
    if(steps <= 0) return done();
    p.pos += 1;
    updateTokens();
    setTimeout(() => animateMove(p, steps - 1, done), 180);
  }

  function animateTeleport(p, from, to, done){
    const path = overlay.querySelector(`#${CSS.escape(pathId(from, to))}`);
    if(!path){
      // fallback: instant
      done();
      return;
    }
    const length = path.getTotalLength();
    const ghost = document.createElement('div');
    ghost.className = `token token-ghost ${p.colorClass}`;
    boardWrap.appendChild(ghost);
    let t0;
    const duration = Math.max(600, Math.min(1600, length * 4));
    function step(ts){
      if(!t0) t0 = ts;
      const k = Math.min(1, (ts - t0) / duration);
      const pt = path.getPointAtLength(k * length);
      ghost.style.left = `${pt.x}px`;
      ghost.style.top = `${pt.y}px`;
      if(k < 1){
        requestAnimationFrame(step);
      } else {
        ghost.remove();
        done();
      }
    }
    requestAnimationFrame(step);
  }

  function rollDice(){
    if(gameOver) return;
    const p = players[turn];
    const roll = 1 + Math.floor(Math.random()*6);
    diceEl.textContent = String(roll);

    const target = p.pos + roll;
    if(target > 100){
      // must land exactly; no move
      nextTurn();
      return;
    }

    animateMove(p, roll, () => {
      // After moving, handle snake or ladder
      const dest = teleports[p.pos];
      if(dest){
        const from = p.pos;
        animateTeleport(p, from, dest, () => {
          p.pos = dest;
          updateTokens();
          if(p.pos === 100){
            gameOver = true;
            showWin(p.name);
            return;
          }
          nextTurn();
        });
      } else {
        updateTokens();
        if(p.pos === 100){
          gameOver = true;
          showWin(p.name);
          return;
        }
        nextTurn();
      }
    });
  }

  function nextTurn(){
    if(gameOver) return;
    turn = (turn + 1) % players.length;
    turnLabel.textContent = players[turn].name;
  }

  function reset(){
    players.forEach(p => p.pos = 1);
    turn = 0; gameOver = false;
    diceEl.textContent = '-';
    turnLabel.textContent = players[turn].name;
    updateTokens();
    hideWin();
  }

  // Win banner
  let bannerEl;
  function ensureBanner(){
    if(bannerEl) return bannerEl;
    bannerEl = document.createElement('div');
    bannerEl.className = 'win-banner';
    bannerEl.innerHTML = `
      <div class="win-card">
        <h3 id="winText"></h3>
        <button id="playAgainBtn">Play again</button>
      </div>
    `;
    document.body.appendChild(bannerEl);
    bannerEl.addEventListener('click', (e)=>{
      if(e.target === bannerEl) hideWin();
    });
    bannerEl.querySelector('#playAgainBtn').addEventListener('click', ()=>{
      hideWin();
      reset();
    });
    return bannerEl;
  }

  function showWin(name){
    const b = ensureBanner();
    b.querySelector('#winText').textContent = `${name} wins!`;
    b.classList.add('active');
  }
  function hideWin(){
    const b = ensureBanner();
    b.classList.remove('active');
  }

  // Wire up controls
  rollBtn.addEventListener('click', rollDice);
  resetBtn.addEventListener('click', reset);

  // Init
  buildBoard();
  // Recompute overlay on resize
  window.addEventListener('resize', () => {
    drawOverlayPaths();
  });
})();
