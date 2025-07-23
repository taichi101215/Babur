const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const lineY = 600;
const hitWindow = 50;
const noteSpeed = 3;
const lanes = ['D', 'F', 'J', 'K'];
const laneX = { 'D': 100, 'F': 200, 'J': 300, 'K': 400 };

let notes = [];
let score = 0;
let songStartTime = 0;
let audio = null;
let animationId;

// サンプル譜面データ
const chart = [
  { time: 1.0, key: 'D' },
  { time: 2.0, key: 'F' },
  { time: 3.0, key: 'J' },
  { time: 4.0, key: 'K' },
  { time: 5.0, key: 'D' },
  { time: 6.0, key: 'F' },
];

document.getElementById('audioInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    audio = new Audio(url);
    startGame();
  }
});

function startGame() {
  notes = chart.map(n => ({ ...n, y: -1000, hit: false, timeMs: n.time * 1000 }));
  songStartTime = performance.now();
  audio.play();
  gameLoop();
}

document.addEventListener('keydown', e => {
  const key = e.key.toUpperCase();
  handleInput(key);
});

canvas.addEventListener('touchstart', e => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  let tappedKey = null;
  if (x < 150) tappedKey = 'D';
  else if (x < 250) tappedKey = 'F';
  else if (x < 350) tappedKey = 'J';
  else tappedKey = 'K';
  handleInput(tappedKey);
});

function handleInput(key) {
  if (!lanes.includes(key)) return;
  const currentTime = performance.now() - songStartTime;
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    if (!note.hit && note.key === key && Math.abs(note.timeMs - currentTime) < hitWindow * 10) {
      note.hit = true;
      score += 100;
      showHitEffect(note);
      return;
    }
  }
  score -= 50;
}

function showHitEffect(note) {
  const flash = { x: laneX[note.key], y: lineY, alpha: 1.0 };
  const fade = () => {
    flash.alpha -= 0.05;
    if (flash.alpha <= 0) return;
    ctx.fillStyle = `rgba(255,255,0,${flash.alpha})`;
    ctx.beginPath();
    ctx.arc(flash.x + 25, flash.y, 30, 0, 2 * Math.PI);
    ctx.fill();
    requestAnimationFrame(fade);
  };
  fade();
}

function gameLoop() {
  const currentTime = performance.now() - songStartTime;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, lineY, canvas.width, 4);

  ctx.font = '20px sans-serif';
  for (let note of notes) {
    if (note.hit) continue;
    note.y = ((note.timeMs - currentTime) / 1000) * noteSpeed * 60;
    if (note.y > lineY + 50) continue;
    ctx.fillStyle = 'cyan';
    ctx.fillRect(laneX[note.key], note.y, 50, 20);
  }

  ctx.fillStyle = 'lime';
  ctx.fillText("SCORE: " + score, 20, 40);

  animationId = requestAnimationFrame(gameLoop);
}
