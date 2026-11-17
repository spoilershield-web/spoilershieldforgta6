(() => {
  "use strict";

  // Replace YOUR_USERNAME with your Buy Me a Coffee username
  const RAW_BMC_URL = "https://buymeacoffee.com/spoilershield";
  const SAFE_BMC_URL = RAW_BMC_URL.startsWith("https://buymeacoffee.com/")
    ? RAW_BMC_URL
    : "https://buymeacoffee.com/";

  const LIMITS = Object.freeze({
    MAX_CUSTOM_KEYWORDS: 50,
    MAX_KEYWORD_LEN: 60
  });

  const STRINGS = Object.freeze({
    tr: Object.freeze({
      hiddenTitle: "🛡️ Engellenen Konu / Spoiler Gizlendi",
      metaHiddenTitle: "🛡️ Sayfa Meta Verisinde Engelli Konu Tespit Edildi",
      confirmedTitle: "🚨 Spoiler Olarak İşaretlendi",
      showSpoiler: "👁️ Göster",
      hideSpoiler: "🙈 Gizle",
      reportSpoiler: "🚨 Spoiler Bildir",
      coffee: "☕ Kahve"
    }),
    en: Object.freeze({
      hiddenTitle: "🛡️ Blocked Topic / Spoiler Hidden",
      metaHiddenTitle: "🛡️ Blocked Topic Detected in Page Metadata",
      confirmedTitle: "🚨 Marked as Spoiler",
      showSpoiler: "👁️ Show",
      hideSpoiler: "🙈 Hide",
      reportSpoiler: "🚨 Confirm Spoiler",
      coffee: "☕ Coffee"
    })
  });

  let currentLang = (navigator.language || "").toLowerCase().startsWith("tr") ? "tr" : "en";
  function getUI() {
    return STRINGS[currentLang] || STRINGS.en;
  }

  const DEFAULT_RULES = {
    threshold: 100,
    directKeywords: [
      "gta", "gta 6", "gta vi", "gtavi", "gta6",
      "gta v", "gta 5", "gtav", "gta5",
      "gta 4", "gta iv", "gtaiv", "gta4",
      "gta vice city", "vice city", "vicecity",
      "grand theft auto", "grand theft auto 6", "grand theft auto vi",
      "grand theft auto v", "grand theft auto 5",
      "grand theft auto 4", "grand theft auto iv",
      "lucia", "lucia caminos",
      "jason", "jason duval",
      "leonida", "leonidas",
      "rockstar", "rockstargames", "rockstar games",
      "port gellhorn", "grassrivers", "mount kalaga",
      "boobie ike", "cal hampton", "real dimez", "raul bautista",
      "brian heder", "dre'quan priest"
    ],
    contextEntities: [
      "take-two", "take two", "strauss zelnick", "sam houser", "dan houser",
      "trailer 2", "trailer 3"
    ],
    spoilerTriggers: [
      "ending", "final", "finale", "dies", "death", "dead", "betrayal",
      "betrays", "killed", "leak", "leaked", "leaks", "heist", "post-credits",
      "secret ending", "all endings", "plot twist", "story mode", "full gameplay",
      "final mission", "last mission", "ending a", "ending b", "ending c",
      "sonu", "finali", "öldü", "ölümü", "ihanet", "sızıntı", "sızdırıldı",
      "gizli son", "tüm sonlar", "hikaye modu", "büyük soygun", "son görev",
      "filtración", "filtraciones", "filtrado", "filtrada", "vazamento", "vazou",
      "muere", "muerte", "morre", "morte", "traición", "traição",
      "misión final", "missão final", "todos los finales", "todos os finais",
      "fuite", "fuites", "fin secrète", "trahison",
      "ende", "stirbt", "verrat", "geleakt",
      "finale segreto", "muore", "tradimento", "trapelato"
    ]
  };

  const DEFAULT_DEV_DB = {
    "extraKeywords": [
    "cyberleek",
    "cyber leek",
    "cyberleeks",
    "lucia ending",
    "jason ending",
    "vice city leak",
    "leonida map",
    "project americas",
    "gta 6 leak",
    "gta6 leak",
    "gta vi leak",
    "gta vi leaks",
    "gta 6 leaks",
    "gta6 leaks",
    "gtavi leaks",
    "gtavi leak",
    "gta 6 ending",
    "gta 6 ending leaked",
    "gta 6 ending leak",
    "gta 6 end",
    "gta 6 final",
    "gta 6 final leaked",
    "gta 6 final leak",
    "gta 6 final ending",
    "gta 6 final ending leaked",
    "gta 6 final ending leak",
    "gta 6 final leaks",
    "gta vi final leaks",
    "gta vi final leak",
    "gta vi final ending",
    "gta vi final ending leaked",
    "gta vi final ending leak",
    "gta vi final ending leaks",
    "gta vi ending",
    "gta vi ending leaked",
    "gta vi ending leak",
    "gta vi ending leaks",
    "gta vi end",
    "gta vi final",
    "gta vi final leaked",
    "gta vi final leak",
    "gta vi final ending",
    "gta vi final ending leaked",
    "gta vi final ending leak",
    "gta vi final ending leaks",
    "gta vi final leaks"
  ],
    extraSpoilerSentences: [
      "ana karakter ölüyor",
      "ana karakter öldü",
      "iki karakterden biri ölüyor",
      "oyunun sonu sızdı",
      "oyunun finali sızdı",
      "final sahnesi sızdı",
      "son ara sahne sızdırıldı",
      "hikayenin tamamı sızdı",
      "gizli son ortaya çıktı",
      "main character dies",
      "both characters die",
      "ending cutscene leaked",
      "final cutscene leaked",
      "final mission leaked",
      "full story leaked",
      "all endings leaked",
      "secret ending leaked",
      "kills lucia",
      "kills jason",
      "lucia dies",
      "jason dies",
      "lucia ölüyor",
      "jason ölüyor"
    ],
    blockedSignatures: []
  };

  const CARD_SELECTORS = [
    "ytd-rich-item-renderer",
    "ytd-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-compact-radio-renderer",
    "ytd-compact-playlist-renderer",
    "ytd-grid-video-renderer",
    "yt-lockup-view-model",
    "ytm-shorts-lockup-view-model",
    "ytm-shorts-lockup-view-model-v2",
    "ytd-reel-item-renderer",
    "ytd-reel-video-renderer",
    "ytd-comment-thread-renderer",
    ".ytp-videowall-still",
    ".ytp-ce-element",
    "article",
    "shreddit-post"
  ].join(",");

  let isEnabled = true;
  let metaScanEnabled = true;
  let rules = DEFAULT_RULES;
  let devDatabase = DEFAULT_DEV_DB;
  let customKeywords = [];
  let compiledMatchers = null;
  let localConfirmedSet = new Set();
  let devSignatureSet = new Set();
  const sessionRevealedSet = new Set();
  let pendingIncrement = 0;
  let flushTimer = null;

  const dirtyCards = new Set();
  let flushRafScheduled = false;
  let lastMetaUrl = "";
  let lastMetaCheckTime = 0;
  let lastContextTarget = null;

  function isExtensionAlive() {
    try {
      return Boolean(chrome && chrome.runtime && chrome.runtime.id);
    } catch (_) {
      return false;
    }
  }

  // Track right-clicked element for zero-CPU contextMenu spoiler reporting
  document.addEventListener(
    "contextmenu",
    (e) => {
      lastContextTarget = e.target;
    },
    true
  );

  // SPA Sensitive Route Guard: never read DMs, login forms, or account settings
  function isSensitiveRoute() {
    const path = (window.location.pathname || "").toLowerCase();
    const hash = (window.location.hash || "").toLowerCase();
    const check = (str) =>
      str.startsWith("/messages") ||
      str.startsWith("/direct") ||
      str.startsWith("/chat") ||
      str.startsWith("/message") ||
      str.startsWith("/settings") ||
      str.startsWith("/accounts") ||
      str.startsWith("/account") ||
      str.startsWith("/login") ||
      str.startsWith("/signin") ||
      str.startsWith("/signup") ||
      str.startsWith("/auth") ||
      str.startsWith("/register") ||
      str.startsWith("/password") ||
      str.startsWith("/checkout") ||
      str.startsWith("/inbox") ||
      str.startsWith("/i/flow");
    return check(path) || (hash.length > 2 && check(hash.replace(/^[#!]+/, "")));
  }

  function handleRouteChange() {
    if (isSensitiveRoute()) {
      dirtyCards.clear();
      flushRafScheduled = false;
      document.querySelectorAll("[data-gta6-state]").forEach(removeShieldControls);
    } else {
      scheduleFlush();
      fullRescan();
    }
  }
  ["pushState", "replaceState"].forEach((fnName) => {
    const orig = history[fnName];
    if (typeof orig !== "function") return;
    history[fnName] = function (...args) {
      const ret = orig.apply(this, args);
      try { handleRouteChange(); } catch (_) {}
      return ret;
    };
  });
  window.addEventListener("popstate", () => {
    try { handleRouteChange(); } catch (_) {}
  }, true);
  window.addEventListener("hashchange", () => {
    try { handleRouteChange(); } catch (_) {}
  }, true);

  function injectStyles() {
    if (document.getElementById("gta6-shield-styles")) return;
    const style = document.createElement("style");
    style.id = "gta6-shield-styles";
    style.textContent = `
      [data-gta6-state="blocked"] {
        overflow: hidden !important;
        min-height: 112px !important;
        border-radius: 12px !important;
      }
      [data-gta6-state="blocked"] > *:not(.gta6-shield-overlay):not(.gta6-revealed-bar) {
        filter: blur(18px) saturate(1.2) !important;
        pointer-events: none !important;
        user-select: none !important;
      }
      /* Vice City / Sunset Neon Theme Overlay */
      .gta6-shield-overlay {
        position: absolute !important;
        inset: 0 !important;
        z-index: 9999 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 11px !important;
        background: linear-gradient(135deg, rgba(20, 10, 42, 0.93) 0%, rgba(56, 16, 72, 0.91) 52%, rgba(24, 18, 58, 0.94) 100%) !important;
        border: 1px solid rgba(244, 114, 182, 0.42) !important;
        box-shadow: inset 0 0 32px rgba(236, 72, 153, 0.18), inset 0 1px 0 rgba(251, 146, 60, 0.25) !important;
        color: #fff1f2 !important;
        border-radius: 12px !important;
        padding: 14px 16px !important;
        text-align: center !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        box-sizing: border-box !important;
        cursor: default !important;
      }
      [data-gta6-confirmed="true"] > .gta6-shield-overlay {
        background: linear-gradient(135deg, rgba(69, 10, 26, 0.95) 0%, rgba(112, 18, 48, 0.94) 100%) !important;
        border: 1px solid rgba(251, 113, 133, 0.8) !important;
        box-shadow: inset 0 0 32px rgba(244, 63, 94, 0.25) !important;
      }
      .gta6-shield-title {
        font-weight: 800 !important;
        font-size: 15px !important;
        letter-spacing: 0.2px !important;
        line-height: 1.35 !important;
        max-width: 100% !important;
        color: #ffffff !important;
        text-shadow: 0 2px 10px rgba(236, 72, 153, 0.45) !important;
      }
      [data-gta6-confirmed="true"] .gta6-shield-title {
        color: #fecdd3 !important;
        text-shadow: 0 2px 10px rgba(244, 63, 94, 0.5) !important;
      }
      .gta6-shield-actions {
        display: flex !important;
        gap: 10px !important;
        flex-wrap: wrap !important;
        justify-content: center !important;
        align-items: center !important;
      }
      .gta6-btn {
        border: none !important;
        border-radius: 8px !important;
        padding: 8px 15px !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        cursor: pointer !important;
        text-decoration: none !important;
        line-height: 1.25 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 5px !important;
        transition: transform 0.12s ease, filter 0.12s ease !important;
      }
      .gta6-btn:hover {
        filter: brightness(1.08) !important;
        transform: translateY(-1px) !important;
      }
      .gta6-btn-show {
        background: rgba(34, 22, 66, 0.9) !important;
        color: #fdf2f8 !important;
        border: 1px solid rgba(244, 114, 182, 0.55) !important;
        box-shadow: 0 2px 10px rgba(15, 10, 30, 0.4) !important;
      }
      .gta6-btn-coffee {
        background: linear-gradient(135deg, #fde047 0%, #fb923c 100%) !important;
        color: #1e1035 !important;
        font-weight: 800 !important;
        box-shadow: 0 2px 12px rgba(251, 146, 60, 0.35) !important;
      }
      [data-gta6-state="revealed"] > .gta6-shield-overlay {
        display: none !important;
      }
      .gta6-revealed-bar {
        display: none !important;
        position: absolute !important;
        top: 8px !important;
        right: 8px !important;
        z-index: 9998 !important;
        gap: 7px !important;
        align-items: center !important;
      }
      [data-gta6-state="revealed"] > .gta6-revealed-bar {
        display: inline-flex !important;
      }
      .gta6-pill-hide {
        background: rgba(24, 14, 52, 0.94) !important;
        color: #fdf2f8 !important;
        border: 1px solid rgba(244, 114, 182, 0.7) !important;
        border-radius: 999px !important;
        padding: 6px 12px !important;
        font-size: 12.5px !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35) !important;
      }
      .gta6-pill-report {
        background: linear-gradient(135deg, #be123c 0%, #9f1239 100%) !important;
        color: #fff1f2 !important;
        border: 1px solid rgba(253, 164, 175, 0.8) !important;
        border-radius: 999px !important;
        padding: 6px 12px !important;
        font-size: 12.5px !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35) !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function sanitizeKeywordList(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (let i = 0; i < list.length && out.length < LIMITS.MAX_CUSTOM_KEYWORDS; i++) {
      if (typeof list[i] !== "string") continue;
      const cleaned = list[i].replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, LIMITS.MAX_KEYWORD_LEN);
      if (cleaned.length >= 2) out.push(cleaned);
    }
    return out;
  }

  function expandUserKeywords(userList) {
    const expanded = new Set();
    for (const raw of sanitizeKeywordList(userList)) {
      const clean = raw.toLowerCase().replace(/\s+/g, " ");
      expanded.add(clean);
      if (clean.includes(" ")) {
        expanded.add(clean.replace(/\s+/g, ""));
        expanded.add(clean.replace(/\s+/g, "-"));
      }
      if (/\b6$/.test(clean)) {
        const base = clean.replace(/\s*6$/, "");
        if (base.trim().length >= 2) {
          expanded.add(`${base} vi`);
          expanded.add(`${base}vi`);
        }
      } else if (/\bvi$/.test(clean)) {
        const base = clean.replace(/\s*vi$/, "");
        if (base.trim().length >= 2) {
          expanded.add(`${base} 6`);
          expanded.add(`${base}6`);
        }
      }
    }
    return Array.from(expanded);
  }

  function buildMatchers(ruleObj, dbObj, extraUserKeywords) {
    const combinedDirect = [
      ...(Array.isArray(ruleObj.directKeywords) ? ruleObj.directKeywords : []),
      ...(Array.isArray(dbObj.extraKeywords) ? dbObj.extraKeywords : []),
      ...(Array.isArray(dbObj.extraSpoilerSentences) ? dbObj.extraSpoilerSentences : []),
      ...expandUserKeywords(extraUserKeywords || [])
    ];

    const toRegex = (list, allowApostropheSuffix = false) => {
      if (!Array.isArray(list) || list.length === 0) return null;
      try {
        const pattern = list
          .filter((item) => typeof item === "string" && item.trim().length >= 2)
          .map((item) => escapeRegex(item.trim().replace(/\s+/g, " ")).replace(/\ /g, "[\\s\\-_]+"))
          .join("|");
        if (!pattern) return null;
        const suffix = allowApostropheSuffix ? "(?:['’][\\p{L}_]+)?" : "";
        return new RegExp(`(?:^|[^\\p{L}\\p{N}_])(?:${pattern})${suffix}(?=$|[^\\p{L}\\p{N}_])`, "iu");
      } catch (_) {
        return null;
      }
    };

    return {
      direct: toRegex(combinedDirect, true),
      entity: toRegex(ruleObj.contextEntities, true),
      trigger: toRegex(ruleObj.spoilerTriggers, false)
    };
  }

  compiledMatchers = buildMatchers(rules, devDatabase, customKeywords);

  function fnv1a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16);
  }

  function getContentSignature(card, fastText) {
    const link = card.querySelector("a[href*='/watch?v='], a[href*='/shorts/'], a[href*='/status/']");
    if (link) {
      const href = link.getAttribute("href") || "";
      const ytMatch = href.match(/(?:watch\?v=|\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) return "yt:" + ytMatch[1];
      const xMatch = href.match(/\/status\/(\d+)/);
      if (xMatch) return "x:" + xMatch[1];
    }
    const stablePrefix = fastText.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 80);
    return "txt:" + fnv1a(stablePrefix);
  }

  function extractCardPayload(card) {
    let payload = card.textContent || "";
    if (metaScanEnabled) {
      const links = card.getElementsByTagName("a");
      for (let i = 0; i < links.length && i < 15; i++) {
        const a = links[i];
        const title = a.getAttribute("title");
        const aria = a.getAttribute("aria-label");
        const href = a.getAttribute("href");
        if (title) payload += " " + title;
        if (aria) payload += " " + aria;
        if (href && href.length > 5 && !href.startsWith("javascript:")) {
          payload += " " + href.replace(/[-_/?.=&+]+/g, " ");
        }
      }
      const imgs = card.getElementsByTagName("img");
      for (let i = 0; i < imgs.length && i < 10; i++) {
        const alt = imgs[i].getAttribute("alt");
        if (alt) payload += " " + alt;
      }
    }
    return payload;
  }

  function scoreText(text) {
    if (!compiledMatchers || !text) return 0;
    if (compiledMatchers.direct && compiledMatchers.direct.test(text)) {
      return 100;
    }
    let score = 0;
    if (compiledMatchers.entity && compiledMatchers.entity.test(text)) score += 50;
    if (compiledMatchers.trigger && compiledMatchers.trigger.test(text)) score += 50;
    return score;
  }

  function queueIncrement() {
    pendingIncrement += 1;
    if (flushTimer) return;
    flushTimer = setTimeout(async () => {
      const countToAdd = pendingIncrement;
      pendingIncrement = 0;
      flushTimer = null;
      if (!isExtensionAlive()) return;
      try {
        const data = await chrome.storage.local.get("blockedCount");
        await chrome.storage.local.set({ blockedCount: (data.blockedCount || 0) + countToAdd });
      } catch (_) {}
    }, 1500);
  }

  function lockMediaInside(card, shouldLock) {
    const mediaEls = card.querySelectorAll("video, audio");
    for (let i = 0; i < mediaEls.length; i++) {
      const v = mediaEls[i];
      try {
        if (shouldLock) {
          if (!v.dataset.gta6PrevMuted) {
            v.dataset.gta6PrevMuted = v.muted ? "1" : "0";
          }
          v.muted = true;
          v.volume = 0;
          if (!v.paused) v.pause();
        } else if (v.dataset.gta6PrevMuted) {
          v.muted = v.dataset.gta6PrevMuted === "1";
          delete v.dataset.gta6PrevMuted;
        }
      } catch (_) {}
    }
  }

  document.addEventListener(
    "play",
    (e) => {
      if (!isEnabled) return;
      const target = (e.composedPath && e.composedPath()[0]) || e.target;
      if (target && (target.tagName === "VIDEO" || target.tagName === "AUDIO")) {
        const blockedParent = target.closest && target.closest("[data-gta6-state='blocked']");
        if (blockedParent) {
          target.muted = true;
          target.volume = 0;
          target.pause();
        }
      }
    },
    true
  );

  function blockAccidentalNav(el) {
    ["click", "mousedown", "auxclick"].forEach((evtName) => {
      el.addEventListener(evtName, (e) => {
        if (e.target && e.target.closest(".gta6-btn-show, .gta6-btn-coffee")) {
          e.stopPropagation();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  function ensurePositioned(card) {
    try {
      if (getComputedStyle(card).position === "static") {
        card.style.setProperty("position", "relative", "important");
      }
    } catch (_) {}
  }

  function ensureShieldControls(card, signature, isConfirmed, customLabel) {
    const ui = getUI();
    ensurePositioned(card);
    card.dataset.gta6Confirmed = isConfirmed ? "true" : "false";
    const labelText = isConfirmed ? ui.confirmedTitle : (customLabel || ui.hiddenTitle);

    let overlay = card.querySelector(".gta6-shield-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "gta6-shield-overlay";
      blockAccidentalNav(overlay);

      const title = document.createElement("div");
      title.className = "gta6-shield-title";
      title.textContent = labelText;

      const actions = document.createElement("div");
      actions.className = "gta6-shield-actions";

      const showBtn = document.createElement("button");
      showBtn.type = "button";
      showBtn.className = "gta6-btn gta6-btn-show";
      showBtn.textContent = ui.showSpoiler;
      showBtn.addEventListener("mousedown", (e) => e.stopPropagation());
      showBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const activeSig = card.dataset.gta6Sig || signature;
        if (activeSig) sessionRevealedSet.add(activeSig);
        card.dataset.gta6State = "revealed";
        lockMediaInside(card, false);
      });

      const coffeeLink = document.createElement("a");
      coffeeLink.className = "gta6-btn gta6-btn-coffee";
      coffeeLink.href = SAFE_BMC_URL;
      coffeeLink.target = "_blank";
      coffeeLink.rel = "noopener noreferrer";
      coffeeLink.textContent = ui.coffee;
      coffeeLink.addEventListener("mousedown", (e) => e.stopPropagation());
      coffeeLink.addEventListener("click", (e) => e.stopPropagation());

      actions.appendChild(showBtn);
      actions.appendChild(coffeeLink);
      overlay.appendChild(title);
      overlay.appendChild(actions);
      try { card.appendChild(overlay); } catch (_) {}
    } else {
      const title = overlay.querySelector(".gta6-shield-title");
      if (title) title.textContent = labelText;
      const showBtn = overlay.querySelector(".gta6-btn-show");
      if (showBtn) showBtn.textContent = ui.showSpoiler;
      const coffeeLink = overlay.querySelector(".gta6-btn-coffee");
      if (coffeeLink) coffeeLink.textContent = ui.coffee;
    }

    let revealedBar = card.querySelector(".gta6-revealed-bar");
    if (!revealedBar) {
      revealedBar = document.createElement("div");
      revealedBar.className = "gta6-revealed-bar";

      const hideBtn = document.createElement("button");
      hideBtn.type = "button";
      hideBtn.className = "gta6-pill-hide";
      hideBtn.textContent = ui.hideSpoiler;
      hideBtn.addEventListener("mousedown", (e) => e.stopPropagation());
      hideBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const activeSig = card.dataset.gta6Sig || signature;
        if (activeSig) sessionRevealedSet.delete(activeSig);
        card.dataset.gta6State = "blocked";
        lockMediaInside(card, true);
      });

      const reportBtn = document.createElement("button");
      reportBtn.type = "button";
      reportBtn.className = "gta6-pill-report";
      reportBtn.textContent = ui.reportSpoiler;
      reportBtn.addEventListener("mousedown", (e) => e.stopPropagation());
      reportBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        markCardAsConfirmedSpoiler(card, signature);
      });

      revealedBar.appendChild(hideBtn);
      revealedBar.appendChild(reportBtn);
      try { card.appendChild(revealedBar); } catch (_) {}
    } else {
      const hideBtn = revealedBar.querySelector(".gta6-pill-hide");
      if (hideBtn) hideBtn.textContent = ui.hideSpoiler;
      const reportBtn = revealedBar.querySelector(".gta6-pill-report");
      if (reportBtn) reportBtn.textContent = ui.reportSpoiler;
    }
  }

  function markCardAsConfirmedSpoiler(card, fallbackSig) {
    const fastRaw = card.textContent || "";
    const sig = card.dataset.gta6Sig || fallbackSig || getContentSignature(card, fastRaw);
    card.dataset.gta6Sig = sig;
    sessionRevealedSet.delete(sig);
    localConfirmedSet.add(sig);
    ensureShieldControls(card, sig, true);
    card.dataset.gta6State = "blocked";
    lockMediaInside(card, true);
    if (isExtensionAlive()) {
      try {
        chrome.runtime.sendMessage({ type: "REPORT_SPOILER", signature: sig });
      } catch (_) {}
    }
  }

  function removeShieldControls(card) {
    lockMediaInside(card, false);
    delete card.dataset.gta6State;
    delete card.dataset.gta6Confirmed;
    delete card.dataset.gta6Sig;
    delete card.dataset.gta6Hash;
    const overlay = card.querySelector(".gta6-shield-overlay");
    if (overlay) { try { overlay.remove(); } catch (_) {} }
    const bar = card.querySelector(".gta6-revealed-bar");
    if (bar) { try { bar.remove(); } catch (_) {} }
  }

  function processCard(card) {
    if (!isEnabled || !rules || !card.isConnected || isSensitiveRoute()) return;
    if (card === document.body || card === document.documentElement) return;

    // Password & message input blindness: never read forms, password inputs, or chat editors
    if (card.querySelector("input[type='password'], textarea, [contenteditable]:not([contenteditable='false'])")) {
      return;
    }

    if (card.parentElement && card.parentElement.closest(CARD_SELECTORS)) {
      return;
    }

    const fastRaw = card.textContent || "";
    const fullPayload = extractCardPayload(card);
    const fastHash = fnv1a(fullPayload || fastRaw);

    if (card.dataset.gta6Hash === fastHash) {
      if (card.dataset.gta6State === "blocked" || card.dataset.gta6State === "revealed") {
        const sig = card.dataset.gta6Sig || "";
        const isConf = localConfirmedSet.has(sig) || devSignatureSet.has(sig);
        ensureShieldControls(card, sig, isConf);
        if (card.dataset.gta6State === "blocked") lockMediaInside(card, true);
      }
      return;
    }

    card.dataset.gta6Hash = fastHash;

    if (!fullPayload.trim()) return;

    const sig = getContentSignature(card, fastRaw);
    const prevSig = card.dataset.gta6Sig || "";
    card.dataset.gta6Sig = sig;
    const isConfirmed = localConfirmedSet.has(sig) || devSignatureSet.has(sig);

    if (
      !isConfirmed &&
      (sessionRevealedSet.has(sig) || (card.dataset.gta6State === "revealed" && prevSig === sig))
    ) {
      ensureShieldControls(card, sig, false);
      card.dataset.gta6State = "revealed";
      return;
    }

    const wasAlreadyBlocked = card.dataset.gta6State === "blocked";
    const score = isConfirmed ? 100 : scoreText(fullPayload);
    if (score >= (rules.threshold || 100)) {
      ensureShieldControls(card, sig, isConfirmed);
      card.dataset.gta6State = "blocked";
      lockMediaInside(card, true);
      if (!wasAlreadyBlocked) {
        queueIncrement();
      }
    } else {
      removeShieldControls(card);
    }
  }

  function inspectPageMetadata() {
    if (!isEnabled || !metaScanEnabled || !rules || isSensitiveRoute()) return;

    const now = Date.now();
    const currentHref = window.location.href;
    if (currentHref === lastMetaUrl && now - lastMetaCheckTime < 2000) return;
    lastMetaUrl = currentHref;
    lastMetaCheckTime = now;

    const path = window.location.pathname || "/";
    if (path === "/" || path === "/home" || path === "/explore" || path === "/feed/subscriptions") return;

    const isWatchPage = path.startsWith("/watch") || path.startsWith("/shorts/");
    const ogTypeEl = document.querySelector("meta[property='og:type']");
    const ogType = ogTypeEl ? (ogTypeEl.getAttribute("content") || "").toLowerCase() : "";
    const isArticlePage = ogType === "article" || ogType === "video" || path.split("/").filter(Boolean).length >= 2;

    if (!isWatchPage && !isArticlePage) return;

    let metaBlob = (document.title || "") + " " + path.replace(/[-_/]+/g, " ");
    const metas = document.querySelectorAll(
      "meta[name='keywords'], meta[name='news_keywords'], meta[name='description'], meta[property='og:title'], meta[property='og:description'], meta[name='twitter:title'], meta[property='article:tag']"
    );
    for (let i = 0; i < metas.length; i++) {
      const c = metas[i].getAttribute("content");
      if (c) metaBlob += " " + c;
    }

    if (scoreText(metaBlob) >= (rules.threshold || 100)) {
      const target = isWatchPage
        ? document.querySelector("ytd-watch-flexy #primary-inner, ytd-reel-video-renderer[is-active]")
        : document.querySelector("article, main");

      if (
        target &&
        !target.dataset.gta6State &&
        target !== document.body &&
        !target.querySelector("input[type='password'], form")
      ) {
        const sig = "url:" + fnv1a(currentHref);
        target.dataset.gta6Hash = sig;
        target.dataset.gta6Sig = sig;
        ensureShieldControls(target, sig, false, getUI().metaHiddenTitle);
        target.dataset.gta6State = "blocked";
        lockMediaInside(target, true);
      }
    }
  }

  function flushDirtyCards() {
    flushRafScheduled = false;
    if (!isEnabled || !rules || isSensitiveRoute()) {
      dirtyCards.clear();
      return;
    }
    injectStyles();
    dirtyCards.forEach((card) => processCard(card));
    dirtyCards.clear();

    if (window.location.href !== lastMetaUrl) {
      inspectPageMetadata();
    }
  }

  function scheduleFlush() {
    if (flushRafScheduled) return;
    flushRafScheduled = true;
    requestAnimationFrame(flushDirtyCards);
  }

  function enqueueElement(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.matches && el.matches(CARD_SELECTORS)) {
      dirtyCards.add(el);
    }
    const parentCard = el.closest && el.closest(CARD_SELECTORS);
    if (parentCard) {
      dirtyCards.add(parentCard);
    }
    if (el.querySelectorAll && el.children && el.children.length > 0) {
      const nested = el.querySelectorAll(CARD_SELECTORS);
      for (let i = 0; i < nested.length; i++) {
        dirtyCards.add(nested[i]);
      }
    }
  }

  function fullRescan() {
    if (!isEnabled || !rules || isSensitiveRoute()) return;
    injectStyles();
    const all = document.querySelectorAll(CARD_SELECTORS);
    for (let i = 0; i < all.length; i++) {
      processCard(all[i]);
    }
    lastMetaUrl = "";
    inspectPageMetadata();
  }

  // Listen for Right-Click ContextMenu "Hide Spoiler" action
  if (isExtensionAlive()) {
    try {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg && msg.type === "CONTEXT_HIDE_SPOILER" && lastContextTarget && !isSensitiveRoute()) {
          let card = lastContextTarget.closest ? lastContextTarget.closest(CARD_SELECTORS) : null;
          if (!card && lastContextTarget.closest) {
            card = lastContextTarget.closest(
              "div[role='article'], div[data-pagelet*='FeedUnit'], div[data-e2e='recommend-list-item-container'], section, main"
            );
          }
          if (card && card !== document.body && card !== document.documentElement) {
            injectStyles();
            markCardAsConfirmedSpoiler(card);
          }
        }
      });
    } catch (_) {}
  }

  async function init() {
    if (!isExtensionAlive()) return;
    if (!isSensitiveRoute()) {
      injectStyles();
    }

    const observer = new MutationObserver((mutations) => {
      if (!isEnabled || isSensitiveRoute()) return;
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (m.type === "childList") {
          for (let j = 0; j < m.addedNodes.length; j++) {
            const node = m.addedNodes[j];
            if (node.nodeType === 1) {
              if (node.classList && (node.classList.contains("gta6-shield-overlay") || node.classList.contains("gta6-revealed-bar"))) {
                continue;
              }
              enqueueElement(node);
            } else if (node.nodeType === 3 && node.parentElement) {
              enqueueElement(node.parentElement);
            }
          }
        } else if (m.type === "characterData" && m.target && m.target.parentElement) {
          enqueueElement(m.target.parentElement);
        } else if (m.type === "attributes" && m.target && m.target.nodeType === 1) {
          enqueueElement(m.target);
        }
      }
      if (dirtyCards.size > 0 || window.location.href !== lastMetaUrl) {
        scheduleFlush();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["href", "src", "title", "aria-label", "alt"]
    });

    let state = {};
    try {
      state = await chrome.storage.local.get([
        "enabled",
        "metaScanEnabled",
        "customKeywords",
        "rules",
        "devDatabase",
        "localConfirmed",
        "uiLang"
      ]);
    } catch (_) {
      return;
    }

    if (state.uiLang === "tr" || state.uiLang === "en") {
      currentLang = state.uiLang;
    }
    isEnabled = state.enabled !== false;
    metaScanEnabled = state.metaScanEnabled !== false;
    customKeywords = sanitizeKeywordList(state.customKeywords);
    if (state.rules) rules = state.rules;
    if (state.devDatabase) {
      devDatabase = state.devDatabase;
      if (Array.isArray(devDatabase.blockedSignatures)) {
        devSignatureSet = new Set(devDatabase.blockedSignatures);
      }
    }
    compiledMatchers = buildMatchers(rules, devDatabase, customKeywords);

    if (Array.isArray(state.localConfirmed)) localConfirmedSet = new Set(state.localConfirmed);

    if (!isEnabled || isSensitiveRoute()) {
      if (!isEnabled) {
        document.querySelectorAll("[data-gta6-state]").forEach(removeShieldControls);
      }
    } else {
      fullRescan();
    }

    try {
      chrome.storage.onChanged.addListener((changes) => {
        let needRescan = false;

        if (changes.uiLang && (changes.uiLang.newValue === "tr" || changes.uiLang.newValue === "en")) {
          currentLang = changes.uiLang.newValue;
          needRescan = true;
        }
        if (changes.enabled) {
          isEnabled = changes.enabled.newValue;
          if (!isEnabled) {
            document.querySelectorAll("[data-gta6-state]").forEach(removeShieldControls);
            return;
          }
          needRescan = true;
        }
        if (changes.metaScanEnabled) {
          metaScanEnabled = changes.metaScanEnabled.newValue;
          needRescan = true;
        }
        if (changes.customKeywords) {
          customKeywords = sanitizeKeywordList(changes.customKeywords.newValue);
          compiledMatchers = buildMatchers(rules, devDatabase, customKeywords);
          needRescan = true;
        }
        if (changes.rules && changes.rules.newValue) {
          rules = changes.rules.newValue;
          compiledMatchers = buildMatchers(rules, devDatabase, customKeywords);
          needRescan = true;
        }
        if (changes.devDatabase && changes.devDatabase.newValue) {
          devDatabase = changes.devDatabase.newValue;
          devSignatureSet = new Set(Array.isArray(devDatabase.blockedSignatures) ? devDatabase.blockedSignatures : []);
          compiledMatchers = buildMatchers(rules, devDatabase, customKeywords);
          needRescan = true;
        }
        if (changes.localConfirmed && Array.isArray(changes.localConfirmed.newValue)) {
          localConfirmedSet = new Set(changes.localConfirmed.newValue);
          needRescan = true;
        }

        if (needRescan) {
          document.querySelectorAll("[data-gta6-hash]").forEach((c) => delete c.dataset.gta6Hash);
          fullRescan();
        }
      });
    } catch (_) {}
  }

  init();
})();
