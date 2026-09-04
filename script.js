/**
 * Romantic Surprise Website - Interactive Script
 * Features: Web Audio API Music Box, Real-time Love Timer, Canvas Particles & Fireworks,
 * Polaroid Gallery, Typewriter Letter, Interactive Runaway "No" Button, Settings Customizer.
 */

// ==========================================
// 1. CONFIGURATION & LOCAL STORAGE
// ==========================================
const DEFAULT_CONFIG = {
  myName: 'น้องเพชร',
  loverName: 'พี่ฟ้า',
  annivDate: '2026-07-29',
  letterContent: `ถึง พี่ฟ้า คนน่ารักของน้องเพชร,

ตั้งแต่วันแรกที่เราได้เริ่มคุยกันโลกของน้องเพชรก็เปลี่ยนไป มีแต่ความสดใส รอยยิ้ม และความอบอุ่นในใจทุกครั้งที่ได้คุยกับพี่ฟ้า

ขอบคุณสำหรับทุกๆ บทสนทนาที่เราได้คุยกันน้าา และความน่ารักที่พี่ฟ้ามอบให้น้องเพชรเสมอมา 

บางทีผมอาจจะขึ้น้อยใจไปบ้าง ก็ไม่บ้างหรอกครับเยอะเลย แต่น้องเพชรก็รักพี่ฟ้าน้าา อยากอยู่กับพี่ฟ้าไปนานๆเลยย พิมพ์แล้วก็เขิน อิอิ แต่ก็เป็นเรื่องจริงจากใจน้องเพชรน้าา 

พี่เป็นคนที่อบอุ่นมากก อยู่เป็นเพื่อนผมได้ตลอดเลย เวลาเล่าอะไรให้พี่ฟังพี่ก็รับฟังเสมอนี่แหละพี่ผมชอบพี่ ชอบมากๆๆๆๆๆๆ ก ไก่ล้านตัว รักพี่ฟ้า รักพี่ฟ้าา`
};

let config = { ...DEFAULT_CONFIG };

// Load saved config if exists
function loadConfig() {
  try {
    const saved = localStorage.getItem('romantic_web_config_v2');
    if (saved) {
      config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } else {
      config = { ...DEFAULT_CONFIG };
    }
  } catch (e) {
    console.warn('Could not load config from localStorage', e);
  }
  applyConfigToUI();
}

function saveConfig() {
  try {
    localStorage.setItem('romantic_web_config_v2', JSON.stringify(config));
  } catch (e) {
    console.warn('Could not save config to localStorage', e);
  }
  applyConfigToUI();
}

function formatThaiDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // พ.ศ.
  return `${day} ${month} ${year}`;
}

function applyConfigToUI() {
  document.getElementById('display-lover-name').textContent = config.loverName;
  document.getElementById('display-lover-name-badge').textContent = config.loverName;
  document.getElementById('display-my-name').textContent = config.myName;
  document.getElementById('letter-to-name').textContent = config.loverName;
  document.getElementById('letter-from-name').textContent = config.myName;
  document.getElementById('paper-lover-name').textContent = config.loverName;
  document.getElementById('paper-my-name').textContent = `${config.myName} ❤️`;
  document.getElementById('footer-lover-name').textContent = config.loverName;

  const formattedDate = formatThaiDate(config.annivDate);
  document.getElementById('display-anniv-date-text').textContent = `เริ่มคุยและรู้จักกันตั้งแต่วันที่ ${formattedDate}`;

  // Populate settings form inputs
  document.getElementById('input-my-name').value = config.myName;
  document.getElementById('input-lover-name').value = config.loverName;
  document.getElementById('input-anniv-date').value = config.annivDate;
  document.getElementById('input-custom-letter').value = config.letterContent;
}

// ==========================================
// 2. REAL-TIME LOVE COUNTER
// ==========================================
function updateLoveTimer() {
  const startDate = new Date(config.annivDate + 'T00:00:00');
  const now = new Date();

  let diff = now - startDate;
  if (isNaN(diff) || diff < 0) {
    diff = 0;
  }

  const secondsTotal = Math.floor(diff / 1000);
  const days = Math.floor(secondsTotal / (3600 * 24));
  const hours = Math.floor((secondsTotal % (3600 * 24)) / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = Math.floor(secondsTotal % 60);

  document.getElementById('timer-days').textContent = days.toLocaleString();
  document.getElementById('timer-hours').textContent = hours.toString().padStart(2, '0');
  document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
  document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');
}

setInterval(updateLoveTimer, 1000);

// ==========================================
// 3. WEB AUDIO API - ROMANTIC MUSIC BOX & SOUND EFFECTS
// ==========================================
class RomanticAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timerId = null;
    this.noteIndex = 0;

    // Background MP3 audio element
    this.bgAudio = new Audio('assets/music.mp3');
    this.bgAudio.loop = true;
    this.bgAudio.volume = 0.7;
    this.usingCustomAudio = true;

    this.bgAudio.addEventListener('error', () => {
      console.warn('assets/music.mp3 could not be loaded, fallback to music box chimes.');
      this.usingCustomAudio = false;
    });

    this.bgAudio.addEventListener('play', () => {
      this.isPlaying = true;
      updateEqualizerUI(true);
    });

    this.bgAudio.addEventListener('pause', () => {
      this.isPlaying = false;
      updateEqualizerUI(false);
    });

    // Sweet romantic chime melody notes (Frequencies in Hz) - Fallback
    this.melody = [
      523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
      880.00, 783.99, 659.25, 587.33,  // A5, G5, E5, D5
      523.25, 587.33, 659.25, 783.99,  // C5, D5, E5, G5
      659.25, 587.33, 523.25, 440.00,  // E5, D5, C5, A4
      493.88, 523.25, 587.33, 659.25,  // B4, C5, D5, E5
      783.99, 880.00, 1046.50, 987.77, // G5, A5, C6, B5
      880.00, 783.99, 659.25, 587.33,  // A5, G5, E5, D5
      523.25, 659.25, 783.99, 523.25   // C5, E5, G5, C5
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime(freq, time = 0, duration = 1.2, volume = 0.15) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + time);

    gain.gain.setValueAtTime(0, this.ctx.currentTime + time);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + time);
    osc.stop(this.ctx.currentTime + time + duration);
  }

  playSuccessChime() {
    this.init();
    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chords.forEach((freq, idx) => {
      this.playChime(freq, idx * 0.1, 1.8, 0.22);
    });
  }

  playSparkleSound() {
    this.init();
    const notes = [659.25, 783.99, 987.77, 1174.66, 1318.51];
    notes.forEach((freq, idx) => {
      this.playChime(freq, idx * 0.08, 0.9, 0.18);
    });
  }

  startMelody() {
    this.init();
    if (this.usingCustomAudio && this.bgAudio) {
      const playPromise = this.bgAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            updateEqualizerUI(true);
          })
          .catch((err) => {
            console.warn('Audio play error, falling back to synth chimes:', err);
            this.usingCustomAudio = false;
            this.startSynthMelody();
          });
      }
    } else {
      this.startSynthMelody();
    }
  }

  startSynthMelody() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const playNext = () => {
      if (!this.isPlaying) return;
      const freq = this.melody[this.noteIndex];
      this.playChime(freq, 0, 1.4, 0.14);

      if (this.noteIndex % 4 === 0) {
        this.playChime(freq * 0.5, 0, 1.8, 0.08);
      }

      this.noteIndex = (this.noteIndex + 1) % this.melody.length;
      this.timerId = setTimeout(playNext, 450);
    };

    playNext();
    updateEqualizerUI(true);
  }

  stopMelody() {
    this.isPlaying = false;
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    updateEqualizerUI(false);
  }

  toggle() {
    if (this.isPlaying) {
      this.stopMelody();
    } else {
      this.startMelody();
    }
  }
}

const romanticAudio = new RomanticAudio();

function updateEqualizerUI(playing) {
  const eq = document.getElementById('equalizer');
  const icon = document.getElementById('music-icon');
  if (playing) {
    eq.classList.add('playing');
    icon.textContent = '🎶';
  } else {
    eq.classList.remove('playing');
    icon.textContent = '🎵';
  }
}

// ==========================================
// 4. FLOATING PARTICLES (HEARTS, PETALS & SPARKLES)
// ==========================================
const pCanvas = document.getElementById('particles-canvas');
const pCtx = pCanvas.getContext('2d');

let particles = [];
const PARTICLE_COUNT = 32;

function resizeParticleCanvas() {
  pCanvas.width = window.innerWidth;
  pCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeParticleCanvas);
resizeParticleCanvas();

class AmbientParticle {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * pCanvas.width;
    this.y = initial ? Math.random() * pCanvas.height : pCanvas.height + 20;
    this.size = 12 + Math.random() * 16;
    this.speedY = 0.6 + Math.random() * 1.2;
    this.speedX = (Math.random() - 0.5) * 0.8;
    this.opacity = 0.25 + Math.random() * 0.5;
    this.angle = Math.random() * Math.PI * 2;
    this.angularSpeed = (Math.random() - 0.5) * 0.03;
    // Types: 0: Heart, 1: Rose Petal, 2: Sparkle Star
    this.type = Math.floor(Math.random() * 3);
    this.color = ['#ff8fa3', '#ff758f', '#f472b6', '#fb7185', '#fca5a5'][Math.floor(Math.random() * 5)];
  }

  update() {
    this.y -= this.speedY;
    this.x += Math.sin(this.angle) * 0.8 + this.speedX;
    this.angle += this.angularSpeed;

    if (this.y < -30 || this.x < -30 || this.x > pCanvas.width + 30) {
      this.reset();
    }
  }

  draw() {
    pCtx.save();
    pCtx.translate(this.x, this.y);
    pCtx.rotate(this.angle);
    pCtx.globalAlpha = this.opacity;

    if (this.type === 0) {
      // Draw Heart
      pCtx.fillStyle = this.color;
      const s = this.size * 0.6;
      pCtx.beginPath();
      pCtx.moveTo(0, s * 0.3);
      pCtx.bezierCurveTo(-s, -s * 0.6, -s * 1.2, s * 0.4, 0, s * 1.2);
      pCtx.bezierCurveTo(s * 1.2, s * 0.4, s, -s * 0.6, 0, s * 0.3);
      pCtx.fill();
    } else if (this.type === 1) {
      // Draw Rose Petal
      pCtx.fillStyle = this.color;
      pCtx.beginPath();
      pCtx.ellipse(0, 0, this.size * 0.7, this.size * 0.35, Math.PI / 4, 0, Math.PI * 2);
      pCtx.fill();
    } else {
      // Draw Sparkle
      pCtx.fillStyle = '#fde047';
      const s = this.size * 0.4;
      pCtx.beginPath();
      for (let i = 0; i < 4; i++) {
        pCtx.lineTo(0, -s);
        pCtx.lineTo(s * 0.25, -s * 0.25);
        pCtx.rotate(Math.PI / 2);
      }
      pCtx.fill();
    }

    pCtx.restore();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push(new AmbientParticle());
}

function animateParticles() {
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

animateParticles();

// ==========================================
// 5. HEART FIREWORKS & CONFETTI SYSTEM
// ==========================================
const cCanvas = document.getElementById('confetti-canvas');
const cCtx = cCanvas.getContext('2d');
let confettiPieces = [];

function resizeConfettiCanvas() {
  cCanvas.width = window.innerWidth;
  cCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

class ConfettiPiece {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const velocity = 5 + Math.random() * 9;
    this.vx = Math.cos(angle) * velocity;
    this.vy = Math.sin(angle) * velocity - 2;
    this.gravity = 0.18;
    this.drag = 0.96;
    this.size = 12 + Math.random() * 12;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.colors = ['#ff2a6d', '#ff6b8b', '#ffb703', '#fb7185', '#ec4899', '#a855f7', '#38bdf8'];
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.alpha = 1;
    this.decay = 0.008 + Math.random() * 0.012;
    this.isHeart = Math.random() > 0.4;
  }

  update() {
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.alpha -= this.decay;
  }

  draw() {
    if (this.alpha <= 0) return;
    cCtx.save();
    cCtx.translate(this.x, this.y);
    cCtx.rotate(this.rotation);
    cCtx.globalAlpha = Math.max(0, this.alpha);
    cCtx.fillStyle = this.color;

    if (this.isHeart) {
      const s = this.size * 0.6;
      cCtx.beginPath();
      cCtx.moveTo(0, s * 0.3);
      cCtx.bezierCurveTo(-s, -s * 0.6, -s * 1.2, s * 0.4, 0, s * 1.2);
      cCtx.bezierCurveTo(s * 1.2, s * 0.4, s, -s * 0.6, 0, s * 0.3);
      cCtx.fill();
    } else {
      cCtx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    }

    cCtx.restore();
  }
}

function launchHeartConfetti(originX = window.innerWidth / 2, originY = window.innerHeight / 2, count = 90) {
  for (let i = 0; i < count; i++) {
    confettiPieces.push(new ConfettiPiece(originX, originY));
  }
}

function animateConfetti() {
  cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
  for (let i = confettiPieces.length - 1; i >= 0; i--) {
    const p = confettiPieces[i];
    p.update();
    p.draw();
    if (p.alpha <= 0) {
      confettiPieces.splice(i, 1);
    }
  }
  requestAnimationFrame(animateConfetti);
}

animateConfetti();

// ==========================================
// 6. GIFT BOX OPENING INTERACTION
// ==========================================
const giftBtn = document.getElementById('gift-box-btn');
const giftOverlay = document.getElementById('gift-overlay');
const mainContent = document.getElementById('main-content');
const giftBox = giftBtn.querySelector('.gift-box');

giftBtn.addEventListener('click', () => {
  giftBox.classList.add('opening');
  romanticAudio.playSparkleSound();

  const rect = giftBtn.getBoundingClientRect();
  launchHeartConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);

  setTimeout(() => {
    giftOverlay.classList.add('fade-out');
    mainContent.classList.remove('hidden');
    romanticAudio.startMelody();
    launchHeartConfetti(window.innerWidth * 0.25, window.innerHeight * 0.4, 60);
    launchHeartConfetti(window.innerWidth * 0.75, window.innerHeight * 0.4, 60);
  }, 750);
});

// Audio Toggle Button
document.getElementById('music-toggle').addEventListener('click', () => {
  romanticAudio.toggle();
});

// ==========================================
// 7. POLAROID GALLERY LIGHTBOX & CUSTOM UPLOAD
// ==========================================
const polaroidItems = document.querySelectorAll('.polaroid-item');
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');

const defaultPhotos = [
  'assets/photo1.jpg',
  'assets/photo2.jpg',
  'assets/photo3.jpg',
  'assets/photo4.jpg'
];

let savedPhotos = [];

function loadSavedPhotos() {
  try {
    const raw = localStorage.getItem('peefah_gallery_photos');
    if (raw) {
      savedPhotos = JSON.parse(raw);
    }
  } catch (e) {
    savedPhotos = [];
  }

  for (let i = 0; i < 4; i++) {
    const frame = document.getElementById(`frame-${i}`);
    const img = document.getElementById(`img-${i}`);
    const ph = frame ? frame.querySelector('.placeholder-box') : null;
    const photoUrl = (savedPhotos && savedPhotos[i]) ? savedPhotos[i] : defaultPhotos[i];

    if (img) {
      if (photoUrl) {
        img.src = photoUrl;
        img.classList.remove('hidden');
        if (frame) frame.classList.remove('empty');
        if (ph) ph.style.display = 'none';
      } else {
        img.src = '';
        img.classList.add('hidden');
        if (frame) frame.classList.add('empty');
        if (ph) ph.style.display = 'flex';
      }
    }
  }
}

function saveSinglePhoto(index, dataUrl) {
  savedPhotos[index] = dataUrl;
  try {
    localStorage.setItem('peefah_gallery_photos', JSON.stringify(savedPhotos));
  } catch (e) {
    console.warn('Could not save photo to localStorage', e);
  }
  loadSavedPhotos();
}

polaroidItems.forEach(item => {
  const index = parseInt(item.getAttribute('data-index'), 10);
  const fileInput = item.querySelector('.single-photo-input');
  const caption = item.getAttribute('data-caption');

  item.addEventListener('click', (e) => {
    const currentPhoto = (savedPhotos && savedPhotos[index]) ? savedPhotos[index] : defaultPhotos[index];
    // If empty, open file picker
    if (!currentPhoto) {
      fileInput.click();
    } else {
      // If photo exists, open lightbox
      lightboxImg.src = currentPhoto;
      if (caption && caption.trim() !== '') {
        lightboxCaption.textContent = caption;
        lightboxCaption.style.display = 'block';
      } else {
        lightboxCaption.textContent = '';
        lightboxCaption.style.display = 'none';
      }
      lightboxModal.classList.remove('hidden');
      romanticAudio.playSparkleSound();
    }
  });

  // Long press / double-click or change photo
  item.addEventListener('dblclick', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      saveSinglePhoto(index, event.target.result);
      romanticAudio.playSuccessChime();
      launchHeartConfetti(window.innerWidth / 2, window.innerHeight / 2, 50);
    };
    reader.readAsDataURL(file);
  });
});

lightboxClose.addEventListener('click', () => {
  lightboxModal.classList.add('hidden');
});

lightboxModal.addEventListener('click', (e) => {
  if (e.target === lightboxModal) {
    lightboxModal.classList.add('hidden');
  }
});



// ==========================================
// 9. LOVE LETTER TYPEWRITER EFFECT
// ==========================================
const loveEnvelope = document.getElementById('love-envelope');
const letterWrapper = document.getElementById('letter-paper-wrapper');
const typewriterContainer = document.getElementById('typewriter-content');
let typewriterStarted = false;

function typeWriterEffect(text, index = 0) {
  if (index === 0) {
    typewriterContainer.innerHTML = '<span class="cursor"></span>';
  }

  if (index < text.length) {
    const char = text.charAt(index);
    const cursor = typewriterContainer.querySelector('.cursor');
    if (cursor) {
      cursor.insertAdjacentText('beforebegin', char);
    } else {
      typewriterContainer.textContent += char;
    }

    // Gentle typewriter sound cadence
    if (index % 4 === 0 && Math.random() > 0.4) {
      romanticAudio.playChime(1046.50 + Math.random() * 200, 0, 0.1, 0.04);
    }

    setTimeout(() => {
      typeWriterEffect(text, index + 1);
    }, char === '\n' ? 350 : 38);
  }
}

loveEnvelope.addEventListener('click', () => {
  loveEnvelope.style.transform = 'scale(0.95)';
  setTimeout(() => {
    loveEnvelope.style.display = 'none';
    letterWrapper.classList.remove('hidden');
    romanticAudio.playSparkleSound();
    launchHeartConfetti(window.innerWidth / 2, window.innerHeight * 0.6, 50);

    if (!typewriterStarted) {
      typewriterStarted = true;
      typeWriterEffect(config.letterContent);
    }
  }, 250);
});

// ==========================================
// 10. INTERACTIVE "WILL YOU LOVE ME?" RUNAWAY BUTTON
// ==========================================
const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const celebrationModal = document.getElementById('celebration-modal');
const celebrationClose = document.getElementById('celebration-close');
const reactionBubble = document.getElementById('no-reaction-bubble');

const playfulPhrases = [
  'แน่ะ! จะไม่ให้คุยเหรอ? ปุ่มนี้ล็อกไว้แล้วจ้าา อิอิ 😝',
  'อย่าใจร้ายกับน้องเพชรเลยน้าาา 🥺💔',
  'วิ่งหนีแล้ววว กดปุ่มอยู่คุยต่อเถอะน้าา 🏃‍♂️💨',
  'ให้น้องเพชรอยู่เป็นรอยยิ้มให้พี่ฟ้าน้าา ขอร้องง 🥺💖',
  'ตามจับไม่ทันหรอกก ยอมคุยกับน้องเพชรต่อซะดีๆ! 😜',
  'วันไหนเหนื่อยทักมาหาน้องเพชรได้ตลอดเลยน้าา 🥰'
];
let phraseIndex = 0;

function dodgeNoButton() {
  const card = document.querySelector('.question-card');
  const cardRect = card.getBoundingClientRect();
  const btnRect = btnNo.getBoundingClientRect();

  const maxX = (cardRect.width / 2) - btnRect.width - 20;
  const maxY = 70;

  const randomX = (Math.random() - 0.5) * maxX * 2;
  const randomY = (Math.random() - 0.5) * maxY * 2;

  btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;

  // Show playful reaction text
  reactionBubble.textContent = playfulPhrases[phraseIndex % playfulPhrases.length];
  reactionBubble.classList.remove('hidden');
  phraseIndex++;

  romanticAudio.playChime(350 + Math.random() * 150, 0, 0.15, 0.1);
}

btnNo.addEventListener('mouseenter', dodgeNoButton);
btnNo.addEventListener('touchstart', (e) => {
  e.preventDefault();
  dodgeNoButton();
});
btnNo.addEventListener('click', (e) => {
  e.preventDefault();
  dodgeNoButton();
});

btnYes.addEventListener('click', () => {
  celebrationModal.classList.remove('hidden');
  romanticAudio.playSuccessChime();

  // Big Confetti & Heart Fireworks celebration
  launchHeartConfetti(window.innerWidth * 0.3, window.innerHeight * 0.5, 100);
  launchHeartConfetti(window.innerWidth * 0.7, window.innerHeight * 0.5, 100);
  setTimeout(() => {
    launchHeartConfetti(window.innerWidth * 0.5, window.innerHeight * 0.3, 120);
  }, 350);
});

celebrationClose.addEventListener('click', () => {
  celebrationModal.classList.add('hidden');
  launchHeartConfetti(window.innerWidth / 2, window.innerHeight / 2, 40);
});

celebrationModal.addEventListener('click', (e) => {
  if (e.target === celebrationModal) {
    celebrationModal.classList.add('hidden');
  }
});

// ==========================================
// 11. SETTINGS / CUSTOMIZATION MODAL
// ==========================================
const customizeBtn = document.getElementById('customize-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsClose = document.getElementById('settings-close');
const settingsForm = document.getElementById('settings-form');
const resetDefaultBtn = document.getElementById('reset-default-btn');

customizeBtn.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
});

settingsClose.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add('hidden');
  }
});

settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  config.myName = document.getElementById('input-my-name').value.trim() || DEFAULT_CONFIG.myName;
  config.loverName = document.getElementById('input-lover-name').value.trim() || DEFAULT_CONFIG.loverName;
  config.annivDate = document.getElementById('input-anniv-date').value || DEFAULT_CONFIG.annivDate;
  config.letterContent = document.getElementById('input-custom-letter').value.trim() || DEFAULT_CONFIG.letterContent;

  saveConfig();
  updateLoveTimer();

  // If typewriter was already started, re-type
  if (typewriterStarted) {
    typewriterContainer.textContent = '';
    typeWriterEffect(config.letterContent);
  }

  settingsModal.classList.add('hidden');
  romanticAudio.playSuccessChime();
  launchHeartConfetti(window.innerWidth / 2, window.innerHeight / 2, 50);
});

resetDefaultBtn.addEventListener('click', () => {
  if (confirm('ต้องการรีเซ็ตค่าเริ่มต้นทั้งหมดใช่หรือไม่?')) {
    config = { ...DEFAULT_CONFIG };
    saveConfig();
    updateLoveTimer();
    settingsModal.classList.add('hidden');
  }
});

// ==========================================
// 12. CURSOR HEART TRAIL (SWEET MICRO-INTERACTION)
// ==========================================
let lastHeartTime = 0;
window.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastHeartTime > 90) { // Limit frequency
    lastHeartTime = now;
    createFloatingMiniHeart(e.clientX, e.clientY);
  }
});

function createFloatingMiniHeart(x, y) {
  const heart = document.createElement('div');
  heart.className = 'cursor-mini-heart';
  heart.textContent = ['❤️', '💖', '💕', '✨'][Math.floor(Math.random() * 4)];
  heart.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    font-size: ${14 + Math.random() * 10}px;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    animation: floatAway 1s forwards ease-out;
  `;
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1000);
}

// Add keyframe for mini heart trail
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes floatAway {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(0.6); }
    100% { opacity: 0; transform: translate(-50%, -80px) scale(1.3); }
  }
`;
document.head.appendChild(styleSheet);

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  updateLoveTimer();
  loadSavedPhotos();
});
