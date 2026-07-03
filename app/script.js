const STORAGE_KEY = "husti-brutal-v2";
const LEGACY_STORAGE_KEYS = ["husti-brutal-v1"];
const APP_STATE_VERSION = 2;
const DEFAULT_SITES = ["Piggy Bank", "Emergency Fund", "Travel Jar", "Future Car"];
const DEFAULT_GAMES = ["Skip Coffee", "Cooked at Home", "Walked instead of Cab", "Salary Bonus", "Spare Change"];
const DEFAULT_BG = "fluid";
const DEFAULT_BG_OPACITY = 0.6;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const el = {
  navPills: document.querySelectorAll(".nav-pill"),
  views: document.querySelectorAll(".master-view"),
  todayBtn: document.getElementById("today-button"),
  brandLogo: document.getElementById("brand-logo"),
  bgDropdown: document.getElementById("bg-dropdown"),
  fluidLayer: document.getElementById("fluid-layer"),
  wallpaperLayer: document.getElementById("wallpaper-layer"),
  bgOpacity: document.getElementById("bg-opacity"),
  bgOpacityVal: document.getElementById("bg-opacity-val"),

  monthLabel: document.getElementById("month-label"),
  prevYear: document.getElementById("prev-year"),
  nextYear: document.getElementById("next-year"),
  prevMonth: document.getElementById("prev-month"),
  nextMonth: document.getElementById("next-month"),
  anaPrevMonth: document.getElementById("ana-prev-month"),
  anaNextMonth: document.getElementById("ana-next-month"),
  anaMonthLabel: document.getElementById("ana-month-label"),

  weekdayRow: document.getElementById("weekday-row"),
  calendarGrid: document.getElementById("calendar-grid"),

  modal: document.getElementById("info-modal"),
  closeModal: document.getElementById("close-modal"),
  modalHeading: document.getElementById("modal-date-heading"),
  modalCount: document.getElementById("session-count"),
  modalNet: document.getElementById("modal-net"),
  modalWon: document.getElementById("modal-won"),
  modalLost: document.getElementById("modal-lost"),

  sessionForm: document.getElementById("session-form"),
  sessionLabel: document.getElementById("session-label"),
  sessionSite: document.getElementById("session-site"),
  sessionGame: document.getElementById("session-game"),
  siteSelect: document.getElementById("site-select"),
  siteOptions: document.getElementById("site-options"),
  gameSelect: document.getElementById("game-select"),
  gameOptions: document.getElementById("game-options"),
  recordSection: document.getElementById("record-action-section"),
  sessionWon: document.getElementById("session-won"),
  sessionLost: document.getElementById("session-lost"),
  sessionList: document.getElementById("session-list"),

  notesForm: document.getElementById("notes-form"),
  dailyNotes: document.getElementById("daily-notes"),

  bankrollForm: document.getElementById("bankroll-form"),
  startingBankroll: document.getElementById("starting-bankroll"),
  siteForm: document.getElementById("site-form"),
  siteName: document.getElementById("site-name"),
  siteList: document.getElementById("site-list"),
  gameForm: document.getElementById("game-form"),
  gameName: document.getElementById("game-name"),
  gameList: document.getElementById("game-list"),

  exportBtn: document.getElementById("export-button"),
  importBtn: document.getElementById("import-button"),
  importFile: document.getElementById("import-file"),
  statusText: document.getElementById("status-text"),



  currentBankroll: document.getElementById("current-bankroll"),
  overallNet: document.getElementById("overall-net"),
  monthNet: document.getElementById("month-net"),
  monthBreakdown: document.getElementById("month-breakdown"),
  weekNet: document.getElementById("week-net"),
  weekBreakdown: document.getElementById("week-breakdown"),
  bestDay: document.getElementById("best-day"),
  bestDayLabel: document.getElementById("best-day-label"),
  bestSite: document.getElementById("best-site"),
  bestGame: document.getElementById("best-game"),

  tagTemplate: document.getElementById("tag-template")
};

const today = new Date();


let state = loadState();
let visibleMonth = { year: today.getFullYear(), month: today.getMonth() };
let selectedDateKey = null;

void init();

async function init() {
  // Direct localStorage sanitization on load to guarantee immediate removal of poker terms
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      let parsed = JSON.parse(raw);
      if (parsed) {
        let changed = false;
        if (parsed.sites && Array.isArray(parsed.sites)) {
          parsed.sites = parsed.sites.map(x => {
            if (x === "PokerStars" || x === "GGPoker" || x === "888poker" || x === "PartyPoker") {
              changed = true;
              return x === "PokerStars" ? "Piggy Bank" : (x === "GGPoker" ? "Emergency Fund" : (x === "888poker" ? "Travel Jar" : "Future Car"));
            }
            return x;
          });
        }
        if (parsed.games && Array.isArray(parsed.games)) {
          parsed.games = parsed.games.map(x => {
            if (x === "Hold'em" || x === "Omaha" || x === "Cash Game" || x === "Tournament") {
              changed = true;
              return x === "Hold'em" ? "Skip Coffee" : (x === "Omaha" ? "Cooked at Home" : (x === "Cash Game" ? "Future Car" : "Travel Jar"));
            }
            return x;
          });
        }
        if (changed) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          state = normalizeState(parsed);
        }
      }
    }
  } catch (e) {
    console.warn("Direct migration error:", e);
  }

  bindNav();
  bindCalendarControls();
  bindForms();
  bindDataManagement();
  bindDangerZone();
  initCustomDropdowns();
  bindBackgroundLogic();
  setupTargetHandlers();
  setupGoalsHandlers();
  bindPresets();
  setupNoticeOverlay();
  setupCurrencySelector();
  bindInstructions();
  bindPresetsEditor();
  setupPWAInstall();

  el.weekdayRow.innerHTML = "";
  WEEKDAY_LABELS.forEach((label) => {
    const span = document.createElement("span");
    span.textContent = label;
    el.weekdayRow.appendChild(span);
  });

  el.closeModal.addEventListener("click", closeModal);

  applyBackground(state.activeBg);
  updateAll();
}

function setupTargetHandlers() {
  const editTargetBtn = document.getElementById("edit-target-btn");
  const targetEditForm = document.getElementById("target-edit-form");
  const targetValueInput = document.getElementById("target-value-input");
  const targetCancelBtn = document.getElementById("target-cancel-btn");

  if (editTargetBtn) {
    editTargetBtn.addEventListener("click", () => {
      targetValueInput.value = state.monthlyTarget || 10000;
      targetEditForm.style.display = "flex";
      editTargetBtn.style.display = "none";
    });
  }

  if (targetCancelBtn) {
    targetCancelBtn.addEventListener("click", () => {
      targetEditForm.style.display = "none";
      editTargetBtn.style.display = "block";
    });
  }

  if (targetEditForm) {
    targetEditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      state.monthlyTarget = parseAmt(targetValueInput.value) || 10000;
      saveState();
      updateAll();
      targetEditForm.style.display = "none";
      editTargetBtn.style.display = "block";
    });
  }
}

function setupGoalsHandlers() {
  const addGoalBtn = document.getElementById("add-goal-btn");
  const goalInputForm = document.getElementById("goal-input-form");
  const goalCancelBtn = document.getElementById("goal-cancel-btn");
  const goalNameInput = document.getElementById("goal-name-input");
  const goalAmountInput = document.getElementById("goal-amount-input");

  if (addGoalBtn) {
    addGoalBtn.addEventListener("click", () => {
      goalInputForm.style.display = "flex";
      addGoalBtn.style.display = "none";
    });
  }

  if (goalCancelBtn) {
    goalCancelBtn.addEventListener("click", () => {
      goalInputForm.style.display = "none";
      addGoalBtn.style.display = "block";
    });
  }

  if (goalInputForm) {
    goalInputForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = goalNameInput.value.trim();
      const amount = parseAmt(goalAmountInput.value);
      if (name && amount > 0) {
        if (!state.goals) state.goals = [];
        state.goals.push({
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
          name: name,
          target: amount
        });
        saveState();
        updateAll();
        goalInputForm.reset();
        goalInputForm.style.display = "none";
        addGoalBtn.style.display = "block";
      }
    });
  }
}

function bindPresets() {
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!selectedDateKey) return;
      const label = btn.dataset.label;
      const site = btn.dataset.site;
      const game = btn.dataset.game;
      const won = parseAmt(btn.dataset.won);
      const lost = parseAmt(btn.dataset.lost);

      if (!state.sites.includes(site)) state.sites.push(site);
      if (!state.games.includes(game)) state.games.push(game);

      const entry = getEntryMulti(selectedDateKey);
      entry.sessions.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        label: label,
        site: site,
        game: game,
        won: won,
        lost: lost,
        createdAt: new Date().toISOString()
      });

      saveState();
      updateAll();
      populateModal();
      statusMsg("Preset logged.");
    });
  });
}

function bindDangerZone() {
  const clearDataBtn = document.getElementById("clear-data-button");
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const warningText = "We don't use a backend for your safety, so your data is stored ONLY on this device. Clearing it will delete all your savings logs forever. Are you sure you want to clear up your data?";
      if (confirm(warningText)) {
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem("husti-notice-accepted");
        } catch (err) {
          console.warn("localStorage clear blocked:", err);
        }
        state = defaultState();
        saveState();
        updateAll();
        statusMsg("All data cleared.");
      }
    });
  }
}

function setupNoticeOverlay() {
  const overlay = document.getElementById("first-load-overlay");
  const agreeBtn = document.getElementById("notice-agree-button");
  if (!overlay || !agreeBtn) return;

  if (window.location.search.includes("onboarding=true")) {
    try {
      localStorage.removeItem("husti-notice-accepted");
    } catch (e) {
      console.warn("Notice accepted clear failed:", e);
    }
  }

  let isAccepted = "false";
  try {
    isAccepted = localStorage.getItem("husti-notice-accepted");
  } catch (err) {
    console.warn("localStorage read blocked:", err);
  }

  if (isAccepted === "true") {
    overlay.style.display = "none";
    return;
  }

  // Brand logo attention flash during notice
  const brandLogo = document.getElementById("brand-logo");
  if (brandLogo) {
    brandLogo.style.animation = "logo-attention-flash 1.5s ease infinite";
  }

  overlay.style.display = "flex";

  const screenChoice = document.getElementById("onboard-screen-choice");
  const screenInfo = document.getElementById("onboard-screen-info");
  const choiceNew = document.getElementById("onboard-choice-new");
  const choiceMigrate = document.getElementById("onboard-choice-migrate");
  const onboardFile = document.getElementById("onboard-import-file");

  if (screenChoice) screenChoice.style.display = "flex";
  if (screenInfo) screenInfo.style.display = "none";

  if (choiceNew) {
    choiceNew.addEventListener("click", () => {
      if (screenChoice) screenChoice.style.display = "none";
      if (screenInfo) screenInfo.style.display = "flex";
      
      let countdown = 25;
      agreeBtn.disabled = true;
      agreeBtn.style.opacity = "0.4";
      agreeBtn.style.cursor = "not-allowed";
      agreeBtn.textContent = `Please wait... (${countdown}s)`;

      const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          agreeBtn.textContent = `Please wait... (${countdown}s)`;
        } else {
          clearInterval(interval);
          agreeBtn.disabled = false;
          agreeBtn.style.opacity = "1";
          agreeBtn.style.cursor = "pointer";
          agreeBtn.textContent = "Let's Start Saving!";
        }
      }, 1000);
    });
  }

  if (choiceMigrate && onboardFile) {
    choiceMigrate.addEventListener("click", () => {
      onboardFile.click();
    });

    onboardFile.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || ""));
          const importedState = decompressImport(parsed);
          if (importedState) {
            state = normalizeState(importedState);
            saveState();
            
            try {
              localStorage.setItem("husti-notice-accepted", "true");
            } catch (err) {
              console.warn("Storage accepted set failed:", err);
            }

            overlay.style.display = "none";
            if (brandLogo) {
              brandLogo.style.animation = "none";
            }

            applyBackground(state.activeBg);
            updateAll();

            let totalActions = 0;
            Object.values(state.entries).forEach((e) => {
              totalActions += (e.sessions || []).length;
            });
            statusMsg(`Backup loaded: ${totalActions} actions imported!`);
          } else {
            alert("Invalid backup file format.");
          }
        } catch (error) {
          console.error(error);
          alert("Import failed.");
        }
        onboardFile.value = "";
      };
      reader.readAsText(file);
    });
  }

  agreeBtn.addEventListener("click", () => {
    try {
      localStorage.setItem("husti-notice-accepted", "true");
    } catch (err) {
      console.warn("localStorage write blocked:", err);
    }
    overlay.style.display = "none";
    if (brandLogo) {
      brandLogo.style.animation = "none";
    }
  });
}

function setupCurrencySelector() {
  const select = document.getElementById("currency-select");
  if (!select) return;

  select.value = state.currency || "₹";

  select.addEventListener("change", () => {
    state.currency = select.value;
    saveState();
    updateAll();
  });
}

function updateDailyTrend() {
  const chartContainer = document.getElementById("analytics-bar-chart");
  const startDateSpan = document.getElementById("trend-start-date");
  const endDateSpan = document.getElementById("trend-end-date");
  if (!chartContainer) return;

  chartContainer.innerHTML = "";

  const last7Days = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    last7Days.push(d);
  }

  if (startDateSpan) {
    startDateSpan.textContent = last7Days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  if (endDateSpan) {
    endDateSpan.textContent = last7Days[6].toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const dailyNets = last7Days.map(date => {
    const key = formatDateKey(date);
    const entry = state.entries[key];
    let net = 0;
    if (entry && entry.sessions) {
      entry.sessions.forEach(s => {
        net += (Number(s.won || 0) - Number(s.lost || 0));
      });
    }
    return {
      date,
      key,
      net,
      label: date.toLocaleDateString("en-US", { weekday: "short" }) + " " + date.getDate()
    };
  });

  const maxNet = Math.max(...dailyNets.map(d => Math.abs(d.net)), 100);

  dailyNets.forEach(day => {
    const col = document.createElement("div");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.alignItems = "center";
    col.style.flex = "1";
    col.style.height = "100%";
    col.style.justifyContent = "flex-end";
    col.style.position = "relative";

    const pct = Math.min(1, Math.abs(day.net) / maxNet);
    const barHeight = Math.max(4, Math.round(pct * 130));

    const bar = document.createElement("div");
    bar.style.width = "100%";
    bar.style.maxWidth = "28px";
    bar.style.height = `${barHeight}px`;
    bar.style.borderRadius = "6px 6px 0 0";
    bar.style.border = "var(--border-thin)";
    
    if (day.net > 0) {
      bar.style.background = "var(--accent-lime)";
      bar.style.border = "2px solid #ffffff";
    } else if (day.net < 0) {
      bar.style.background = "var(--accent-red)";
      bar.style.border = "2px solid #ffffff";
    } else {
      bar.style.background = "rgba(255,255,255,0.06)";
      bar.style.border = "1px dashed rgba(255,255,255,0.2)";
    }

    const valueLabel = document.createElement("span");
    valueLabel.style.fontSize = "0.7rem";
    valueLabel.style.fontWeight = "900";
    valueLabel.style.marginBottom = "4px";
    valueLabel.style.fontFamily = "var(--font-heading)";
    valueLabel.style.color = day.net > 0 ? "var(--accent-lime)" : (day.net < 0 ? "var(--accent-red)" : "var(--text-dim)");

    const currencySign = state.currency || "₹";
    valueLabel.textContent = day.net !== 0 ? `${day.net > 0 ? "+" : ""}${currencySign}${formatINRWithoutSymbol(day.net)}` : "—";

    const dayLabel = document.createElement("span");
    dayLabel.style.fontSize = "0.7rem";
    dayLabel.style.color = "var(--text-dim)";
    dayLabel.style.marginTop = "6px";
    dayLabel.style.fontWeight = "700";
    dayLabel.style.textTransform = "uppercase";
    dayLabel.textContent = day.date.toLocaleDateString("en-US", { weekday: "short" }) + " " + day.date.getDate();

    col.appendChild(valueLabel);
    col.appendChild(bar);
    col.appendChild(dayLabel);
    chartContainer.appendChild(col);
  });
}

function bindBackgroundLogic() {
  el.brandLogo.addEventListener("click", (event) => {
    event.stopPropagation();
    el.brandLogo.classList.toggle("open");
  });

  document.querySelectorAll(".bg-option").forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      const choice = option.dataset.bg || DEFAULT_BG;
      state.activeBg = choice;
      saveState();
      applyBackground(choice);
      el.brandLogo.classList.remove("open");
    });
  });

  el.bgOpacity.addEventListener("input", (event) => {
    state.bgOpacity = clampOpacity(event.target.value);
    el.bgOpacityVal.textContent = `${Math.round(state.bgOpacity * 100)}%`;
    
    // Set opacity only if active view is calendar
    const activeView = document.querySelector(".master-view.active");
    if (activeView && activeView.id === "view-calendar") {
      el.wallpaperLayer.style.opacity = state.bgOpacity;
    } else {
      el.wallpaperLayer.style.opacity = 0;
    }
    saveState();
  });
  el.bgOpacity.addEventListener("click", (event) => event.stopPropagation());

  document.addEventListener("click", () => {
    el.brandLogo.classList.remove("open");
  });
}

function applyBackground(choice) {
  if (choice === DEFAULT_BG) {
    el.fluidLayer.style.display = "block";
    el.wallpaperLayer.style.backgroundImage = "none";
    el.wallpaperLayer.innerHTML = "";
    el.wallpaperLayer.style.opacity = 0;
    return;
  }

  el.fluidLayer.style.display = "none";
  
  if (choice.endsWith(".mp4")) {
    el.wallpaperLayer.style.backgroundImage = "none";
    el.wallpaperLayer.innerHTML = `<video autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));"><source src="${choice}" type="video/mp4"></video>`;
  } else {
    el.wallpaperLayer.innerHTML = "";
    el.wallpaperLayer.style.backgroundImage = `url("${choice}")`;
  }
  
  const activeView = document.querySelector(".master-view.active");
  const targetId = activeView ? activeView.id : "view-calendar";
  if (targetId === "view-calendar") {
    el.wallpaperLayer.style.opacity = state.bgOpacity;
  } else {
    el.wallpaperLayer.style.opacity = 0;
  }
  
  el.bgOpacity.value = String(state.bgOpacity);
  el.bgOpacityVal.textContent = `${Math.round(state.bgOpacity * 100)}%`;
}

function bindNav() {
  el.navPills.forEach((button) => {
    button.addEventListener("click", (event) => {
      el.navPills.forEach((pill) => pill.classList.remove("active"));
      el.views.forEach((view) => view.classList.remove("active"));
      const target = event.currentTarget.dataset.view;
      event.currentTarget.classList.add("active");
      document.getElementById(target).classList.add("active");

      // Dynamic wallpaper visibility
      updateWallpaperVisibility(target);
    });
  });

  el.todayBtn.addEventListener("click", () => {
    visibleMonth = { year: today.getFullYear(), month: today.getMonth() };
    selectedDateKey = formatDateKey(today);
    updateAll();
    openModal();
  });
}

function bindCalendarControls() {
  el.prevYear.addEventListener("click", () => shiftMonth(-12));
  el.nextYear.addEventListener("click", () => shiftMonth(12));
  el.prevMonth.addEventListener("click", () => shiftMonth(-1));
  el.nextMonth.addEventListener("click", () => shiftMonth(1));
  el.anaPrevMonth.addEventListener("click", () => shiftMonth(-1));
  el.anaNextMonth.addEventListener("click", () => shiftMonth(1));
}

function bindForms() {
  el.bankrollForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.startBankroll = parseAmt(el.startingBankroll.value);
    saveState();
    updateAnalytics();
    statusMsg("Bankroll saved.");
  });

  el.siteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTag("sites", el.siteName.value);
    el.siteName.value = "";
  });

  el.gameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTag("games", el.gameName.value);
    el.gameName.value = "";
  });

  el.sessionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!selectedDateKey) {
      return;
    }

    const site = el.sessionSite.value;
    const game = el.sessionGame.value;
    if (!site || !game) {
      alert("Please add at least one site and one game in settings first.");
      return;
    }

    const entry = getEntryMulti(selectedDateKey);
    entry.sessions.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      label: el.sessionLabel.value.trim() || "Untitled Session",
      site,
      game,
      won: parseAmt(el.sessionWon.value),
      lost: parseAmt(el.sessionLost.value),
      createdAt: new Date().toISOString()
    });

    el.sessionForm.reset();
    saveState();
    updateAll();
    populateModal();
    statusMsg("Entry logged.");
  });

  el.notesForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!selectedDateKey) {
      return;
    }

    const notes = el.dailyNotes.value.trim();
    const existing = state.entries[selectedDateKey];
    if (!notes && !(existing?.sessions?.length)) {
      delete state.entries[selectedDateKey];
    } else {
      const entry = getEntryMulti(selectedDateKey);
      entry.notes = notes;
    }

    saveState();
    updateAll();
    populateModal();
    statusMsg("Notes saved.");
  });
}

function compactExport(stateObj) {
  const siteMap = stateObj.sites;
  const gameMap = stateObj.games;
  const entries = {};

  Object.entries(stateObj.entries).forEach(([dateKey, entry]) => {
    const sessions = (entry.sessions || []).map((s) => {
      const siteIdx = siteMap.indexOf(s.site);
      const gameIdx = gameMap.indexOf(s.game);
      return [
        s.label,
        siteIdx >= 0 ? siteIdx : s.site,
        gameIdx >= 0 ? gameIdx : s.game,
        s.won,
        s.lost
      ];
    });
    entries[dateKey] = {
      n: entry.notes || "",
      s: sessions
    };
  });

  return {
    v: APP_STATE_VERSION,
    b: stateObj.startBankroll,
    bg: stateObj.activeBg,
    op: stateObj.bgOpacity,
    s: siteMap,
    g: gameMap,
    e: entries
  };
}

function decompressImport(packed) {
  if (!packed || typeof packed !== "object") return null;

  // Handle legacy uncompressed imports
  if (packed.data) {
    return normalizeState(packed.data);
  }

  const sites = Array.isArray(packed.s) ? packed.s : [];
  const games = Array.isArray(packed.g) ? packed.g : [];
  const entries = {};

  if (packed.e && typeof packed.e === "object") {
    Object.entries(packed.e).forEach(([dateKey, entry]) => {
      if (!entry || typeof entry !== "object") return;
      const sessions = Array.isArray(entry.s) ? entry.s.map((s) => {
        const site = typeof s[1] === "number" ? (sites[s[1]] || "Unassigned") : String(s[1] || "Unassigned");
        const game = typeof s[2] === "number" ? (games[s[2]] || "Unassigned") : String(s[2] || "Unassigned");
        return {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
          label: String(s[0] || "Untitled Action"),
          site: site,
          game: game,
          won: Number(s[3] || 0),
          lost: Number(s[4] || 0),
          createdAt: new Date().toISOString()
        };
      }) : [];
      entries[dateKey] = {
        notes: entry.n || "",
        sessions: sessions
      };
    });
  }

  return {
    startBankroll: Number(packed.b || 0),
    sites: sites,
    games: games,
    entries: entries,
    activeBg: String(packed.bg || DEFAULT_BG),
    bgOpacity: Number(packed.op ?? DEFAULT_BG_OPACITY),
    updatedAt: new Date().toISOString()
  };
}

function bindDataManagement() {
  el.exportBtn.addEventListener("click", () => {
    const packed = compactExport(state);
    const blob = new Blob([JSON.stringify(packed)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "husti-savings-backup.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    
    const sizeKB = (blob.size / 1024).toFixed(2);
    statusMsg(`Backup exported (${sizeKB} KB).`);
  });

  el.importBtn.addEventListener("click", () => el.importFile.click());
  el.importFile.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        const importedState = decompressImport(parsed);
        if (importedState) {
          state = normalizeState(importedState);
          saveState();
          applyBackground(state.activeBg);
          updateAll();
          
          let totalActions = 0;
          Object.values(state.entries).forEach((e) => {
            totalActions += (e.sessions || []).length;
          });
          statusMsg(`Backup restored: Loaded ${totalActions} actions!`);
        } else {
          statusMsg("Invalid backup format.");
        }
      } catch (error) {
        console.error(error);
        statusMsg("Import failed.");
      }
      el.importFile.value = "";
    };
    reader.readAsText(file);
  });
}



function updateAll() {
  const current = new Date(visibleMonth.year, visibleMonth.month, 1);
  const label = current.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  el.monthLabel.textContent = label;
  el.anaMonthLabel.textContent = label;

  renderCalendar();
  renderTags("sites", el.siteList);
  renderTags("games", el.gameList);
  syncSelect("site", state.sites);
  syncSelect("game", state.games);

  el.startingBankroll.value = state.startBankroll || "";
  updateAnalytics();
  updateStreaks();

  // Custom presets renderers
  renderPresetsManager();
  renderModalPresets();
}

function updateStreaks() {
  const dates = Object.keys(state.entries)
    .filter(k => state.entries[k] && state.entries[k].sessions && state.entries[k].sessions.length > 0)
    .sort();
  
  let currentStreak = 0;
  if (!dates.length) {
    document.getElementById('streak-count').textContent = '0 Days';
    return;
  }
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const todayKeyStr = formatDateKey(today);
  const yesterdayKeyStr = formatDateKey(yesterday);

  const latestStr = dates[dates.length - 1];
  
  if (latestStr === todayKeyStr || latestStr === yesterdayKeyStr) {
    currentStreak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const d1 = new Date(dates[i-1]);
      const d2 = new Date(dates[i]);
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  document.getElementById('streak-count').textContent = currentStreak === 1 ? '1 Day' : currentStreak + ' Days';
}

function shiftMonth(offset) {
  const next = new Date(visibleMonth.year, visibleMonth.month + offset, 1);
  visibleMonth = { year: next.getFullYear(), month: next.getMonth() };
  updateAll();
}

function openModal() {
  populateModal();
  el.modal.classList.add("open");
}

function closeModal() {
  el.modal.classList.remove("open");
}

function populateModal() {
  if (!selectedDateKey) {
    return;
  }

  const current = parseDateKey(selectedDateKey);
  el.modalHeading.textContent = current.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const entry = getEntry(selectedDateKey);
  const totals = getTotals(entry);

  el.modalCount.textContent = `${entry.sessions.length} ACTIONS`;
  el.modalWon.textContent = formatINR(totals.won);
  el.modalLost.textContent = formatINR(totals.lost);
  el.modalNet.textContent = formatINR(totals.net);
  el.modalNet.className = totals.net >= 0 ? "insight-hero accent-lime" : "insight-hero accent-red";
  el.dailyNotes.value = entry.notes || "";

  if (selectedDateKey !== formatDateKey(new Date())) {
    el.recordSection.classList.add("locked-section");
  } else {
    el.recordSection.classList.remove("locked-section");
  }

  el.sessionList.innerHTML = "";
  if (!entry.sessions.length) {
    el.sessionList.innerHTML = '<div class="empty-msg">No entries for this day.</div>';
    return;
  }

  entry.sessions.forEach((session) => {
    const net = session.won - session.lost;
    const row = document.createElement("div");
    row.className = "session-item";
    row.innerHTML = `
      <div style="display:flex; flex-direction:column;">
        <span class="s-desc">${escapeHTML(session.label)}</span>
        <span class="s-meta">${escapeHTML(session.site)} | ${escapeHTML(session.game)}</span>
      </div>
      <div style="display:flex; align-items:center; gap: 1rem;">
        <span class="s-val ${net >= 0 ? "accent-lime" : "accent-red"}">${formatINR(net)}</span>
        <button class="del-btn" type="button">&times;</button>
      </div>
    `;
    row.querySelector(".del-btn").addEventListener("click", () => {
      const dayEntry = getEntryMulti(selectedDateKey);
      dayEntry.sessions = dayEntry.sessions.filter((item) => item.id !== session.id);
      if (!dayEntry.sessions.length && !dayEntry.notes) {
        delete state.entries[selectedDateKey];
      }
      saveState();
      updateAll();
      populateModal();
    });
    el.sessionList.appendChild(row);
  });
}

function renderCalendar() {
  el.calendarGrid.innerHTML = "";
  const firstDay = new Date(visibleMonth.year, visibleMonth.month, 1);
  const startDay = new Date(visibleMonth.year, visibleMonth.month, 1 - firstDay.getDay());
  const todayKey = formatDateKey(new Date());

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(startDay);
    current.setDate(startDay.getDate() + index);
    const dateKey = formatDateKey(current);
    const entry = state.entries[dateKey];
    const totals = getTotals(entry);

    const cell = document.createElement("div");
    let classes = "calendar-day";
    if (current.getMonth() !== visibleMonth.month) {
      classes += " other-month";
    }
    if (entry && entry.sessions.length) {
      classes += totals.net >= 0 ? " day-pos" : " day-neg";
    } else if (dateKey < todayKey && current.getMonth() === visibleMonth.month) {
      classes += " day-missed";
    }

    let inner = `<span class="date-number">${current.getDate()}</span>`;
    if (classes.includes("day-missed")) inner += `<div class="day-stats" style="margin:auto"><span class="missed-word">No Saves</span></div>`;
    if (dateKey === todayKey) {
      inner += '<div class="today-marker"></div>';
      classes += " today-block";
    }
    cell.className = classes;

    if (entry && entry.sessions.length) {
      inner += `
        <div class="day-stats">
          <span style="color:var(--text-main)">${formatINR(totals.net)}</span>
          <span style="opacity:0.6">${entry.sessions.length} saves</span>
        </div>
      `;
    }

    cell.innerHTML = inner;
    cell.addEventListener("click", () => {
      selectedDateKey = dateKey;
      visibleMonth = { year: current.getFullYear(), month: current.getMonth() };
      updateAll();
      openModal();
    });

    el.calendarGrid.appendChild(cell);
  }
}

function updateAnalytics() {
  let totalNet = 0;
  let monthNet = 0;
  let activeMonthDays = 0;
  let weekNet = 0;
  let activeWeekSessions = 0;
  let bestMonthDay = { net: 0, label: "N/A" };
  const siteMap = new Map();
  const gameMap = new Map();

  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  Object.entries(state.entries).forEach(([dateKey, entry]) => {
    const current = parseDateKey(dateKey);
    const totals = getTotals(entry);

    totalNet += totals.net;

    if (current.getFullYear() === visibleMonth.year && current.getMonth() === visibleMonth.month) {
      monthNet += totals.net;
      
      entry.sessions.forEach((session) => {
        const net = session.won - session.lost;
        siteMap.set(session.site, (siteMap.get(session.site) || 0) + net);
        gameMap.set(session.game, (gameMap.get(session.game) || 0) + net);
      });

      if (entry.sessions.length) {
        activeMonthDays += 1;
      }
      if (totals.net >= bestMonthDay.net || bestMonthDay.label === "N/A") {
        bestMonthDay = {
          net: totals.net,
          label: current.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        };
      }
    }

    if (current >= weekStart && current <= weekEnd) {
      weekNet += totals.net;
      activeWeekSessions += entry.sessions.length;
    }
  });

  const totalSavings = (state.startBankroll || 0) + totalNet;
  el.currentBankroll.textContent = formatINR(totalSavings);
  el.overallNet.textContent = formatINR(totalNet);
  el.monthNet.textContent = formatINR(monthNet);
  el.monthBreakdown.textContent = `${activeMonthDays} Savings Days`;
  el.weekNet.textContent = formatINR(weekNet);
  el.weekBreakdown.textContent = `${activeWeekSessions} Savings Actions`;
  el.bestDay.textContent = formatINR(bestMonthDay.net);
  el.bestDayLabel.textContent = bestMonthDay.label;

  const topSite = [...siteMap.entries()].sort((a, b) => b[1] - a[1])[0];
  const topGame = [...gameMap.entries()].sort((a, b) => b[1] - a[1])[0];
  el.bestSite.textContent = topSite ? `${topSite[0]} (${formatINR(topSite[1])})` : "N/A";
  el.bestGame.textContent = topGame ? `${topGame[0]} (${formatINR(topGame[1])})` : "N/A";

  // Render target, goals, and badges
  renderTargetProgress(monthNet);
  renderGoals(totalSavings);
  renderBadges();
  updateDailyTrend();

  const targetValueInput = document.getElementById("target-value-input");
  if (targetValueInput) {
    targetValueInput.placeholder = `Target Savings (${state.currency || "₹"})`;
  }
  const goalAmountInput = document.getElementById("goal-amount-input");
  if (goalAmountInput) {
    goalAmountInput.placeholder = `Goal Amount (${state.currency || "₹"})`;
  }
  const startingBankroll = document.getElementById("starting-bankroll");
  if (startingBankroll) {
    startingBankroll.placeholder = `Initial Savings (${state.currency || "₹"})`;
  }
}

function renderTargetProgress(monthNet) {
  const targetSavedText = document.getElementById("target-saved-text");
  const targetLimitText = document.getElementById("target-limit-text");
  const targetProgressFill = document.getElementById("target-progress-fill");
  const targetStatusLabel = document.getElementById("target-status-label");

  if (targetSavedText && targetLimitText && targetProgressFill && targetStatusLabel) {
    const monthSavings = Math.max(0, monthNet);
    const target = state.monthlyTarget || 10000;
    const progressPct = Math.min(100, Math.max(0, (monthSavings / target) * 100));

    targetSavedText.textContent = `Saved: ${state.currency || "₹"}${formatINRWithoutSymbol(monthSavings)}`;
    targetLimitText.textContent = `Target: ${state.currency || "₹"}${formatINRWithoutSymbol(target)}`;
    targetProgressFill.style.width = `${progressPct}%`;
    targetStatusLabel.textContent = `${progressPct.toFixed(0)}% achieved this month`;
  }
}

function renderGoals(totalSavings) {
  const container = document.getElementById("goals-list-container");
  if (!container) return;
  container.innerHTML = "";

  if (!state.goals || !state.goals.length) {
    container.innerHTML = `<div class="empty-msg" style="font-size:0.85rem;">No active savings goals. Add one above!</div>`;
    return;
  }

  state.goals.forEach((goal) => {
    const pct = Math.min(100, Math.max(0, (totalSavings / goal.target) * 100));
    const isCompleted = totalSavings >= goal.target;

    const div = document.createElement("div");
    div.style.background = "rgba(255,255,255,0.03)";
    div.style.border = "var(--border-thin)";
    div.style.borderRadius = "10px";
    div.style.padding = "0.6rem 0.8rem";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.gap = "0.25rem";

    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong style="font-family:var(--font-heading); font-size:0.95rem; color:${isCompleted ? "var(--accent-lime)" : "var(--text-main)"}">${escapeHTML(goal.name)}</strong>
        <div style="display:flex; align-items:center; gap:0.4rem;">
          <span style="font-size:0.8rem; font-weight:700; font-family:var(--font-body);">${state.currency || "₹"}${formatINRWithoutSymbol(totalSavings)} / ${state.currency || "₹"}${formatINRWithoutSymbol(goal.target)}</span>
          <button class="goal-del-btn" style="background:none; border:none; color:var(--text-dim); cursor:pointer; font-size:1.2rem; padding:0 0.2rem; line-height:1;">&times;</button>
        </div>
      </div>
      <div style="width:100%; height:8px; background:rgba(255,255,255,0.08); border-radius:5px; overflow:hidden; border:var(--border-thin);">
        <div style="width:${pct}%; height:100%; background:${isCompleted ? "var(--accent-lime)" : "var(--accent-purple)"}; transition:width 0.3s;"></div>
      </div>
      <small style="font-size:0.75rem; color:var(--text-dim); font-weight:700; font-family:var(--font-body); margin:0;">${pct.toFixed(0)}% Completed ${isCompleted ? "🎉" : ""}</small>
    `;

    div.querySelector(".goal-del-btn").addEventListener("click", () => {
      state.goals = state.goals.filter((g) => g.id !== goal.id);
      saveState();
      updateAll();
    });

    container.appendChild(div);
  });
}

function formatINRWithoutSymbol(val) {
  const currencySymbol = state.currency || "₹";
  const currencyCodeMap = {
    "₹": "en-IN",
    "$": "en-US",
    "€": "en-IE",
    "£": "en-GB",
    "¥": "ja-JP",
    "₩": "ko-KR"
  };
  const locale = currencyCodeMap[currencySymbol] || "en-IN";
  return Number(val).toLocaleString(locale, { maximumFractionDigits: 0 });
}

function getCurrentStreak() {
  const dates = Object.keys(state.entries)
    .filter(k => state.entries[k] && state.entries[k].sessions && state.entries[k].sessions.length > 0)
    .sort();
  
  let currentStreak = 0;
  if (!dates.length) {
    return 0;
  }
  
  const todayVal = new Date();
  const yesterdayVal = new Date(todayVal);
  yesterdayVal.setDate(yesterdayVal.getDate() - 1);
  const todayKeyStr = formatDateKey(todayVal);
  const yesterdayKeyStr = formatDateKey(yesterdayVal);

  const latestStr = dates[dates.length - 1];
  
  if (latestStr === todayKeyStr || latestStr === yesterdayKeyStr) {
    currentStreak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const d1 = parseDateKey(dates[i-1]);
      const d2 = parseDateKey(dates[i]);
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  return currentStreak;
}

function renderBadges() {
  const shelf = document.getElementById("badges-shelf");
  if (!shelf) return;
  shelf.innerHTML = "";

  const streakVal = getCurrentStreak();
  const totalNetVal = Object.values(state.entries).reduce((sum, entry) => sum + getTotals(entry).net, 0);
  const currentBalance = (state.startBankroll || 0) + totalNetVal;

  const badges = [
    {
      id: "starter",
      icon: "🪙",
      title: "Piggy Starter",
      desc: "Log your first saving",
      check: () => {
        return Object.values(state.entries).some((entry) => 
          entry.sessions.some((s) => s.won > 0)
        );
      }
    },
    {
      id: "streak",
      icon: "🔥",
      title: "On Fire",
      desc: "Get a 3+ days savings streak",
      check: () => streakVal >= 3
    },
    {
      id: "coffee",
      icon: "☕",
      title: "Coffee Skipper",
      desc: "Skip coffee 3+ times",
      check: () => {
        let count = 0;
        Object.values(state.entries).forEach((entry) => {
          entry.sessions.forEach((s) => {
            if (s.game === "Skip Coffee" && s.won > 0) count++;
          });
        });
        return count >= 3;
      }
    },
    {
      id: "emergency",
      icon: "🛡️",
      title: "Shield Wall",
      desc: "Save in Emergency Fund",
      check: () => {
        return Object.values(state.entries).some((entry) =>
          entry.sessions.some((s) => s.site === "Emergency Fund" && s.won > 0)
        );
      }
    },
    {
      id: "frugal_master",
      icon: "🏆",
      title: "Frugal Master",
      desc: `Save net ${formatINR(5000)}+ this month`,
      check: () => {
        let monthNet = 0;
        Object.entries(state.entries).forEach(([dateKey, entry]) => {
          const current = parseDateKey(dateKey);
          if (current.getFullYear() === visibleMonth.year && current.getMonth() === visibleMonth.month) {
            monthNet += getTotals(entry).net;
          }
        });
        return monthNet >= 5000;
      }
    },
    {
      id: "super_saver",
      icon: "💎",
      title: "Vault Master",
      desc: `Total savings reach ${formatINR(20000)}+`,
      check: () => currentBalance >= 20000
    }
  ];

  badges.forEach((badge) => {
    const unlocked = badge.check();
    const card = document.createElement("div");
    card.className = unlocked ? "badge-card unlocked" : "badge-card locked";
    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.gap = "0.4rem";
    card.style.padding = "0.4rem 0.6rem";
    card.style.borderRadius = "8px";
    card.style.border = "var(--border-thin)";
    card.style.background = unlocked ? "rgba(204,255,0,0.05)" : "rgba(255,255,255,0.01)";
    card.style.opacity = unlocked ? "1" : "0.35";
    card.style.filter = unlocked ? "none" : "grayscale(100%)";
    card.style.transition = "all 0.2s";
    card.title = badge.desc;

    card.innerHTML = `
      <span style="font-size:1.6rem; line-height:1;">${badge.icon}</span>
      <div style="display:flex; flex-direction:column; line-height:1.1;">
        <span style="font-weight:700; font-size:0.8rem; font-family:var(--font-heading); color:${unlocked ? "var(--accent-lime)" : "var(--text-main)"}">${badge.title}</span>
        <span style="font-size:0.65rem; font-family:var(--font-body); color:var(--text-dim);">${badge.desc}</span>
      </div>
    `;
    shelf.appendChild(card);
  });
}

function addTag(type, value) {
  const cleanValue = value.trim();
  if (!cleanValue || state[type].includes(cleanValue)) {
    return;
  }
  state[type].push(cleanValue);
  saveState();
  updateAll();
}

function renderTags(type, container) {
  container.innerHTML = "";
  state[type].forEach((item) => {
    const fragment = el.tagTemplate.content.cloneNode(true);
    fragment.querySelector("span").textContent = item;
    fragment.querySelector("button").addEventListener("click", () => {
      state[type] = state[type].filter((current) => current !== item);
      saveState();
      updateAll();
    });
    container.appendChild(fragment);
  });
}

function syncSelect(type, items) {
  const optionsContainer = type === "site" ? el.siteOptions : el.gameOptions;
  const selectDisplay = type === "site" ? el.siteSelect : el.gameSelect;
  const hiddenInput = type === "site" ? el.sessionSite : el.sessionGame;
  const currentValue = hiddenInput.value;

  optionsContainer.innerHTML = items
    .map((item) => `<div class="custom-option" data-value="${escapeHTML(item)}">${escapeHTML(item)}</div>`)
    .join("");

  if (items.includes(currentValue)) {
    hiddenInput.value = currentValue;
    selectDisplay.querySelector(".cs-label").textContent = currentValue;
  } else {
    hiddenInput.value = "";
    selectDisplay.querySelector(".cs-label").textContent = `Select ${capitalize(type)}...`;
  }

  optionsContainer.querySelectorAll(".custom-option").forEach((option) => {
    option.addEventListener("click", (event) => {
      event.stopPropagation();
      hiddenInput.value = option.dataset.value || "";
      selectDisplay.querySelector(".cs-label").textContent = option.dataset.value || "";
      selectDisplay.classList.remove("open");
    });
  });
}

function initCustomDropdowns() {
  el.siteSelect.addEventListener("click", (event) => {
    event.stopPropagation();
    el.siteSelect.classList.toggle("open");
    el.gameSelect.classList.remove("open");
  });
  el.gameSelect.addEventListener("click", (event) => {
    event.stopPropagation();
    el.gameSelect.classList.toggle("open");
    el.siteSelect.classList.remove("open");
  });
  document.addEventListener("click", () => {
    el.siteSelect.classList.remove("open");
    el.gameSelect.classList.remove("open");
  });
}

function getEntry(dateKey) {
  return state.entries[dateKey] || { notes: "", sessions: [] };
}

function getEntryMulti(dateKey) {
  if (!state.entries[dateKey]) {
    state.entries[dateKey] = { notes: "", sessions: [] };
  }
  return state.entries[dateKey];
}

function getTotals(entry) {
  if (!entry) {
    return { won: 0, lost: 0, net: 0 };
  }

  const won = entry.sessions.reduce((sum, session) => sum + parseAmt(session.won), 0);
  const lost = entry.sessions.reduce((sum, session) => sum + parseAmt(session.lost), 0);
  return { won, lost, net: won - lost };
}

function defaultState() {
  return {
    startBankroll: 0,
    sites: [...DEFAULT_SITES],
    games: [...DEFAULT_GAMES],
    entries: {},
    activeBg: DEFAULT_BG,
    bgOpacity: DEFAULT_BG_OPACITY,
    updatedAt: null,
    monthlyTarget: 10000,
    goals: [],
    currency: "₹",
    presets: [
      { id: "p1", emoji: "☕", label: "Coffee", site: "Piggy Bank", game: "Skip Coffee", won: 150, lost: 0 },
      { id: "p2", emoji: "🍳", label: "Cooked", site: "Piggy Bank", game: "Cooked at Home", won: 200, lost: 0 },
      { id: "p3", emoji: "🚶", label: "Walked", site: "Piggy Bank", game: "Walked instead of Cab", won: 100, lost: 0 },
      { id: "p4", emoji: "🛍️", label: "Splurge", site: "Piggy Bank", game: "Spare Change", won: 0, lost: 250 }
    ]
  };
}

function loadState() {
  const candidates = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
  for (const key of candidates) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }
      return normalizeState(JSON.parse(raw));
    } catch (_error) {
      continue;
    }
  }

  return defaultState();
}

function normalizeGoal(goal) {
  if (!goal || typeof goal !== "object") return null;
  return {
    id: goal.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)),
    name: String(goal.name || "Untitled Goal").trim(),
    target: parseAmt(goal.target)
  };
}

function normalizePreset(p) {
  if (!p || typeof p !== "object") return null;
  return {
    id: p.id || Math.random().toString(36).substr(2, 9),
    emoji: String(p.emoji || "💰").trim(),
    label: String(p.label || "Preset").trim(),
    site: String(p.site || DEFAULT_SITES[0]),
    game: String(p.game || DEFAULT_GAMES[0]),
    won: parseAmt(p.won),
    lost: parseAmt(p.lost)
  };
}

function normalizeState(raw) {
  const source = raw && typeof raw === "object" && raw.data ? raw.data : raw;
  const base = defaultState();
  if (!source || typeof source !== "object") {
    return base;
  }

  const s = {
    startBankroll: parseAmt(source.startBankroll ?? source.startingBankroll),
    sites: normalizeTags(source.sites, DEFAULT_SITES),
    games: normalizeTags(source.games, DEFAULT_GAMES),
    entries: normalizeEntries(source.entries),
    activeBg: typeof source.activeBg === "string" ? source.activeBg : DEFAULT_BG,
    bgOpacity: clampOpacity(source.bgOpacity ?? DEFAULT_BG_OPACITY),
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null,
    monthlyTarget: parseAmt(source.monthlyTarget ?? 10000),
    goals: Array.isArray(source.goals) ? source.goals.map(normalizeGoal).filter(Boolean) : [],
    currency: typeof source.currency === "string" ? source.currency : "₹",
    presets: Array.isArray(source.presets) ? source.presets.map(normalizePreset).filter(Boolean) : base.presets
  };

  return migrateSavingsState(s);
}

function migrateSavingsState(s) {
  if (!s || typeof s !== "object") return s;

  const siteMap = {
    "PokerStars": "Piggy Bank",
    "GGPoker": "Emergency Fund",
    "888poker": "Travel Jar",
    "PartyPoker": "Future Car",
    "WSOP": "Investment Jar"
  };

  const gameMap = {
    "Hold'em": "Skip Coffee",
    "Omaha": "Cooked at Home",
    "Cash Game": "Future Car",
    "Tournament": "Travel Jar",
    "Spin & Go": "Walked instead of Cab",
    "MTT": "Salary Bonus"
  };

  s.sites = (s.sites || []).map(site => siteMap[site] || site);
  s.games = (s.games || []).map(game => gameMap[game] || game);

  s.sites = [...new Set(s.sites)];
  s.games = [...new Set(s.games)];

  if (!s.sites.length) s.sites = [...DEFAULT_SITES];
  if (!s.games.length) s.games = [...DEFAULT_GAMES];

  if (s.entries && typeof s.entries === "object") {
    Object.keys(s.entries).forEach(dateKey => {
      const entry = s.entries[dateKey];
      if (entry && Array.isArray(entry.sessions)) {
        entry.sessions.forEach(sess => {
          if (sess && typeof sess === "object") {
            if (sess.site && siteMap[sess.site]) {
              sess.site = siteMap[sess.site];
            }
            if (sess.game && gameMap[sess.game]) {
              sess.game = gameMap[sess.game];
            }
          }
        });
      }
    });
  }

  return s;
}

function normalizeTags(value, defaults) {
  if (!Array.isArray(value) || !value.length) {
    return [...defaults];
  }

  const unique = new Set();
  value.forEach((item) => {
    const clean = String(item || "").trim();
    if (clean) {
      unique.add(clean);
    }
  });

  return unique.size ? [...unique] : [...defaults];
}

function normalizeEntries(value) {
  const result = {};
  if (!value || typeof value !== "object") {
    return result;
  }

  Object.entries(value).forEach(([dateKey, entry]) => {
    if (!entry || typeof entry !== "object") {
      return;
    }

    const sessions = Array.isArray(entry.sessions)
      ? entry.sessions.map(normalizeSession).filter(Boolean)
      : [];
    const notes = typeof entry.notes === "string" ? entry.notes : "";

    if (sessions.length || notes) {
      result[dateKey] = { notes, sessions };
    }
  });

  return result;
}

function normalizeSession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  return {
    id: session.id || (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
    label: String(session.label || "Untitled Session").trim() || "Untitled Session",
    site: String(session.site || "Unassigned").trim() || "Unassigned",
    game: String(session.game || "Unassigned").trim() || "Unassigned",
    won: parseAmt(session.won),
    lost: parseAmt(session.lost),
    createdAt: typeof session.createdAt === "string" ? session.createdAt : null
  };
}

function buildPersistedState(source) {
  return {
    startBankroll: parseAmt(source.startBankroll),
    sites: [...source.sites],
    games: [...source.games],
    entries: JSON.parse(JSON.stringify(source.entries)),
    activeBg: source.activeBg,
    bgOpacity: clampOpacity(source.bgOpacity),
    updatedAt: source.updatedAt || new Date().toISOString(),
    monthlyTarget: parseAmt(source.monthlyTarget ?? 10000),
    goals: JSON.parse(JSON.stringify(source.goals || []))
  };
}

function serializedState(source) {
  return JSON.stringify(buildPersistedState(source));
}

function persistLocalState({ touch = true } = {}) {
  if (touch) {
    state.updatedAt = new Date().toISOString();
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildPersistedState(state)));
  } catch (err) {
    console.warn("localStorage setItem failed:", err);
  }
}

function saveState() {
  persistLocalState();
}

function hasMeaningfulData(source) {
  return Boolean(
    parseAmt(source.startBankroll) ||
      Object.keys(source.entries).length ||
      JSON.stringify(source.sites) !== JSON.stringify(DEFAULT_SITES) ||
      JSON.stringify(source.games) !== JSON.stringify(DEFAULT_GAMES) ||
      source.activeBg !== DEFAULT_BG ||
      clampOpacity(source.bgOpacity) !== DEFAULT_BG_OPACITY
  );
}

function hasSupabaseConfig() {
  return Boolean(SUPABASE_CONFIG?.url && SUPABASE_CONFIG?.anonKey);
}

function parseAmt(value) {
  const amount = parseFloat(value);
  return Number.isFinite(amount) ? amount : 0;
}

function clampOpacity(value) {
  const amount = parseFloat(value);
  if (!Number.isFinite(amount)) {
    return DEFAULT_BG_OPACITY;
  }
  return Math.min(1, Math.max(0, amount));
}

function formatINR(value) {
  const currencySymbol = state.currency || "₹";
  const currencyCodeMap = {
    "₹": { code: "INR", locale: "en-IN" },
    "$": { code: "USD", locale: "en-US" },
    "€": { code: "EUR", locale: "en-IE" },
    "£": { code: "GBP", locale: "en-GB" },
    "¥": { code: "JPY", locale: "ja-JP" },
    "₩": { code: "KRW", locale: "ko-KR" }
  };

  const mapped = currencyCodeMap[currencySymbol] || { code: "INR", locale: "en-IN" };

  return new Intl.NumberFormat(mapped.locale, {
    style: "currency",
    currency: mapped.code,
    maximumFractionDigits: 0
  }).format(value);
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag]));
}

function statusMsg(message) {
  el.statusText.textContent = message;
  window.clearTimeout(statusMsg.timerId);
  statusMsg.timerId = window.setTimeout(() => {
    el.statusText.textContent = "Ready.";
  }, 3000);
}
statusMsg.timerId = 0;

function formatTime(value) {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function bindInstructions() {
  const btn = document.getElementById("instruction-btn");
  const modal = document.getElementById("instruction-modal");
  const closeBtn = document.getElementById("close-instruction-modal");
  
  if (btn && modal) {
    btn.addEventListener("click", () => {
      modal.classList.add("open");
    });
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("open");
    });
  }
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("open");
      }
    });
  }
}

function renderPresetsManager() {
  const container = document.getElementById("settings-presets-list");
  if (!container) return;

  container.innerHTML = "";
  if (!state.presets || !state.presets.length) {
    container.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-dim);">No presets added yet.</div>`;
  } else {
    state.presets.forEach(p => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.justifyContent = "space-between";
      row.style.padding = "0.4rem 0.6rem";
      row.style.background = "rgba(255,255,255,0.02)";
      row.style.borderRadius = "8px";
      row.style.border = "var(--border-thin)";
      row.style.fontSize = "0.8rem";

      const labelText = `${p.emoji} ${p.label} (${p.won > 0 ? "+" : "-"}${state.currency}${p.won || p.lost})`;
      row.innerHTML = `
        <span style="font-weight: 700; color: var(--text-main);">${escapeHTML(labelText)}</span>
        <button class="preset-del-btn" data-id="${p.id}" style="background: none; border: none; color: var(--accent-red); cursor: pointer; font-size: 1.25rem; line-height: 1; padding: 0;">&times;</button>
      `;

      row.querySelector(".preset-del-btn").addEventListener("click", () => {
        state.presets = state.presets.filter(x => x.id !== p.id);
        saveState();
        updateAll();
      });

      container.appendChild(row);
    });
  }

  // Populate presets add form dropdown choices
  const siteSelect = document.getElementById("preset-site-select");
  const gameSelect = document.getElementById("preset-game-select");
  
  if (siteSelect) {
    siteSelect.innerHTML = state.sites.map(s => `<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join("");
  }
  if (gameSelect) {
    gameSelect.innerHTML = state.games.map(g => `<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`).join("");
  }
}

function renderModalPresets() {
  const container = document.getElementById("modal-presets-list");
  if (!container) return;

  container.innerHTML = "";
  if (!state.presets || !state.presets.length) {
    container.parentElement.style.display = "none";
    return;
  }
  container.parentElement.style.display = "flex";

  state.presets.forEach(p => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset-btn btn-brutal";
    
    btn.dataset.site = p.site;
    btn.dataset.game = p.game;
    btn.dataset.won = String(p.won);
    btn.dataset.lost = String(p.lost);
    btn.dataset.label = p.label;

    const isProfit = Number(p.won || 0) > 0;
    const colorStyle = isProfit 
      ? "background:rgba(204,255,0,0.08); border:1px solid var(--accent-lime); color:var(--accent-lime);"
      : "background:rgba(255,58,32,0.08); border:1px solid var(--accent-orange); color:var(--accent-orange);";
    
    btn.style = `padding:0.4rem 0.6rem; font-size:0.75rem; border-radius: 6px; ${colorStyle}`;
    btn.textContent = `${p.emoji} ${p.label} (${isProfit ? "+" : "-"}${state.currency}${p.won || p.lost})`;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!selectedDateKey) return;
      
      const entry = getEntryMulti(selectedDateKey);
      entry.sessions.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        label: p.label,
        site: p.site,
        game: p.game,
        won: p.won,
        lost: p.lost,
        createdAt: new Date().toISOString()
      });

      saveState();
      updateAll();
      populateModal();
      statusMsg("Preset logged.");
    });

    container.appendChild(btn);
  });
}

function bindPresetsEditor() {
  const form = document.getElementById("settings-preset-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const emoji = document.getElementById("preset-emoji-input").value.trim() || "💰";
    const label = document.getElementById("preset-label-input").value.trim() || "Preset";
    const site = document.getElementById("preset-site-select").value;
    const game = document.getElementById("preset-game-select").value;
    const won = parseAmt(document.getElementById("preset-won-input").value);
    const lost = parseAmt(document.getElementById("preset-lost-input").value);

    const newPreset = {
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      label,
      site,
      game,
      won,
      lost
    };

    if (!state.presets) state.presets = [];
    state.presets.push(newPreset);
    saveState();
    updateAll();

    document.getElementById("preset-emoji-input").value = "";
    document.getElementById("preset-label-input").value = "";
    document.getElementById("preset-won-input").value = "";
    document.getElementById("preset-lost-input").value = "";
  });
}

function updateWallpaperVisibility(targetViewId) {
  const wallpaperLayer = document.getElementById("wallpaper-layer");
  if (wallpaperLayer) {
    if (targetViewId === "view-calendar") {
      wallpaperLayer.style.opacity = String(state.bgOpacity);
      document.body.classList.remove("light-theme");
    } else {
      wallpaperLayer.style.opacity = "0";
      document.body.classList.add("light-theme");
    }
  }
}

// ─── PWA Installation Prompt Logic ───
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const installCard = document.getElementById("pwa-install-card");
  if (installCard) {
    installCard.style.display = "block";
  }
});

function setupPWAInstall() {
  const btn = document.getElementById("pwa-install-button");
  const card = document.getElementById("pwa-install-card");
  
  if (btn) {
    btn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      console.log(`User choice PWA: ${outcome}`);
      deferredInstallPrompt = null;
      if (card) card.style.display = "none";
    });
  }
  
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (card) card.style.display = "none";
    const landingOverlay = document.getElementById('pwa-landing-install-overlay');
    if (landingOverlay) landingOverlay.style.display = "none";
    console.log('PWA app installed successfully');
  });

  // Handle landing page direct install redirect: /app/?install=true
  const urlParams = new URLSearchParams(window.location.search);
  const isInstallRequested = urlParams.get('install') === 'true';
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isInstallRequested && !isStandalone) {
    const installOverlay = document.getElementById('pwa-landing-install-overlay');
    if (installOverlay) {
      installOverlay.style.display = 'flex';
      
      const installBtn = document.getElementById('pwa-landing-install-btn');
      const skipBtn = document.getElementById('pwa-landing-skip-btn');
      
      if (installBtn) {
        installBtn.addEventListener('click', async () => {
          if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            const { outcome } = await deferredInstallPrompt.userChoice;
            console.log(`User choice PWA landing prompt: ${outcome}`);
            deferredInstallPrompt = null;
            installOverlay.style.display = 'none';
          } else {
            installBtn.textContent = 'Preparing...';
            let checkPrompt = setInterval(() => {
              if (deferredInstallPrompt) {
                clearInterval(checkPrompt);
                installBtn.textContent = 'Install Now';
                deferredInstallPrompt.prompt();
                deferredInstallPrompt.userChoice.then(() => {
                  deferredInstallPrompt = null;
                  installOverlay.style.display = 'none';
                });
              }
            }, 200);
            
            setTimeout(() => {
              clearInterval(checkPrompt);
              if (!deferredInstallPrompt) {
                installBtn.textContent = 'Install Now';
                alert('Installation prompt is not supported by your browser in this mode, or the app is already installed. Loading HUSTI in browser...');
                installOverlay.style.display = 'none';
              }
            }, 4000);
          }
        });
      }
      
      if (skipBtn) {
        skipBtn.addEventListener('click', () => {
          installOverlay.style.display = 'none';
        });
      }
    }
  }
}
