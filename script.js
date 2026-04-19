import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_CONFIG } from "./supabase-config.js";

const STORAGE_KEY = "husti-brutal-v2";
const LEGACY_STORAGE_KEYS = ["husti-brutal-v1"];
const APP_STATE_VERSION = 2;
const SUPABASE_TABLE = "husti_user_state";
const DEFAULT_SITES = ["PokerStars", "GGPoker"];
const DEFAULT_GAMES = ["Hold'em", "Omaha"];
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

  authForm: document.getElementById("auth-form"),
  authEmail: document.getElementById("auth-email"),
  authPassword: document.getElementById("auth-password"),
  togglePassword: document.getElementById("toggle-password"),
  authSignupBtn: document.getElementById("auth-signup"),
  authLoginBtn: document.getElementById("auth-login"),
  authStatusData: document.getElementById("auth-status"),
  authLoading: document.getElementById("auth-loading"),
  authOverlay: document.getElementById("auth-overlay"),
  authCardBlock: document.getElementById("auth-card-block"),
  bootLoader: document.getElementById("boot-loader"),
  dropdownLogout: document.getElementById("dropdown-logout"),
  
  syncNowBtn: document.getElementById("sync-now-button"),
  signOutBtn: document.getElementById("logout-button"),
  cloudModeBadge: document.getElementById("cloud-mode-badge"),
  cloudUser: document.getElementById("cloud-user"),
  cloudStatusText: document.getElementById("cloud-status-text"),

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
const cloud = {
  enabled: false,
  client: null,
  user: null,
  syncTimer: null,
  pushing: false,
  applyingRemote: false,
  loginAnimating: false
};

let state = loadState();
let visibleMonth = { year: today.getFullYear(), month: today.getMonth() };
let selectedDateKey = null;

void init();

async function init() {
  bindNav();
  bindCalendarControls();
  bindForms();
  bindDataManagement();
  bindCloud();
  initCustomDropdowns();
  bindBackgroundLogic();

  el.weekdayRow.innerHTML = "";
  WEEKDAY_LABELS.forEach((label) => {
    const span = document.createElement("span");
    span.textContent = label;
    el.weekdayRow.appendChild(span);
  });

  el.closeModal.addEventListener("click", closeModal);

  applyBackground(state.activeBg);
  updateAll();
  await initCloud();
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
    el.wallpaperLayer.style.opacity = state.bgOpacity;
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
    el.wallpaperLayer.style.opacity = 0;
    return;
  }

  el.fluidLayer.style.display = "none";
  el.wallpaperLayer.style.backgroundImage = `url("${choice}")`;
  el.wallpaperLayer.style.opacity = state.bgOpacity;
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

function bindDataManagement() {
  el.exportBtn.addEventListener("click", () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: APP_STATE_VERSION,
      data: buildPersistedState(state)
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "husti-backup.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    statusMsg("Backup exported.");
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
        state = normalizeState(parsed);
        saveState();
        applyBackground(state.activeBg);
        updateAll();
        statusMsg("Import complete.");
      } catch (error) {
        statusMsg("Import failed.");
      }
      el.importFile.value = "";
    };
    reader.readAsText(file);
  });
}

function bindCloud() {
  if (!el.authForm) return;

  el.togglePassword?.addEventListener("click", () => {
    const type = el.authPassword.getAttribute("type") === "password" ? "text" : "password";
    el.authPassword.setAttribute("type", type);
    const svg = el.togglePassword.querySelector("svg");
    if (type === "text") {
      svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line>';
      el.togglePassword.style.color = "var(--accent-lime)";
    } else {
      svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
      el.togglePassword.style.color = "var(--text-dim)";
    }
  });

  el.authLoginBtn?.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!cloud.enabled || !cloud.client) return;

    const email = el.authEmail.value.trim();
    const password = el.authPassword.value.trim();
    if (!email || !password) {
      el.authStatusData.textContent = "Email and password required.";
      return;
    }

    el.authLoading.style.display = "block";
    el.authLoginBtn.disabled = true;
    el.authSignupBtn.disabled = true;
    cloud.loginAnimating = true;

    const { error } = await cloud.client.auth.signInWithPassword({ email, password });

    if (!error) { await new Promise(r => setTimeout(r, 1500)); }

    cloud.loginAnimating = false;
    if (cloud.user && !error) el.authOverlay.classList.add("hidden");
    
    el.authLoading.style.display = "none";
    el.authLoginBtn.disabled = false;
    el.authSignupBtn.disabled = false;

    if (error) {
      el.authStatusData.textContent = error.message;
      return;
    }
  });

  el.authSignupBtn?.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!cloud.enabled || !cloud.client) return;

    const email = el.authEmail.value.trim();
    const password = el.authPassword.value.trim();
    if (!email || !password) {
      el.authStatusData.textContent = "Email and password required.";
      return;
    }

    el.authLoading.style.display = "block";
    el.authLoginBtn.disabled = true;
    el.authSignupBtn.disabled = true;
    cloud.loginAnimating = true;

    const { error } = await cloud.client.auth.signUp({ email, password });
    
    if (!error) { await new Promise(r => setTimeout(r, 1500)); }

    cloud.loginAnimating = false;
    if (cloud.user && !error) el.authOverlay.classList.add("hidden");

    el.authLoading.style.display = "none";
    el.authLoginBtn.disabled = false;
    el.authSignupBtn.disabled = false;

    if (error) {
      el.authStatusData.textContent = error.message;
      return;
    }
  });

  el.syncNowBtn?.addEventListener("click", () => {
    void syncWithCloud({ manual: true });
  });

  const handleSignOut = async () => {
    if (!cloud.client || !cloud.user) return;
    const { error } = await cloud.client.auth.signOut();
    if (error) {
      handleCloudError(error);
      return;
    }
    setCloudStatus("Signed out. Local data stays on this device.");
  };

  el.signOutBtn?.addEventListener("click", handleSignOut);
  el.dropdownLogout?.addEventListener("click", handleSignOut);
}

async function initCloud() {
  if (!hasSupabaseConfig()) {
    updateCloudUi();
    return;
  }

  cloud.client = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  cloud.enabled = true;
  setCloudStatus("Supabase ready. Sign in to enable cloud sync.");

  const { data, error } = await cloud.client.auth.getSession();
  if (error) {
    handleCloudError(error);
    return;
  }

  await applySession(data.session, true);
  
  cloud.client.auth.onAuthStateChange((_event, session) => {
    void applySession(session, false);
  });

  window.addEventListener("online", () => {
    if (cloud.user) {
      void syncWithCloud();
    }
  });
}

async function applySession(session, isInitialLoad = false) {
  cloud.user = session?.user || null;

  if (!cloud.user) {
    if (isInitialLoad) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    updateCloudUi();
    if (cloud.enabled) {
      setCloudStatus("Signed out. Working in local mode.");
    }
    return;
  }

  setCloudStatus("Signed in. Checking cloud data...");
  
  if (isInitialLoad) {
    await Promise.all([
      syncWithCloud(),
      new Promise(resolve => setTimeout(resolve, 7500))
    ]);
    updateCloudUi();
  } else {
    await syncWithCloud();
    updateCloudUi();
  }
}

async function syncWithCloud({ manual = false } = {}) {
  if (!cloud.enabled || !cloud.client || !cloud.user || cloud.pushing) {
    if (manual && !cloud.user) {
      setCloudStatus("Sign in first to sync with Supabase.");
    }
    return;
  }

  cloud.pushing = true;
  if (manual) {
    setCloudStatus("Syncing with cloud...");
  }

  try {
    const remoteRow = await fetchRemoteState();

    if (!remoteRow) {
      if (hasMeaningfulData(state)) {
        await pushRemoteState("Uploaded local data to cloud.");
      } else {
        await pushRemoteState("Cloud profile created.");
      }
      return;
    }

    const remoteState = normalizeState(remoteRow.app_state);
    const remoteSnapshot = serializedState(remoteState);
    const localSnapshot = serializedState(state);
    const remoteUpdatedAt = Date.parse(remoteRow.updated_at || remoteState.updatedAt || 0) || 0;
    const localUpdatedAt = Date.parse(state.updatedAt || 0) || 0;

    if (remoteSnapshot !== localSnapshot && remoteUpdatedAt > localUpdatedAt) {
      cloud.applyingRemote = true;
      state = remoteState;
      persistLocalState({ touch: false, syncCloud: false });
      cloud.applyingRemote = false;
      applyBackground(state.activeBg);
      updateAll();
      setCloudStatus(`Loaded cloud data at ${formatTime(remoteUpdatedAt)}.`);
      statusMsg("Loaded newer cloud data.");
      return;
    }

    if (remoteSnapshot !== localSnapshot && localUpdatedAt >= remoteUpdatedAt) {
      await pushRemoteState("Cloud sync complete.");
      return;
    }

    setCloudStatus(`Cloud is up to date as of ${formatTime(remoteUpdatedAt)}.`);
  } catch (error) {
    handleCloudError(error);
  } finally {
    cloud.pushing = false;
  }
}

async function fetchRemoteState() {
  const { data, error } = await cloud.client
    .from(SUPABASE_TABLE)
    .select("app_state, updated_at")
    .eq("user_id", cloud.user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function pushRemoteState(successMessage = "Cloud sync complete.") {
  if (!cloud.enabled || !cloud.client || !cloud.user) {
    return;
  }

  const payload = buildPersistedState(state);
  const { error } = await cloud.client.from(SUPABASE_TABLE).upsert(
    {
      user_id: cloud.user.id,
      email: cloud.user.email || null,
      app_state: payload,
      updated_at: payload.updatedAt
    },
    {
      onConflict: "user_id"
    }
  );

  if (error) {
    throw error;
  }

  setCloudStatus(`${successMessage} ${formatTime(payload.updatedAt)}.`);
}

function queueRemoteSync() {
  if (!cloud.enabled || !cloud.client || !cloud.user || cloud.applyingRemote) {
    return;
  }

  clearTimeout(cloud.syncTimer);
  setCloudStatus("Cloud sync queued...");
  cloud.syncTimer = window.setTimeout(() => {
    void pushRemoteState().catch(handleCloudError);
  }, 500);
}

function updateCloudUi() {
  if (!cloud.enabled) {
    setBadge("Local Only", "disabled");
    el.cloudUser.textContent = "Supabase API keys missing in config.";
    if (el.authOverlay) {
        el.authOverlay.classList.remove("hidden");
        el.bootLoader.style.display = "none";
        el.authCardBlock.style.display = "block";
    }
    return;
  }

  if (cloud.user) {
    setBadge("Cloud Active", "success");
    el.cloudUser.textContent = `Signed in as ${cloud.user.email || "your account"}.`;
    if (el.authOverlay && !cloud.loginAnimating) el.authOverlay.classList.add("hidden");
    if (el.dropdownLogout) el.dropdownLogout.style.display = "flex";
    return;
  }

  setBadge("Supabase Ready", "neutral");
  el.cloudUser.textContent = "Not logged in.";
  if (el.authOverlay) {
      el.authOverlay.classList.remove("hidden");
      el.bootLoader.style.display = "none";
      el.authCardBlock.style.display = "block";
  }
  if (el.dropdownLogout) el.dropdownLogout.style.display = "none";
}

function setBadge(label, tone) {
  el.cloudModeBadge.textContent = label;
  el.cloudModeBadge.dataset.tone = tone;
}

function setCloudStatus(message) {
  el.cloudStatusText.textContent = message;
}

function handleCloudError(error) {
  const message = error?.message || "Cloud sync failed.";
  if (error?.code === "42P01" || message.includes(SUPABASE_TABLE)) {
    setCloudStatus("Supabase table missing. Run supabase/schema.sql in the SQL editor.");
    return;
  }
  setCloudStatus(message);
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

  el.modalCount.textContent = `${entry.sessions.length} SESSIONS`;
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
    if (classes.includes("day-missed")) inner += `<div class="day-stats" style="margin:auto"><span class="missed-word">REST</span></div>`;
    if (dateKey === todayKey) {
      inner += '<div class="today-marker"></div>';
      classes += " today-block";
    }
    cell.className = classes;

    if (entry && entry.sessions.length) {
      inner += `
        <div class="day-stats">
          <span style="color:var(--text-main)">${formatINR(totals.net)}</span>
          <span style="opacity:0.6">${entry.sessions.length} runs</span>
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

    entry.sessions.forEach((session) => {
      const net = session.won - session.lost;
      siteMap.set(session.site, (siteMap.get(session.site) || 0) + net);
      gameMap.set(session.game, (gameMap.get(session.game) || 0) + net);
    });

    if (current.getFullYear() === visibleMonth.year && current.getMonth() === visibleMonth.month) {
      monthNet += totals.net;
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

  el.currentBankroll.textContent = formatINR((state.startBankroll || 0) + totalNet);
  el.overallNet.textContent = formatINR(totalNet);
  el.monthNet.textContent = formatINR(monthNet);
  el.monthBreakdown.textContent = `${activeMonthDays} Active Days`;
  el.weekNet.textContent = formatINR(weekNet);
  el.weekBreakdown.textContent = `${activeWeekSessions} Active Weekly Sessions`;
  el.bestDay.textContent = formatINR(bestMonthDay.net);
  el.bestDayLabel.textContent = bestMonthDay.label;

  const topSite = [...siteMap.entries()].sort((a, b) => b[1] - a[1])[0];
  const topGame = [...gameMap.entries()].sort((a, b) => b[1] - a[1])[0];
  el.bestSite.textContent = topSite ? `${topSite[0]} (${formatINR(topSite[1])})` : "N/A";
  el.bestGame.textContent = topGame ? `${topGame[0]} (${formatINR(topGame[1])})` : "N/A";
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
    updatedAt: null
  };
}

function loadState() {
  const candidates = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
  for (const key of candidates) {
    const raw = localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      return normalizeState(JSON.parse(raw));
    } catch (_error) {
      continue;
    }
  }

  return defaultState();
}

function normalizeState(raw) {
  const source = raw && typeof raw === "object" && raw.data ? raw.data : raw;
  const base = defaultState();
  if (!source || typeof source !== "object") {
    return base;
  }

  return {
    startBankroll: parseAmt(source.startBankroll ?? source.startingBankroll),
    sites: normalizeTags(source.sites, DEFAULT_SITES),
    games: normalizeTags(source.games, DEFAULT_GAMES),
    entries: normalizeEntries(source.entries),
    activeBg: typeof source.activeBg === "string" ? source.activeBg : DEFAULT_BG,
    bgOpacity: clampOpacity(source.bgOpacity ?? DEFAULT_BG_OPACITY),
    updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null
  };
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
    updatedAt: source.updatedAt || new Date().toISOString()
  };
}

function serializedState(source) {
  return JSON.stringify(buildPersistedState(source));
}

function persistLocalState({ touch = true, syncCloud = true } = {}) {
  if (touch) {
    state.updatedAt = new Date().toISOString();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buildPersistedState(state)));
  if (syncCloud) {
    queueRemoteSync();
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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
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
