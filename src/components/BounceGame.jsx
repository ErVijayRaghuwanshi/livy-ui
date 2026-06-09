import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, X, Keyboard, Gamepad2 } from 'lucide-react';

// ==========================================
// AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, volume = 0.1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio context blocked
    }
  }

  playNokiaTune() {
    this.init();
    if (this.muted || !this.ctx) return;

    const tempo = 120;
    const quarterNote = 60 / tempo;
    const notes = [
      { f: 659.25, d: 0.125 }, // E5
      { f: 587.33, d: 0.125 }, // D5
      { f: 369.99, d: 0.25 },  // F#4
      { f: 415.30, d: 0.25 },  // G#4
      { f: 554.37, d: 0.125 }, // C#5
      { f: 493.88, d: 0.125 }, // B4
      { f: 293.66, d: 0.25 },  // D4
      { f: 329.63, d: 0.25 },  // E4
      { f: 493.88, d: 0.125 }, // B4
      { f: 440.00, d: 0.125 }, // A4
      { f: 277.18, d: 0.25 },  // C#4
      { f: 329.63, d: 0.25 },  // E4
      { f: 440.00, d: 0.5 }    // A4
    ];

    let timeOffset = 0;
    notes.forEach(note => {
      setTimeout(() => {
        if (!this.muted) {
          this.playTone(note.f, 'square', note.d * 1.5, 0.08);
        }
      }, timeOffset * 1000);
      timeOffset += note.d * 1.1;
    });
  }

  playJump() {
    this.playTone(180, 'triangle', 0.15, 0.15);
    setTimeout(() => this.playTone(280, 'triangle', 0.15, 0.15), 50);
  }

  playCoin() {
    this.playTone(880, 'sine', 0.08, 0.1);
    setTimeout(() => this.playTone(1320, 'sine', 0.15, 0.08), 80);
  }

  playPop() {
    this.playTone(150, 'sawtooth', 0.3, 0.2);
    this.playTone(70, 'triangle', 0.4, 0.25);
  }

  playGravity() {
    this.playTone(300, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(150, 'sine', 0.2, 0.1), 80);
  }

  playSplash() {
    this.playTone(100, 'sine', 0.2, 0.15);
  }

  playWin() {
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.2, 0.1);
      }, idx * 100);
    });
  }
}

const synth = new SoundSynth();

// ==========================================
// CORE CONSTANTS & ASSETS
// ==========================================
const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 180;

const PHYSICS = {
  gravity: 0.30,       // Balanced gravity
  friction: 0.85,
  accel: 0.42,         // Direct horizontal controls
  maxSpeed: 3.5,
  jumpForce: -6.8,     // Higher vertical bounce height (75px clear)
  waterBuoyancy: -0.15,
  waterFriction: 0.75,
};

const BALL_TYPES = {
  classic: { name: 'Classic Red', color: '#E11D48', bounce: 1, weight: 1.0, icon: '🔴' },
  steel: { name: 'Heavy Steel', color: '#64748B', bounce: 0.5, weight: 1.8, icon: '🔘' },
  beach: { name: 'Beach Ball', color: '#F59E0B', bounce: 1.4, weight: 0.6, icon: '🟡' }
};

const SCREEN_THEMES = {
  3310: { name: 'Classic 3310', bg: '#c2d1b2', text: '#2d3326', glow: 'rgba(194, 209, 178, 0.5)' },
  blue: { name: '8210 Blue', bg: '#a3e2f7', text: '#102e3d', glow: 'rgba(163, 226, 247, 0.5)' },
  amber: { name: 'Amber Glow', bg: '#fcd34d', text: '#451a03', glow: 'rgba(252, 211, 77, 0.5)' },
  modern: { name: 'Grey Matrix', bg: '#e2e8f0', text: '#0f172a', glow: 'rgba(226, 232, 240, 0.4)' }
};

const LEVEL_DATA = [
  {
    name: 'Level 1: Hills of Bounce',
    ballStart: { x: 40, y: 120 },
    platforms: [
      { x: 0, y: 160, w: 200, h: 20 },
      { x: 230, y: 140, w: 100, h: 40 },
      { x: 360, y: 110, w: 100, h: 70 },
      { x: 490, y: 140, w: 120, h: 40 },
      { x: 640, y: 160, w: 200, h: 20 },
      { x: 100, y: 100, w: 80, h: 12 },
      { x: 250, y: 70, w: 80, h: 12 },
      { x: 500, y: 80, w: 60, h: 12 },
    ],
    spikes: [
      { x: 180, y: 150, w: 20, h: 10 },
      { x: 360, y: 100, w: 30, h: 10 },
    ],
    rings: [
      { x: 140, y: 70, collected: false },
      { x: 290, y: 40, collected: false },
      { x: 530, y: 50, collected: false },
      { x: 720, y: 120, collected: false },
    ],
    water: [],
    gravityPads: [],
    exit: { x: 780, y: 130, w: 20, h: 30 }
  },
  {
    name: 'Level 2: The Deep Cavern',
    ballStart: { x: 40, y: 120 },
    platforms: [
      { x: 0, y: 160, w: 150, h: 20 },
      { x: 150, y: 220, w: 300, h: 20, isCavern: true },
      { x: 450, y: 150, w: 120, h: 40 },
      { x: 600, y: 110, w: 100, h: 80 },
      { x: 730, y: 160, w: 100, h: 20 },
      { x: 220, y: 120, w: 60, h: 10 },
      { x: 340, y: 100, w: 60, h: 10 },
    ],
    spikes: [
      { x: 245, y: 210, w: 30, h: 10 },
      { x: 620, y: 100, w: 40, h: 10 },
    ],
    water: [
      { x: 150, y: 90, w: 300, h: 130 }
    ],
    rings: [
      { x: 90, y: 120, collected: false },
      { x: 250, y: 160, collected: false },
      { x: 370, y: 60, collected: false },
      { x: 510, y: 100, collected: false },
      { x: 650, y: 70, collected: false },
    ],
    gravityPads: [],
    exit: { x: 800, y: 130, w: 20, h: 30 }
  },
  {
    name: 'Level 3: Gravity Grid',
    ballStart: { x: 30, y: 130 },
    platforms: [
      { x: 0, y: 160, w: 160, h: 20 },
      { x: 240, y: 160, w: 120, h: 20 },
      { x: 400, y: 160, w: 150, h: 20 },
      { x: 650, y: 160, w: 200, h: 20 },
      { x: 100, y: 0, w: 200, h: 20 },
      { x: 350, y: 0, w: 200, h: 20 },
      { x: 600, y: 0, w: 200, h: 20 },
      { x: 170, y: 90, w: 60, h: 12 },
      { x: 570, y: 90, w: 60, h: 12 },
    ],
    spikes: [
      { x: 135, y: 20, w: 30, h: 10, inverted: true },
      { x: 425, y: 20, w: 25, h: 10, inverted: true },
      { x: 445, y: 150, w: 25, h: 10 },
      { x: 715, y: 150, w: 30, h: 10 },
    ],
    water: [],
    gravityPads: [
      { x: 100, y: 145, w: 16, h: 15, direction: -1 },
      { x: 280, y: 20, w: 16, h: 15, direction: 1, inverted: true },
      { x: 500, y: 145, w: 16, h: 15, direction: -1 },
      { x: 680, y: 20, w: 16, h: 15, direction: 1, inverted: true },
    ],
    rings: [
      { x: 150, y: 40, collected: false },
      { x: 200, y: 120, collected: false },
      { x: 450, y: 50, collected: false },
      { x: 530, y: 120, collected: false },
      { x: 760, y: 60, collected: false },
    ],
    exit: { x: 810, y: 130, w: 20, h: 30 }
  }
];

export default function BounceGame({ onClose, theme: editorTheme }) {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  
  // Custom navigation menu state machine inside the simulated Nokia screen
  // State options: 'MENU', 'LEVEL_SELECT', 'BALL_SKINS', 'LCD_COLOR', 'PLAYING', 'LEVEL_CLEAR', 'GAMEOVER', 'WIN'
  const [gameState, setGameState] = useState('MENU');
  const [menuIndex, setMenuIndex] = useState(0);

  const [muted, setMuted] = useState(() => {
    try {
      const saved = localStorage.getItem('bounce-muted');
      const val = saved ? JSON.parse(saved) : false;
      synth.muted = val;
      return val;
    } catch (e) {
      return false;
    }
  });
  const [ballType, setBallType] = useState('classic');
  const [theme, setTheme] = useState('3310');
  const [enableLCDGrid, setEnableLCDGrid] = useState(true);
  const [ringsLeft, setRingsLeft] = useState(0);
  
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('bounce-high-score');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [scale, setScale] = useState(1.8);
  const parentContainerRef = useRef(null);

  const handleGoToMenu = () => {
    setGameState('MENU');
    setMenuIndex(0);
    synth.playTone(300, 'triangle', 0.1, 0.1);
  };

  const canvasRef = useRef(null);
  const engineRef = useRef({
    ball: { x: 0, y: 0, vx: 0, vy: 0, rad: 8, gravitySign: 1, state: 'normal' },
    keys: { Left: false, Right: false, Up: false, Down: false },
    cameraX: 0,
    rings: [],
    platforms: [],
    spikes: [],
    water: [],
    gravityPads: [],
    exit: { x: 0, y: 0, w: 0, h: 0 },
    particleExplosions: []
  });

  // Dynamic aspect-ratio scaling to fill the parent container beautifully
  useEffect(() => {
    if (!parentContainerRef.current) return;

    const updateScale = () => {
      if (!parentContainerRef.current) return;
      const { clientWidth, clientHeight } = parentContainerRef.current;
      
      // The game screen inner frame: width is 312px, height is around 220px
      const designWidth = 330;
      const designHeight = 250;

      const scaleX = clientWidth / designWidth;
      const scaleY = clientHeight / designHeight;
      
      // Calculate the best scale factor to fit while leaving 5% margins
      const finalScale = Math.min(scaleX, scaleY) * 0.92;
      setScale(Math.max(1, finalScale));
    };

    const observer = new ResizeObserver(() => updateScale());
    observer.observe(parentContainerRef.current);
    updateScale(); // Initial call

    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    synth.muted = nextMuted;
    try {
      localStorage.setItem('bounce-muted', JSON.stringify(nextMuted));
    } catch (e) {}
    synth.playTone(440, 'sine', 0.05, 0.05);
  };

  const loadLevel = (levelIdx) => {
    const rawData = LEVEL_DATA[levelIdx];
    if (!rawData) return;

    setCurrentLevelIdx(levelIdx);
    
    engineRef.current.platforms = JSON.parse(JSON.stringify(rawData.platforms));
    engineRef.current.spikes = JSON.parse(JSON.stringify(rawData.spikes));
    engineRef.current.water = JSON.parse(JSON.stringify(rawData.water));
    engineRef.current.gravityPads = JSON.parse(JSON.stringify(rawData.gravityPads));
    engineRef.current.exit = JSON.parse(JSON.stringify(rawData.exit));
    engineRef.current.rings = JSON.parse(JSON.stringify(rawData.rings));

    engineRef.current.ball = {
      x: rawData.ballStart.x,
      y: rawData.ballStart.y,
      vx: 0,
      vy: 0,
      rad: 8,
      gravitySign: 1,
      state: 'normal'
    };
    engineRef.current.cameraX = 0;
    engineRef.current.particleExplosions = [];
    engineRef.current.keys = { Left: false, Right: false, Up: false, Down: false };

    setRingsLeft(rawData.rings.length);
  };

  const respawnBall = () => {
    const rawData = LEVEL_DATA[currentLevelIdx];
    engineRef.current.ball = {
      x: rawData.ballStart.x,
      y: rawData.ballStart.y,
      vx: 0,
      vy: 0,
      rad: 8,
      gravitySign: 1,
      state: 'normal'
    };
    engineRef.current.cameraX = 0;
    engineRef.current.ball.gravitySign = 1; 
  };

  // Handles navigation lists based on current simulated LCD menu state
  const getMenuList = () => {
    switch (gameState) {
      case 'MENU':
        return [
          '1. PLAY QUEST', 
          '2. CHOOSE BALL', 
          '3. SCREEN COLOR', 
          '4. FX: ' + (muted ? 'MUTED' : 'ENABLED'),
          '5. EXIT GAME'
        ];
      case 'LEVEL_SELECT':
        return LEVEL_DATA.map((lvl, index) => `${index + 1}. ${lvl.name}`);
      case 'BALL_SKINS':
        return Object.keys(BALL_TYPES).map(k => `${BALL_TYPES[k].icon} ${BALL_TYPES[k].name}`);
      case 'LCD_COLOR':
        return Object.keys(SCREEN_THEMES).map(k => SCREEN_THEMES[k].name);
      default:
        return [];
    }
  };

  const handleMenuSelect = (index) => {
    synth.playTone(520, 'sine', 0.08, 0.1);
    
    if (gameState === 'MENU') {
      if (index === 0) {
        setGameState('LEVEL_SELECT');
        setMenuIndex(0);
      } else if (index === 1) {
        setGameState('BALL_SKINS');
        setMenuIndex(Object.keys(BALL_TYPES).indexOf(ballType));
      } else if (index === 2) {
        setGameState('LCD_COLOR');
        setMenuIndex(Object.keys(SCREEN_THEMES).indexOf(theme));
      } else if (index === 3) {
        toggleMute();
      } else if (index === 4) {
        onClose();
      }
    } else if (gameState === 'LEVEL_SELECT') {
      synth.playNokiaTune();
      loadLevel(index);
      setGameState('PLAYING');
      setLives(5);
      setScore(0);
    } else if (gameState === 'BALL_SKINS') {
      const keys = Object.keys(BALL_TYPES);
      setBallType(keys[index]);
      setGameState('MENU');
      setMenuIndex(1);
    } else if (gameState === 'LCD_COLOR') {
      const keys = Object.keys(SCREEN_THEMES);
      setTheme(keys[index]);
      setGameState('MENU');
      setMenuIndex(2);
    }
  };

  // Core controller for desktop key bindings
  const pressPhoneKey = (key, action) => {
    const isMenuState = ['MENU', 'LEVEL_SELECT', 'BALL_SKINS', 'LCD_COLOR'].includes(gameState);
    
    if (action === 'down') {
      if (isMenuState) {
        const list = getMenuList();
        if (key === 'up') {
          synth.playTone(320, 'triangle', 0.05, 0.1);
          setMenuIndex(prev => (prev - 1 + list.length) % list.length);
        } else if (key === 'down') {
          synth.playTone(320, 'triangle', 0.05, 0.1);
          setMenuIndex(prev => (prev + 1) % list.length);
        } else if (key === 'select') {
          handleMenuSelect(menuIndex);
        }
        return;
      }

      // Playing key actions
      const { keys } = engineRef.current;
      if (key === 'left') keys.Left = true;
      if (key === 'right') keys.Right = true;
      if (key === 'up') keys.Up = true;
      if (key === 'down') keys.Down = true;
    } else {
      const { keys } = engineRef.current;
      if (key === 'left') keys.Left = false;
      if (key === 'right') keys.Right = false;
      if (key === 'up') keys.Up = false;
      if (key === 'down') keys.Down = false;
    }
  };

  // Keyboard binding updates
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMenuState = ['MENU', 'LEVEL_SELECT', 'BALL_SKINS', 'LCD_COLOR'].includes(gameState);
      
      // Global shortcut for Mute
      if (e.key === '*' || e.key === 'm' || e.key === 'M') {
        toggleMute();
        return;
      }

      // Global shortcut for Reset in playing mode
      if (gameState === 'PLAYING' && (e.key === 'r' || e.key === 'R')) {
        loadLevel(currentLevelIdx);
        return;
      }

      // Cheat key: Skip level in playing mode
      if (gameState === 'PLAYING' && (e.key === '#' || e.key === 'n' || e.key === 'N')) {
        const nextLvl = (currentLevelIdx + 1) % LEVEL_DATA.length;
        loadLevel(nextLvl);
        synth.playTone(523, 'sine', 0.1, 0.1);
        return;
      }

      if (isMenuState) {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === '2') {
          e.preventDefault();
          pressPhoneKey('up', 'down');
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === '8') {
          e.preventDefault();
          pressPhoneKey('down', 'down');
        } else if (e.key === 'Enter' || e.key === ' ' || e.key === '5') {
          e.preventDefault();
          pressPhoneKey('select', 'down');
        } else if (e.key === 'Escape') {
          e.preventDefault();
          if (gameState !== 'MENU') {
            handleGoToMenu();
          } else {
            onClose();
          }
        }
        return;
      }

      if (gameState !== 'PLAYING') return;
      const { keys } = engineRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === '4') keys.Left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === '6') keys.Right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === '2' || e.key === ' ' || e.key === '5') {
        e.preventDefault();
        keys.Up = true;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === '8') {
        e.preventDefault();
        keys.Down = true;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleGoToMenu();
      }
    };

    const handleKeyUp = (e) => {
      if (gameState !== 'PLAYING') return;
      const { keys } = engineRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === '4') keys.Left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === '6') keys.Right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === '2' || e.key === ' ' || e.key === '5') keys.Up = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === '8') keys.Down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, menuIndex, muted, currentLevelIdx]);

  // Frame logic loop running at 60Hz inside standard Animation Frame requests
  useEffect(() => {
    let animId;

    const gameLoop = () => {
      if (gameState !== 'PLAYING') return;

      const engine = engineRef.current;
      const { ball, keys, platforms, spikes, water, gravityPads, exit, rings } = engine;
      const stats = BALL_TYPES[ballType];

      let insideWater = false;
      let currentWater = null;
      water.forEach(w => {
        if (
          ball.x >= w.x &&
          ball.x <= w.x + w.w &&
          ball.y >= w.y &&
          ball.y <= w.y + w.h
        ) {
          insideWater = true;
          currentWater = w;
        }
      });

      let currentGravity = PHYSICS.gravity * ball.gravitySign * stats.weight;
      let currentFriction = PHYSICS.friction;
      let currentSpeedCap = PHYSICS.maxSpeed;

      if (insideWater) {
        currentGravity = PHYSICS.waterBuoyancy * ball.gravitySign;
        currentFriction = PHYSICS.waterFriction;
        currentSpeedCap = PHYSICS.maxSpeed * 0.7;
      }

      // Horizontal momentum
      if (keys.Left) {
        ball.vx -= PHYSICS.accel;
      } else if (keys.Right) {
        ball.vx += PHYSICS.accel;
      } else {
        ball.vx *= currentFriction;
      }

      if (ball.vx > currentSpeedCap) ball.vx = currentSpeedCap;
      if (ball.vx < -currentSpeedCap) ball.vx = -currentSpeedCap;

      ball.x += ball.vx;

      if (ball.x - ball.rad < 0) {
        ball.x = ball.rad;
        ball.vx = 0;
      }

      ball.vy += currentGravity;
      ball.y += ball.vy;

      if (insideWater) {
        if (keys.Up) {
          // Dolphin leap: if close to water surface, leap upward
          if (currentWater && ball.y - currentWater.y < 16) {
            ball.vy = -4.6; // Strong leap out of water
            synth.playTone(320, 'triangle', 0.15, 0.12);
            // Water splash particles
            for (let i = 0; i < 6; i++) {
              engine.particleExplosions.push({
                x: ball.x,
                y: currentWater.y,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 2 - 1,
                life: 15,
                color: 'rgba(255, 255, 255, 0.8)'
              });
            }
          } else {
            ball.vy -= 0.35;
            if (Math.random() < 0.15) {
              engine.particleExplosions.push({
                x: ball.x,
                y: ball.y + 4,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2,
                life: 15,
                color: 'rgba(255,255,255,0.7)'
              });
            }
          }
        }
        if (keys.Down) {
          ball.vy += 0.45; // Faster diving controls
        }
      }

      let onGround = false;

      platforms.forEach(plat => {
        const closestX = Math.max(plat.x, Math.min(ball.x, plat.x + plat.w));
        const closestY = Math.max(plat.y, Math.min(ball.y, plat.y + plat.h));

        const distX = ball.x - closestX;
        const distY = ball.y - closestY;
        const distSq = distX * distX + distY * distY;

        if (distSq < ball.rad * ball.rad) {
          const dist = Math.sqrt(distSq);
          const overlap = ball.rad - dist;

          const dirX = dist > 0 ? distX / dist : 0;
          const dirY = dist > 0 ? distY / dist : 1;

          ball.x += dirX * overlap;
          ball.y += dirY * overlap;

          if (Math.abs(dirY) > Math.abs(dirX)) {
            if (dirY < 0) {
              if (ball.gravitySign === 1) {
                onGround = true;
                ball.vy = 0;
              } else {
                onGround = true;
                ball.vy = 0;
              }
            } else {
              if (ball.gravitySign === 1) {
                ball.vy = Math.abs(ball.vy) * 0.2;
              } else {
                onGround = true;
                ball.vy = 0;
              }
            }
          } else {
            ball.vx = -ball.vx * 0.4;
          }
        }
      });

      if (keys.Up && onGround && !insideWater) {
        ball.vy = PHYSICS.jumpForce * ball.gravitySign * (stats.bounce);
        synth.playJump();
        for (let i = 0; i < 6; i++) {
          engine.particleExplosions.push({
            x: ball.x,
            y: ball.y + (ball.gravitySign * ball.rad),
            vx: (Math.random() - 0.5) * 3,
            vy: -ball.gravitySign * Math.random() * 2,
            life: 20,
            color: '#4a5340'
          });
        }
      }

      spikes.forEach(spike => {
        const closestX = Math.max(spike.x, Math.min(ball.x, spike.x + spike.w));
        const closestY = Math.max(spike.y, Math.min(ball.y, spike.y + spike.h));

        const distX = ball.x - closestX;
        const distY = ball.y - closestY;
        const distance = Math.hypot(distX, distY);

        if (distance < ball.rad) {
          synth.playPop();
          for (let i = 0; i < 20; i++) {
            engine.particleExplosions.push({
              x: ball.x,
              y: ball.y,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              life: 40,
              color: '#ef4444'
            });
          }

          setLives(prev => {
            if (prev - 1 <= 0) {
              setGameState('GAMEOVER');
              return 0;
            } else {
              respawnBall();
              return prev - 1;
            }
          });
        }
      });

      if (ball.y > VIEW_HEIGHT + 50 || ball.y < -100) {
        synth.playPop();
        setLives(prev => {
          if (prev - 1 <= 0) {
            setGameState('GAMEOVER');
            return 0;
          } else {
            respawnBall();
            return prev - 1;
          }
        });
      }

      let remainingRings = 0;
      rings.forEach(ring => {
        if (!ring.collected) {
          const dist = Math.hypot(ball.x - ring.x, ball.y - ring.y);
          if (dist < ball.rad + 10) {
            ring.collected = true;
            synth.playCoin();
            setScore(s => {
              const newScore = s + 150;
              if (newScore > highScore) {
                setHighScore(newScore);
                try {
                  localStorage.setItem('bounce-high-score', newScore.toString());
                } catch (e) {}
              }
              return newScore;
            });
            for (let i = 0; i < 8; i++) {
              engine.particleExplosions.push({
                x: ring.x,
                y: ring.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 30,
                color: '#fbbf24'
              });
            }
          } else {
            remainingRings++;
          }
        }
      });
      setRingsLeft(remainingRings);

      const distToExit = Math.hypot(ball.x - exit.x, ball.y - exit.y);
      if (distToExit < ball.rad + 15) {
        if (remainingRings === 0) {
          synth.playWin();
          if (currentLevelIdx + 1 < LEVEL_DATA.length) {
            setGameState('LEVEL_CLEAR');
          } else {
            setGameState('WIN');
          }
        }
      }

      gravityPads.forEach(pad => {
        const closestX = Math.max(pad.x, Math.min(ball.x, pad.x + pad.w));
        const closestY = Math.max(pad.y, Math.min(ball.y, pad.y + pad.h));
        const dist = Math.hypot(ball.x - closestX, ball.y - closestY);

        if (dist < ball.rad) {
          if (ball.gravitySign !== pad.direction) {
            ball.gravitySign = pad.direction;
            synth.playGravity();
            for (let i = 0; i < 8; i++) {
              engine.particleExplosions.push({
                x: ball.x,
                y: ball.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 20,
                color: '#3b82f6'
              });
            }
          }
        }
      });

      const targetCamX = ball.x - VIEW_WIDTH / 2;
      engine.cameraX += (targetCamX - engine.cameraX) * 0.1;
      
      const maxMapWidth = 850;
      if (engine.cameraX < 0) engine.cameraX = 0;
      if (engine.cameraX > maxMapWidth - VIEW_WIDTH) engine.cameraX = maxMapWidth - VIEW_WIDTH;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const themeColors = SCREEN_THEMES[theme];

        ctx.fillStyle = themeColors.bg;
        ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

        ctx.save();
        ctx.translate(-engine.cameraX, 0);

        water.forEach(w => {
          ctx.fillStyle = 'rgba(29, 155, 240, 0.35)';
          ctx.fillRect(w.x, w.y, w.w, w.h);
          
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(w.x, w.y);
          for (let x = w.x; x <= w.x + w.w; x += 10) {
            const waveY = w.y + Math.sin(x * 0.1 + Date.now() * 0.005) * 2;
            ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        });

        platforms.forEach(plat => {
          ctx.fillStyle = themeColors.text;
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

          ctx.strokeStyle = themeColors.bg;
          ctx.lineWidth = 1;
          ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

          ctx.beginPath();
          for (let py = plat.y + 6; py < plat.y + plat.h; py += 6) {
            ctx.moveTo(plat.x, py);
            ctx.lineTo(plat.x + plat.w, py);
          }
          for (let px = plat.x + 10; px < plat.x + plat.w; px += 20) {
            ctx.moveTo(px, plat.y);
            ctx.lineTo(px, plat.y + plat.h);
          }
          ctx.stroke();
        });

        gravityPads.forEach(pad => {
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(pad.x, pad.y, pad.w, pad.h);
          
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          if (pad.direction === -1) {
            ctx.moveTo(pad.x + pad.w / 2, pad.y + 2);
            ctx.lineTo(pad.x + 2, pad.y + pad.h - 3);
            ctx.lineTo(pad.x + pad.w - 2, pad.y + pad.h - 3);
          } else {
            ctx.moveTo(pad.x + pad.w / 2, pad.y + pad.h - 2);
            ctx.lineTo(pad.x + 2, pad.y + 3);
            ctx.lineTo(pad.x + pad.w - 2, pad.y + 3);
          }
          ctx.closePath();
          ctx.fill();
        });

        spikes.forEach(spike => {
          ctx.fillStyle = '#ef4444';
          const spikeCount = Math.floor(spike.w / 10);
          
          for (let i = 0; i < spikeCount; i++) {
            ctx.beginPath();
            const sx = spike.x + (i * 10);
            if (spike.inverted) {
              ctx.moveTo(sx, spike.y);
              ctx.lineTo(sx + 5, spike.y + spike.h);
              ctx.lineTo(sx + 10, spike.y);
            } else {
              ctx.moveTo(sx, spike.y + spike.h);
              ctx.lineTo(sx + 5, spike.y);
              ctx.lineTo(sx + 10, spike.y + spike.h);
            }
            ctx.closePath();
            ctx.fill();
          }
        });

        rings.forEach(ring => {
          if (!ring.collected) {
            const pulse = Math.sin(Date.now() * 0.01) * 2;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, 8 + pulse / 2, 0, Math.PI * 2);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(ring.x, ring.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
            ctx.fill();
          }
        });

        const exitPulse = Math.sin(Date.now() * 0.015) * 3;
        ctx.strokeStyle = remainingRings === 0 ? '#10b981' : '#6b7280';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(exit.x, exit.y, 10 + exitPulse, 16, 0, 0, Math.PI * 2);
        ctx.stroke();

        if (remainingRings === 0) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
          ctx.fill();
        }

        engine.particleExplosions.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life--;

          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 3, 3);

          if (p.life <= 0) {
            engine.particleExplosions.splice(idx, 1);
          }
        });

        ctx.save();
        ctx.translate(ball.x, ball.y);
        
        const rotation = (ball.x * 0.08);
        ctx.rotate(rotation);

        ctx.beginPath();
        ctx.arc(0, 0, ball.rad, 0, Math.PI * 2);
        ctx.fillStyle = stats.color;
        ctx.fill();

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = themeColors.text;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, ball.rad - 3, 0.3 * Math.PI, 1.3 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        ctx.restore(); 
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, theme, ballType, currentLevelIdx]);

  const activeThemeColors = SCREEN_THEMES[theme];
  const listItems = getMenuList();

  return (
    <div 
      ref={parentContainerRef}
      onClick={() => synth.init()}
      className="w-full h-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative select-none"
    >
      {/* Floating high-tech Close button in the top-right corner */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer shadow-lg z-50 hover:scale-105 active:scale-95"
        title="Exit Game"
      >
        <X size={18} />
      </button>

      {/* Retro Header overlay */}
      <div className="absolute top-4 left-6 flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wider">
        <Gamepad2 size={16} className="text-emerald-500 animate-pulse" />
        <span>LIVY RETRO BOUNCE ARCADE</span>
      </div>

      {/* Main retro scaled game envelope */}
      <div 
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
        className="transition-transform duration-300 ease-out flex flex-col items-center relative"
      >
        <div 
          className="p-2.5 transition-colors duration-500 rounded-2xl border-4 border-slate-900/90 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          style={{
            backgroundColor: activeThemeColors.bg,
            boxShadow: `0 0 35px ${activeThemeColors.glow}, inset 0 2px 10px rgba(0,0,0,0.5)`,
            width: '320px',
          }}
        >
          {/* LCD Screen Header */}
          <div className="flex justify-between items-center text-[9px] font-mono font-bold tracking-tight mb-1 border-b pb-0.5 select-none" style={{ color: activeThemeColors.text, borderColor: `${activeThemeColors.text}33` }}>
            <div className="flex items-center gap-0.5">
              <span>📶</span>
              <span>BOUNCE</span>
            </div>
            <div className="text-[10px] font-extrabold uppercase">
              {gameState === 'PLAYING' ? `LVL ${currentLevelIdx + 1}` : 'MENU'}
            </div>
            <div className="flex items-center gap-0.5">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="hover:opacity-70 cursor-pointer active:scale-90"
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <span>🔋</span>
            </div>
          </div>

          {/* ACTIVE LCD DISPLAY PANEL */}
          <div className="relative overflow-hidden w-full aspect-[300/180] bg-black/10 rounded border border-black/20">
            
            {gameState === 'PLAYING' ? (
              <canvas
                ref={canvasRef}
                width={VIEW_WIDTH}
                height={VIEW_HEIGHT}
                className="block w-full h-full"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : null}

            {/* Scanline Mesh Mask */}
            {enableLCDGrid && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.12] z-40"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), 
                    linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05))
                  `,
                  backgroundSize: '100% 3px, 4px 100%'
                }}
              />
            )}

            {/* FULLY INTEGRATED INTERACTIVE LCD SYSTEM MENU */}
            {['MENU', 'LEVEL_SELECT', 'BALL_SKINS', 'LCD_COLOR'].includes(gameState) && (
              <div className="absolute inset-0 flex flex-col justify-between p-2 select-none" style={{ color: activeThemeColors.text }}>
                
                {/* Menu Page Header */}
                <div className="text-center text-[10px] font-black uppercase tracking-wider border-b pb-0.5" style={{ borderColor: `${activeThemeColors.text}33` }}>
                  {gameState === 'MENU' && '--- MAIN MENU ---'}
                  {gameState === 'LEVEL_SELECT' && '--- SELECT LEVEL ---'}
                  {gameState === 'BALL_SKINS' && '--- BALL SKINS ---'}
                  {gameState === 'LCD_COLOR' && '--- BACKLIGHTS ---'}
                </div>

                {/* Menu List Items */}
                <div className="flex flex-col gap-0.5 flex-1 justify-center py-1">
                  {listItems.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); handleMenuSelect(idx); }}
                      onMouseEnter={() => setMenuIndex(idx)}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors flex items-center justify-between"
                      style={{
                        backgroundColor: menuIndex === idx ? activeThemeColors.text : 'transparent',
                        color: menuIndex === idx ? activeThemeColors.bg : activeThemeColors.text
                      }}
                    >
                      <span>{item}</span>
                      {menuIndex === idx && <span className="text-[8px]">●</span>}
                    </div>
                  ))}
                </div>

                {/* Keypad Navigation Hints */}
                <div className="text-[8px] font-mono opacity-80 text-center border-t pt-0.5 flex justify-center gap-2" style={{ borderColor: `${activeThemeColors.text}11` }}>
                  <span>▲/▼ [W/S]</span>
                  <span>SELECT [Enter]</span>
                </div>
              </div>
            )}

            {/* LEVEL COMPLETED OVERLAY */}
            {gameState === 'LEVEL_CLEAR' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-3 text-center text-white backdrop-blur-[1px] z-50">
                <h3 className="text-emerald-400 font-bold tracking-wide uppercase text-xs mb-1">
                  🎉 Stage Clear!
                </h3>
                <p className="text-[10px] mb-2 font-mono">
                  Score: {score}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadLevel(currentLevelIdx + 1);
                    setGameState('PLAYING');
                    synth.playTone(600, 'sine', 0.1, 0.1);
                  }}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px] rounded active:scale-95 transition-all cursor-pointer"
                >
                  [ NEXT STAGE ]
                </button>
              </div>
            )}

            {/* GAME OVER STATE OVERLAY */}
            {gameState === 'GAMEOVER' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-center p-3 z-50">
                <h3 className="text-red-500 text-xs font-black tracking-widest uppercase mb-1">
                  💀 GAME OVER 💀
                </h3>
                <p className="text-slate-300 text-[9px] mb-2 font-mono">
                  High Score: {highScore}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadLevel(currentLevelIdx);
                      setGameState('PLAYING');
                      setLives(5);
                    }}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[9px] rounded active:scale-95 transition-all cursor-pointer"
                  >
                    RETRY
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGoToMenu();
                    }}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-[9px] rounded active:scale-95 transition-all cursor-pointer"
                  >
                    MENU
                  </button>
                </div>
              </div>
            )}

            {/* CAMPAIGN COMPLETED OVERLAY */}
            {gameState === 'WIN' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-center p-3 z-50">
                <h3 className="text-yellow-400 text-[11px] font-extrabold uppercase tracking-widest mb-1 animate-pulse">
                  👑 QUEST COMPLETE 👑
                </h3>
                <p className="text-slate-200 text-[8px] mb-1 leading-snug">
                  You saved the grid world!
                </p>
                <p className="text-amber-300 text-[10px] font-bold mb-2 font-mono">
                  Total Score: {score}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGoToMenu();
                  }}
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold text-[10px] rounded active:scale-95 transition-all cursor-pointer"
                >
                  BACK TO MENU
                </button>
              </div>
            )}

          </div>

          {/* SCREEN BOTTOM HUD CONTROLLERS */}
          <div className="flex justify-between items-center text-[9px] font-mono mt-1 pt-1 border-t select-none" style={{ color: activeThemeColors.text, borderColor: `${activeThemeColors.text}33` }}>
            <div>
              <span>HP: </span>
              <span className="font-bold">{gameState === 'PLAYING' ? lives : '--'}</span>
            </div>
            <div>
              <span>Rings: </span>
              <span className="font-bold text-amber-700">{gameState === 'PLAYING' ? ringsLeft : '--'}</span>
            </div>
            <div>
              <span>Score: </span>
              <span className="font-bold">{gameState === 'PLAYING' ? score : '--'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Keyboard Controls Bar at the bottom */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1.5 opacity-80 max-w-[420px] px-6 text-center select-none">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 font-mono tracking-tight">
          <Keyboard size={12} className="text-slate-500" />
          <span>CONTROLS:</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono leading-snug">
          Menu: <span className="text-slate-400">▲/▼ [W/S]</span> • Select: <span className="text-slate-400">[Space/Enter]</span><br />
          Ball: <span className="text-slate-400">◀/▶ [A/D]</span> • Jump: <span className="text-slate-400">[Space/W]</span> • Back: <span className="text-slate-400">[Esc]</span><br />
          Cheats: <span className="text-slate-400">[#] Skip Level</span> • <span className="text-slate-400">[*] Mute Tone</span> • <span className="text-slate-400">[R] Reset Level</span>
        </p>
      </div>
    </div>
  );
}
