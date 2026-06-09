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

  playEat() {
    this.playTone(880, 'sine', 0.08, 0.1);
  }

  playHit() {
    this.playTone(150, 'sawtooth', 0.3, 0.25);
  }
}

const synth = new SoundSynth();

// ==========================================
// CORE CONSTANTS & SCREEN THEMES
// ==========================================
const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 180;

const SCREEN_THEMES = {
  3310: { name: 'Classic 3310', bg: '#c2d1b2', text: '#2d3326', glow: 'rgba(194, 209, 178, 0.5)' },
  blue: { name: '8210 Blue', bg: '#a3e2f7', text: '#102e3d', glow: 'rgba(163, 226, 247, 0.5)' },
  amber: { name: 'Amber Glow', bg: '#fcd34d', text: '#451a03', glow: 'rgba(252, 211, 77, 0.5)' },
  modern: { name: 'Grey Matrix', bg: '#e2e8f0', text: '#0f172a', glow: 'rgba(226, 232, 240, 0.4)' }
};

const SPEED_PRESETS = {
  slow: { name: 'Slow', ms: 140 },
  normal: { name: 'Normal', ms: 90 },
  fast: { name: 'Fast', ms: 60 },
  extreme: { name: 'Extreme', ms: 38 }
};

export default function SnakeGame({ onClose }) {
  const [score, setScore] = useState(0);
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
  
  const [theme, setTheme] = useState('3310');
  const [speed, setSpeed] = useState('normal');
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('snake-high-score');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [scale, setScale] = useState(1.8);
  const parentContainerRef = useRef(null);
  const canvasRef = useRef(null);

  const engineRef = useRef({
    snake: [],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: { x: 0, y: 0 },
  });

  // Dynamic aspect-ratio scaling to fill the parent container beautifully
  useEffect(() => {
    if (!parentContainerRef.current) return;

    const updateScale = () => {
      if (!parentContainerRef.current) return;
      const { clientWidth, clientHeight } = parentContainerRef.current;
      
      const designWidth = 330;
      const designHeight = 250;

      const scaleX = clientWidth / designWidth;
      const scaleY = clientHeight / designHeight;
      
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

  const handleGoToMenu = () => {
    setGameState('MENU');
    setMenuIndex(0);
    synth.playTone(300, 'triangle', 0.1, 0.1);
  };

  const spawnFood = () => {
    const engine = engineRef.current;
    let newFood;
    let attempts = 0;
    while (attempts < 200) {
      const x = Math.floor(Math.random() * 30);
      const y = Math.floor(Math.random() * 18);
      const onSnake = engine.snake.some(seg => seg.x === x && seg.y === y);
      if (!onSnake) {
        newFood = { x, y };
        break;
      }
      attempts++;
    }
    if (!newFood) {
      newFood = { x: 15, y: 9 };
    }
    engine.food = newFood;
  };

  const startGame = () => {
    const engine = engineRef.current;
    engine.snake = [
      { x: 12, y: 9 },
      { x: 11, y: 9 },
      { x: 10, y: 9 },
      { x: 9, y: 9 },
    ];
    engine.direction = 'RIGHT';
    engine.nextDirection = 'RIGHT';
    spawnFood();
    setScore(0);
    setGameState('PLAYING');
    synth.playNokiaTune();
  };

  const getMenuList = () => {
    switch (gameState) {
      case 'MENU':
        return [
          '1. START GAME', 
          '2. SELECT SPEED: ' + SPEED_PRESETS[speed].name, 
          '3. SCREEN COLOR', 
          '4. FX: ' + (muted ? 'MUTED' : 'ENABLED'),
          '5. EXIT GAME'
        ];
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
        startGame();
      } else if (index === 1) {
        // Toggle speed
        const keys = Object.keys(SPEED_PRESETS);
        const currentIdx = keys.indexOf(speed);
        const nextSpeed = keys[(currentIdx + 1) % keys.length];
        setSpeed(nextSpeed);
      } else if (index === 2) {
        setGameState('LCD_COLOR');
        setMenuIndex(Object.keys(SCREEN_THEMES).indexOf(theme));
      } else if (index === 3) {
        toggleMute();
      } else if (index === 4) {
        onClose();
      }
    } else if (gameState === 'LCD_COLOR') {
      const keys = Object.keys(SCREEN_THEMES);
      setTheme(keys[index]);
      setGameState('MENU');
      setMenuIndex(2);
    }
  };

  const pressPhoneKey = (key) => {
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
  };

  // Keyboard binding updates
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMenuState = ['MENU', 'LCD_COLOR'].includes(gameState);
      
      // Global Mute shortcut
      if (e.key === '*' || e.key === 'm' || e.key === 'M') {
        toggleMute();
        return;
      }

      // Global Reset shortcut in playing mode
      if (gameState === 'PLAYING' && (e.key === 'r' || e.key === 'R')) {
        startGame();
        return;
      }

      if (isMenuState) {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === '2') {
          e.preventDefault();
          pressPhoneKey('up');
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === '8') {
          e.preventDefault();
          pressPhoneKey('down');
        } else if (e.key === 'Enter' || e.key === ' ' || e.key === '5') {
          e.preventDefault();
          pressPhoneKey('select');
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

      const engine = engineRef.current;
      if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === '4') && engine.direction !== 'RIGHT') {
        engine.nextDirection = 'LEFT';
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === '6') && engine.direction !== 'LEFT') {
        engine.nextDirection = 'RIGHT';
      } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === '2') && engine.direction !== 'DOWN') {
        engine.nextDirection = 'UP';
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === '8') && engine.direction !== 'UP') {
        engine.nextDirection = 'DOWN';
      } else if (e.key === 'Escape') {
        handleGoToMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, menuIndex, muted, speed, theme]);

  // Frame logic loop running at selected speed interval
  useEffect(() => {
    let animId;
    let lastTime = 0;

    const gameLoop = (timestamp) => {
      if (gameState !== 'PLAYING') return;

      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;
      const preset = SPEED_PRESETS[speed];

      if (elapsed >= preset.ms) {
        lastTime = timestamp;

        const engine = engineRef.current;
        engine.direction = engine.nextDirection;

        const head = { ...engine.snake[0] };
        if (engine.direction === 'UP') head.y -= 1;
        if (engine.direction === 'DOWN') head.y += 1;
        if (engine.direction === 'LEFT') head.x -= 1;
        if (engine.direction === 'RIGHT') head.x += 1;

        // Collision Check: wall or self
        const hitWall = head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 18;
        const hitSelf = engine.snake.some(seg => seg.x === head.x && seg.y === head.y);

        if (hitWall || hitSelf) {
          synth.playHit();
          setGameState('GAMEOVER');
          return;
        }

        // Move Snake Head
        engine.snake.unshift(head);

        // Check if ate food
        if (head.x === engine.food.x && head.y === engine.food.y) {
          synth.playEat();
          setScore(s => {
            const nextScore = s + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              try {
                localStorage.setItem('snake-high-score', nextScore.toString());
              } catch (e) {}
            }
            return nextScore;
          });
          spawnFood();
        } else {
          engine.snake.pop();
        }
      }

      // Draw Grid on Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const themeColors = SCREEN_THEMES[theme];
        const engine = engineRef.current;

        ctx.fillStyle = themeColors.bg;
        ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

        // Draw pixelated border
        ctx.strokeStyle = `${themeColors.text}22`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(1.5, 1.5, VIEW_WIDTH - 3, VIEW_HEIGHT - 3);

        // Draw food (blinking look or distinct square)
        ctx.fillStyle = themeColors.text;
        const foodSize = 7;
        const offset = 1.5;
        ctx.fillRect(engine.food.x * 10 + offset + 1, engine.food.y * 10 + offset + 1, foodSize, foodSize);

        // Draw snake
        engine.snake.forEach((seg, idx) => {
          ctx.fillStyle = idx === 0 ? themeColors.text : `${themeColors.text}d0`;
          ctx.fillRect(seg.x * 10 + offset, seg.y * 10 + offset, foodSize + 1, foodSize + 1);

          // Head eyes drawing
          if (idx === 0) {
            ctx.fillStyle = themeColors.bg;
            if (engine.direction === 'UP' || engine.direction === 'DOWN') {
              ctx.fillRect(seg.x * 10 + offset + 1.5, seg.y * 10 + offset + 3, 1.5, 1.5);
              ctx.fillRect(seg.x * 10 + offset + 4.5, seg.y * 10 + offset + 3, 1.5, 1.5);
            } else {
              ctx.fillRect(seg.x * 10 + offset + 3, seg.y * 10 + offset + 1.5, 1.5, 1.5);
              ctx.fillRect(seg.x * 10 + offset + 3, seg.y * 10 + offset + 4.5, 1.5, 1.5);
            }
          }
        });
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, theme, speed]);

  const activeThemeColors = SCREEN_THEMES[theme];
  const listItems = getMenuList();

  return (
    <div 
      ref={parentContainerRef}
      onClick={() => synth.init()}
      className="w-full h-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative select-none"
    >
      {/* Floating Close button */}
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
        <span>LIVY RETRO SNAKE ARCADE</span>
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
              <span>SNAKE</span>
            </div>
            <div className="text-[10px] font-extrabold uppercase">
              {gameState === 'PLAYING' ? `SPEED: ${SPEED_PRESETS[speed].name}` : 'MENU'}
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

            {/* INTERACTIVE LCD SYSTEM MENU */}
            {['MENU', 'LCD_COLOR'].includes(gameState) && (
              <div className="absolute inset-0 flex flex-col justify-between p-2 select-none" style={{ color: activeThemeColors.text }}>
                
                {/* Menu Page Header */}
                <div className="text-center text-[10px] font-black uppercase tracking-wider border-b pb-0.5" style={{ borderColor: `${activeThemeColors.text}33` }}>
                  {gameState === 'MENU' && '--- MAIN MENU ---'}
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

            {/* GAME OVER STATE OVERLAY */}
            {gameState === 'GAMEOVER' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-center p-3 z-50">
                <h3 className="text-red-500 text-xs font-black tracking-widest uppercase mb-1">
                  💀 GAME OVER 💀
                </h3>
                <p className="text-slate-300 text-[10px] mb-1 font-mono">
                  Score: {score}
                </p>
                <p className="text-amber-400 text-[9px] mb-2 font-mono">
                  High Score: {highScore}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startGame();
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

          </div>

          {/* SCREEN BOTTOM HUD */}
          <div className="flex justify-between items-center text-[9px] font-mono mt-1 pt-1 border-t select-none" style={{ color: activeThemeColors.text, borderColor: `${activeThemeColors.text}33` }}>
            <div>
              <span>High: </span>
              <span className="font-bold">{highScore}</span>
            </div>
            <div>
              <span>Score: </span>
              <span className="font-bold">{score}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Keyboard Controls Bar */}
      <div className="absolute bottom-6 flex flex-col items-center gap-1.5 opacity-80 max-w-[420px] px-6 text-center select-none">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 font-mono tracking-tight">
          <Keyboard size={12} className="text-slate-500" />
          <span>CONTROLS:</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono leading-snug">
          Menu: <span className="text-slate-400">▲/▼ [W/S]</span> • Select: <span className="text-slate-400">[Space/Enter]</span><br />
          Steer Snake: <span className="text-slate-400">WASD or Arrow Keys</span> • Back: <span className="text-slate-400">[Esc]</span><br />
          Toggles: <span className="text-slate-400">[*] Mute Tone</span> • <span className="text-slate-400">[R] Reset Game</span>
        </p>
      </div>
    </div>
  );
}
