/* ==========================================
   LEVEL UP! Retro Arcade JavaScript Logic
   ========================================== */

// --- Game/Site State ---
let state = {
  muted: true,
  crtEnabled: true,
  activeFighter: 'newbie',
  highScores: [],
  achievements: {
    gameMaster: false,
    fighterSelect: false,
    questExplorer: false
  }
};

// --- Fighter Database ---
const fighterData = {
  newbie: {
    name: "THE NEWBIE",
    lvl: "LVL 1",
    image: "assets/level_1_newbie.png",
    hp: 10,
    maxHp: 10,
    mp: 5,
    maxMp: 5,
    xp: 10,
    maxXp: 100,
    class: "Gamer Spawn",
    special: "Ultrasonic Screech",
    attributes: [
      "Cuteness: 99",
      "Diaper Armor: +5",
      "Sleeplessness: 100%"
    ],
    inventory: [
      { icon: "🍼", title: "Baby Bottle: Restores 50% MP" },
      { icon: "🪘", title: "Baby Rattler: Distracts enemies" }
    ],
    description: "Freshly spawned into the server of life. Equipped with diapers and a sleeping schedule that confuses all players. High potential, currently zero skills."
  },
  sidekick: {
    name: "THE SIDEKICK",
    lvl: "LVL 10",
    image: "assets/level_10_sidekick.png",
    hp: 45,
    maxHp: 45,
    mp: 20,
    maxMp: 20,
    xp: 320,
    maxXp: 500,
    class: "Handheld Casual",
    special: "Pocket Console Shield",
    attributes: [
      "Agility: +15",
      "Candy Addiction: 90%",
      "Bedtime Defiance: +20"
    ],
    inventory: [
      { icon: "👾", title: "Pocket Console: Boosts nostalgia" },
      { icon: "🎒", title: "School Bag: Holds unlimited candy" },
      { icon: "🍭", title: "Mega Lollipop: +10 Speed burst" }
    ],
    description: "Unlocked the double-jump and schoolyard bartering skills. Spends most attribute points on high-fructose corn syrup and handheld cartridge blowing."
  },
  "beta-tester": {
    name: "BETA TESTER",
    lvl: "LVL 18",
    image: "assets/level_18_beta_tester.png",
    hp: 80,
    maxHp: 80,
    mp: 55,
    maxMp: 55,
    xp: 850,
    maxXp: 1000,
    class: "VR Nocturnal",
    special: "Overclock Caffeine Rush",
    attributes: [
      "Coding Prowess: +35",
      "Eye strain: 80%",
      "Pizza Absorption: 100%"
    ],
    inventory: [
      { icon: "🕶️", title: "VR Headset: Simulates touch grass" },
      { icon: "🍕", title: "Cold Pizza: Heals 30 HP instantly" },
      { icon: "🥤", title: "Energy Elixir: Infinite MP for 10s" }
    ],
    description: "Survives entirely on energy drinks, instant noodles, and compiler warnings. Has developed advanced reflexes for dodging real-world responsibilities."
  },
  "guild-master": {
    name: "GUILD MASTER",
    lvl: "LVL 25",
    image: "assets/level_25_guild_master.png",
    hp: 99,
    maxHp: 99,
    mp: 99,
    maxMp: 99,
    xp: 9999,
    maxXp: 9999,
    class: "Birthday Legend",
    special: "Eternal Level Up",
    attributes: [
      "Wisdom: 85",
      "Charisma: 95",
      "Party Leadership: MAX"
    ],
    inventory: [
      { icon: "👑", title: "Party Crown: Radiates awesome vibes" },
      { icon: "⚔️", title: "Key-Sword: Cuts cake with +20 crit" },
      { icon: "🍰", title: "Mythic Cake: Unlocks god mode" },
      { icon: "☕", title: "Legendary Brew: Resets fatigue" }
    ],
    description: "The ultimate form. Reached level 25 of this online simulator. Respected leader of the birthday raid party. Immunity to hangovers and age-related groans (for now)."
  }
};

// --- Web Audio API retro synthesizer ---
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Custom 8-bit sound generator
function playTone(freq, type, duration, volume = 0.1, slideToFreq = null) {
  if (state.muted) return;
  initAudio();

  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type; // 'square', 'sawtooth', 'triangle', 'sine'
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, audioCtx.currentTime + duration);
    }

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    console.error("Audio error:", err);
  }
}

// Sound effects catalog
const soundFX = {
  coin: () => {
    // Quick high-pitch double beep (classic NES coin)
    playTone(987.77, 'square', 0.08, 0.08); // B5
    setTimeout(() => {
      playTone(1318.51, 'square', 0.25, 0.08); // E6
    }, 80);
  },
  select: () => {
    // Small low-to-high chirp
    playTone(300, 'triangle', 0.1, 0.15, 600);
  },
  start: () => {
    // Upward chord progression
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'square', 0.15, 0.1);
      }, idx * 100);
    });
    setTimeout(() => {
      // Final vibrato beep
      playTone(783.99, 'square', 0.4, 0.12, 880);
    }, notes.length * 100);
  },
  laser: () => {
    // High-to-low frequency sweep
    playTone(880, 'sawtooth', 0.15, 0.06, 110);
  },
  hit: () => {
    // Short burst of noise/crackle (using triangle sweep)
    playTone(220, 'triangle', 0.1, 0.2, 50);
  },
  explode: () => {
    // Descending explosion rumble
    playTone(180, 'sawtooth', 0.35, 0.25, 30);
    playTone(90, 'triangle', 0.4, 0.3, 10);
  },
  gameOver: () => {
    // Descending melancholy tune
    const notes = [392.00, 369.99, 349.23, 293.66]; // G4, F#4, F4, D4
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'square', 0.22, 0.12);
      }, idx * 250);
    });
  },
  levelup: () => {
    // Fast ascending neon scale
    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // C5 to C6
    scale.forEach((freq, idx) => {
      setTimeout(() => {
        playTone(freq, 'square', 0.08, 0.08);
      }, idx * 70);
    });
    setTimeout(() => {
      // Big triumphant note
      playTone(1318.51, 'square', 0.6, 0.12);
    }, scale.length * 70);
  }
};


// --- Setup Event Listeners & UI Toggles ---

document.addEventListener("DOMContentLoaded", () => {
  setupGlobalControls();
  setupSplashScreen();
  setupNavigation();
  setupFighterSelect();
  setupQuestLog();
  setupLeaderboard();
  setupMiniGame();
  
  // Show toast on page load
  setTimeout(() => {
    showToast("Press START to activate terminal!");
  }, 1000);
});

// Toast notification helper
function showToast(text) {
  const toast = document.getElementById("toast-notification");
  const desc = document.getElementById("toast-text");
  desc.textContent = text;
  
  toast.classList.remove("hidden");
  
  // Reset animation
  toast.style.animation = 'none';
  toast.offsetHeight; // Trigger reflow
  toast.style.animation = null;

  // Sound cue
  if (audioCtx && !state.muted) {
    playTone(523.25, 'sine', 0.15, 0.1, 783.99);
  }

  // Clear previous timeout
  if (toast.timeoutId) clearTimeout(toast.timeoutId);
  
  toast.timeoutId = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}

// Setup Global Controls (Sound, CRT Toggle)
function setupGlobalControls() {
  const soundBtn = document.getElementById("sound-toggle");
  const crtBtn = document.getElementById("crt-toggle");

  soundBtn.addEventListener("click", () => {
    state.muted = !state.muted;
    initAudio();
    
    if (state.muted) {
      soundBtn.classList.remove("sound-on");
      soundBtn.classList.add("sound-off");
      soundBtn.querySelector(".icon").textContent = "🔇";
      soundBtn.querySelector(".label").textContent = "MUTED";
    } else {
      soundBtn.classList.remove("sound-off");
      soundBtn.classList.add("sound-on");
      soundBtn.querySelector(".icon").textContent = "🔊";
      soundBtn.querySelector(".label").textContent = "SOUND: ON";
      // Play a little beep to confirm
      soundFX.coin();
    }
  });

  crtBtn.addEventListener("click", () => {
    state.crtEnabled = !state.crtEnabled;
    const body = document.body;
    
    if (state.crtEnabled) {
      body.classList.add("crt-enabled");
      body.classList.remove("crt-disabled");
      crtBtn.classList.add("scanline-on");
      crtBtn.classList.remove("scanline-off");
      crtBtn.querySelector(".label").textContent = "CRT: ON";
    } else {
      body.classList.remove("crt-enabled");
      body.classList.add("crt-disabled");
      crtBtn.classList.remove("scanline-on");
      crtBtn.classList.add("scanline-off");
      crtBtn.querySelector(".label").textContent = "CRT: OFF";
    }
    soundFX.select();
  });
}

// Splash Screen transition logic
function setupSplashScreen() {
  const startBtn = document.getElementById("press-start-btn");
  const splash = document.getElementById("home");
  const dashboard = document.getElementById("dashboard");

  startBtn.addEventListener("click", () => {
    // Audio Context must be initialized on a click
    initAudio();
    
    // Play start retro fanfare
    soundFX.start();

    // Visual transition
    splash.classList.add("slide-up");
    dashboard.classList.remove("hidden");
    
    setTimeout(() => {
      dashboard.classList.add("fade-in");
      splash.style.display = "none";
      showToast("System Online: Level 25 Unlocked!");
    }, 800);
  });
}

// Section navigation logic
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".dashboard-section");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute("data-target");
      
      // Update nav link states
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Update sections visibility
      sections.forEach(sec => {
        sec.classList.remove("active");
        if (sec.id === targetId) {
          sec.classList.add("active");
        }
      });

      // Sound feedback
      soundFX.select();
    });
  });
}

// Character Selection Grid & Stats Updating
function setupFighterSelect() {
  const cards = document.querySelectorAll(".fighter-card");
  
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const fighterKey = card.getAttribute("data-fighter");
      
      // Toggle active states on cards
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      // Play select beep
      soundFX.select();

      // Trigger achievement on selection of Guild Master
      if (fighterKey === 'guild-master' && !state.achievements.fighterSelect) {
        state.achievements.fighterSelect = true;
        soundFX.levelup();
        showToast("Unlocked: Guild Master Form Reached!");
      }

      // Update Stats Panel Details
      updateFighterStatsPanel(fighterKey);
    });
  });
}

function updateFighterStatsPanel(key) {
  const data = fighterData[key];
  if (!data) return;

  // Set textual data
  document.getElementById("stats-fighter-name").textContent = data.name;
  document.getElementById("stats-fighter-lvl").textContent = data.lvl;
  document.getElementById("stats-fighter-image").src = data.image;
  
  // Fill rates
  const hpPercent = (data.hp / data.maxHp) * 100;
  const mpPercent = (data.mp / data.maxMp) * 100;
  const xpPercent = (data.xp / data.maxXp) * 100;

  document.getElementById("stats-hp-fill").style.width = `${hpPercent}%`;
  document.getElementById("stats-hp-text").textContent = `${data.hp}/${data.maxHp}`;

  document.getElementById("stats-mp-fill").style.width = `${mpPercent}%`;
  document.getElementById("stats-mp-text").textContent = `${data.mp}/${data.maxMp}`;

  document.getElementById("stats-xp-fill").style.width = `${xpPercent}%`;
  document.getElementById("stats-xp-text").textContent = `${data.xp}/${data.maxXp}`;

  document.getElementById("stats-class").textContent = data.class;
  document.getElementById("stats-special").textContent = data.special;

  // Build attributes list
  const attrList = document.getElementById("stats-attributes");
  attrList.innerHTML = "";
  data.attributes.forEach(attr => {
    const li = document.createElement("li");
    li.textContent = attr;
    attrList.appendChild(li);
  });

  // Build Inventory grid (fixed size 4 slots)
  const invGrid = document.getElementById("stats-inventory");
  invGrid.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement("div");
    if (data.inventory[i]) {
      slot.className = "inv-slot";
      slot.title = data.inventory[i].title;
      
      const span = document.createElement("span");
      span.className = "inv-icon";
      span.textContent = data.inventory[i].icon;
      slot.appendChild(span);
    } else {
      slot.className = "inv-slot empty";
    }
    invGrid.appendChild(slot);
  }

  // Description
  document.getElementById("stats-description").textContent = data.description;
}

// Quest Log timeline accordions
function setupQuestLog() {
  const quests = document.querySelectorAll(".quest-item");

  quests.forEach(quest => {
    const header = quest.querySelector(".quest-header");
    header.addEventListener("click", () => {
      const isAlreadyActive = quest.classList.contains("active-quest");

      // Collapse all quests
      quests.forEach(q => q.classList.remove("active-quest"));

      // If clicked quest wasn't active, expand it
      if (!isAlreadyActive) {
        quest.classList.add("active-quest");
        soundFX.select();
        
        // Mark quest status to ACTIVE when expanded
        const statusSpan = quest.querySelector(".quest-status");
        if (statusSpan.textContent.includes("LOCKED")) {
          statusSpan.textContent = "▶ ACTIVE";
          statusSpan.className = "quest-status text-yellow";
        }
      } else {
        soundFX.select();
      }
    });
  });
}

// Leaderboard Messages logic
function setupLeaderboard() {
  const form = document.getElementById("rsvp-form");
  const tableBody = document.getElementById("leaderboard-body");

  // Load from local storage
  if (localStorage.getItem("retro_arcade_rsvps")) {
    state.highScores = JSON.parse(localStorage.getItem("retro_arcade_rsvps"));
    renderLeaderboard();
  } else {
    // Initial defaults
    state.highScores = [
      { name: "MARIO", class: "Bard", message: "It's-a your birthday! Level Up, my friend! Let's eat some mushroom cake! 🍄" },
      { name: "OBI-WAN", class: "Warrior", message: "May the force (and cake) be with you on your 25th rotation! ⚔️" },
      { name: "ZELDA", class: "Mage", message: "It's dangerous to go alone on this birthday quest. Take this piece of cake! 🍰" },
      { name: "CHIEF", class: "Paladin", message: "Master Chief, mind telling me what you're doing at that party? Sir, finishing this buffet. 🍔" }
    ];
    localStorage.setItem("retro_arcade_rsvps", JSON.stringify(state.highScores));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("guest-name");
    const classInput = document.getElementById("guest-class");
    const msgInput = document.getElementById("guest-message");

    const newScore = {
      name: nameInput.value.toUpperCase().trim(),
      class: classInput.value,
      message: msgInput.value.trim()
    };

    // Insert at index 0 or push
    state.highScores.unshift(newScore);

    // Save
    localStorage.setItem("retro_arcade_rsvps", JSON.stringify(state.highScores));

    // UI render
    renderLeaderboard();

    // Sound and Notification feedback
    soundFX.levelup();
    showToast(`New Player Joined: ${newScore.name}!`);

    // Reset Form inputs
    form.reset();
  });

  function renderLeaderboard() {
    tableBody.innerHTML = "";
    
    state.highScores.forEach((row, idx) => {
      const tr = document.createElement("tr");
      if (idx < 2) tr.className = "top-row"; // Stylized highlights for top rows

      const rankStr = String(idx + 1).padStart(2, '0');
      let classEmoji = "⚔️";
      if (row.class === "Mage") classEmoji = "🔮";
      if (row.class === "Rogue") classEmoji = "🗡️";
      if (row.class === "Bard") classEmoji = "🎵";
      if (row.class === "Paladin") classEmoji = "🛡️";

      tr.innerHTML = `
        <td>${rankStr}</td>
        <td>${escapeHTML(row.name)}</td>
        <td>${classEmoji} ${row.class.toUpperCase()}</td>
        <td>${escapeHTML(row.message)}</td>
      `;

      tableBody.appendChild(tr);
    });
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
}

// --- SECTION 3: Playable Arcade Game "CANDLE DEFENDER" ---
function setupMiniGame() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // Game overlays
  const startOverlay = document.getElementById("game-start-overlay");
  const gameOverOverlay = document.getElementById("game-over-overlay");
  const achievementPanel = document.getElementById("achievement-unlocked");
  const finalScoreSpan = document.getElementById("game-final-score");

  // Buttons
  const startBtn = document.getElementById("start-game-btn");
  const restartBtn = document.getElementById("restart-game-btn");

  // Mobile controls
  const dpadLeft = document.getElementById("dpad-left");
  const dpadRight = document.getElementById("dpad-right");
  const actionShoot = document.getElementById("action-shoot");

  // HUD
  const scoreSpan = document.getElementById("hud-score");
  const livesSpan = document.getElementById("hud-lives");

  // Canvas bounds
  const width = canvas.width;
  const height = canvas.height;

  // Game state variables
  let gameScore = 0;
  let gameLives = 3;
  let player = {
    x: width / 2 - 20,
    y: height - 50,
    width: 40,
    height: 30,
    speed: 7,
    movingLeft: false,
    movingRight: false,
    lastShotTime: 0,
    shootCooldown: 250 // ms
  };

  let projectiles = [];
  let enemies = []; // Falling candles
  let particles = []; // Particle explosion effects
  let animationFrameId = null;
  let spawnInterval = null;
  let lastTime = 0;

  // Keyboard handlers
  const keys = {};

  function handleKeyDown(e) {
    keys[e.code] = true;
    
    if (e.code === "ArrowLeft" || e.code === "KeyA") player.movingLeft = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") player.movingRight = true;
    if (e.code === "Space" && e.target === document.body) {
      e.preventDefault(); // Prevent page scrolling down
    }
  }

  function handleKeyUp(e) {
    keys[e.code] = false;
    
    if (e.code === "ArrowLeft" || e.code === "KeyA") player.movingLeft = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") player.movingRight = false;
  }

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  // Mobile/Touch Control Handlers
  dpadLeft.addEventListener("mousedown", () => { player.movingLeft = true; });
  dpadLeft.addEventListener("mouseup", () => { player.movingLeft = false; });
  dpadLeft.addEventListener("touchstart", (e) => { e.preventDefault(); player.movingLeft = true; });
  dpadLeft.addEventListener("touchend", () => { player.movingLeft = false; });

  dpadRight.addEventListener("mousedown", () => { player.movingRight = true; });
  dpadRight.addEventListener("mouseup", () => { player.movingRight = false; });
  dpadRight.addEventListener("touchstart", (e) => { e.preventDefault(); player.movingRight = true; });
  dpadRight.addEventListener("touchend", () => { player.movingRight = false; });

  actionShoot.addEventListener("mousedown", () => { fireProjectile(); });
  actionShoot.addEventListener("touchstart", (e) => { e.preventDefault(); fireProjectile(); });

  // Game Start triggers
  startBtn.addEventListener("click", () => {
    initAudio();
    startGame();
  });

  restartBtn.addEventListener("click", () => {
    initAudio();
    startGame();
  });

  function startGame() {
    // Reset states
    gameScore = 0;
    gameLives = 3;
    projectiles = [];
    enemies = [];
    particles = [];
    player.x = width / 2 - 20;
    player.movingLeft = false;
    player.movingRight = false;
    lastTime = performance.now();

    // HUD updates
    updateHUD();

    // Hiding screens
    startOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    achievementPanel.classList.add("hidden");

    // Clear and set spawn timer
    if (spawnInterval) clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnEnemy, 1200);

    // Audio cue
    soundFX.start();

    // Launch game loop
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function fireProjectile() {
    const now = Date.now();
    if (now - player.lastShotTime >= player.shootCooldown) {
      projectiles.push({
        x: player.x + player.width / 2 - 3,
        y: player.y - 10,
        width: 6,
        height: 12,
        speed: 8
      });
      player.lastShotTime = now;
      soundFX.laser();
    }
  }

  function spawnEnemy() {
    const colors = [
      { border: '#ff007f', fill: 'rgba(255, 0, 127, 0.4)', flame: '#ffff00' }, // Pink
      { border: '#bc13fe', fill: 'rgba(188, 19, 254, 0.4)', flame: '#ff007f' }, // Purple
      { border: '#ffff00', fill: 'rgba(255, 255, 0, 0.3)', flame: '#ff007f' }  // Yellow
    ];
    const design = colors[Math.floor(Math.random() * colors.length)];
    
    enemies.push({
      x: Math.random() * (width - 40) + 10,
      y: -50,
      width: 20,
      height: 35,
      speed: 1.5 + (gameScore / 100), // Speed up as score rises
      colors: design
    });
  }

  function createExplosion(x, y, color) {
    // Generate particle clusters
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        size: Math.random() * 4 + 2,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.08 + 0.04
      });
    }
  }

  function updateHUD() {
    scoreSpan.textContent = gameScore;
    livesSpan.textContent = "❤".repeat(Math.max(0, gameLives));
  }

  function endGame() {
    // Clear loops
    cancelAnimationFrame(animationFrameId);
    clearInterval(spawnInterval);

    // Final calculations
    finalScoreSpan.textContent = gameScore;
    gameOverOverlay.classList.remove("hidden");

    // Play death audio
    soundFX.gameOver();

    // Check achievement triggers
    if (gameScore >= 100) {
      achievementPanel.classList.remove("hidden");
      
      if (!state.achievements.gameMaster) {
        state.achievements.gameMaster = true;
        
        // Level up celebration!
        setTimeout(() => {
          soundFX.levelup();
          showToast("Achievement Unlocked: Master Cake Defender!");
        }, 800);
      }
    }
  }

  // Primary Game loop
  function gameLoop(timestamp) {
    if (gameLives <= 0) {
      endGame();
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // 1. Process Input
    if (keys["Space"]) {
      fireProjectile();
    }
    if (player.movingLeft && player.x > 0) {
      player.x -= player.speed;
    }
    if (player.movingRight && player.x < width - player.width) {
      player.x += player.speed;
    }

    // 2. Render Player Ship (Console style controller/hero)
    ctx.fillStyle = '#111';
    ctx.strokeStyle = '#bc13fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(player.x, player.y + 10, player.width, player.height - 10, 4);
    ctx.fill();
    ctx.stroke();

    // D-Pad and Buttons details on the controller
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(player.x + 28, player.y + 15, 6, 6); // Button A
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(player.x + 20, player.y + 15, 6, 6); // Button B
    ctx.fillStyle = '#aaa';
    ctx.fillRect(player.x + 5, player.y + 17, 10, 3); // Left control representation

    // Screen projector lens (draw glowing core)
    ctx.fillStyle = '#bc13fe';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      let p = projectiles[i];
      p.y -= p.speed;

      // Draw Laser Projectiles
      ctx.fillStyle = '#ff007f';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff007f';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.shadowBlur = 0; // Reset shadows

      // Remove offscreen lasers
      if (p.y < -20) {
        projectiles.splice(i, 1);
      }
    }

    // 4. Update Enemies (Birthday Candles)
    for (let i = enemies.length - 1; i >= 0; i--) {
      let e = enemies[i];
      e.y += e.speed;

      // Draw candle base
      ctx.fillStyle = e.colors.fill;
      ctx.strokeStyle = e.colors.border;
      ctx.lineWidth = 2;
      ctx.fillRect(e.x + 4, e.y + 8, e.width - 8, e.height - 8);
      ctx.strokeRect(e.x + 4, e.y + 8, e.width - 8, e.height - 8);

      // Draw candle stripes
      ctx.fillStyle = e.colors.border;
      ctx.fillRect(e.x + 4, e.y + 16, e.width - 8, 4);
      ctx.fillRect(e.x + 4, e.y + 26, e.width - 8, 4);

      // Draw glowing candle flame (pulsing)
      const flameHeight = 8 + Math.sin(timestamp * 0.02) * 2;
      ctx.fillStyle = e.colors.flame;
      ctx.beginPath();
      ctx.moveTo(e.x + e.width / 2, e.y - flameHeight + 6);
      ctx.quadraticCurveTo(e.x + e.width / 2 + 5, e.y + 4, e.x + e.width / 2, e.y + 8);
      ctx.quadraticCurveTo(e.x + e.width / 2 - 5, e.y + 4, e.x + e.width / 2, e.y - flameHeight + 6);
      ctx.fill();

      // Check collision with lasers
      for (let j = projectiles.length - 1; j >= 0; j--) {
        let p = projectiles[j];
        if (p.x < e.x + e.width &&
            p.x + p.width > e.x &&
            p.y < e.y + e.height &&
            p.y + p.height > e.y) {
          
          // Trigger explosion particle
          createExplosion(e.x + e.width / 2, e.y + e.height / 2, e.colors.border);
          soundFX.explode();

          // Remove objects
          enemies.splice(i, 1);
          projectiles.splice(j, 1);

          // Update Score
          gameScore += 10;
          updateHUD();
          break; // Exit laser loop for this candle
        }
      }

      // Check boundary (hits bottom ground / giant birthday cake)
      if (enemies[i] && e.y > height - 60) {
        enemies.splice(i, 1);
        gameLives--;
        updateHUD();
        soundFX.hit();

        // Canvas hit flash
        ctx.fillStyle = 'rgba(255, 0, 127, 0.4)';
        ctx.fillRect(0, 0, width, height);
      }
    }

    // 5. Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      let pt = particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= pt.decay;

      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      ctx.globalAlpha = 1.0; // Reset opacity

      if (pt.life <= 0) {
        particles.splice(i, 1);
      }
    }

    animationFrameId = requestAnimationFrame(gameLoop);
  }
}
