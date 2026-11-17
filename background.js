const TARGET_HOSTS = [
  "https://www.youtube.com/*",
  "https://m.youtube.com/*",
  "https://x.com/*",
  "https://twitter.com/*",
  "https://www.reddit.com/*",
  "https://old.reddit.com/*",
  "https://news.google.com/*",
  "https://www.twitch.tv/*",
  "https://kick.com/*",
  "https://www.tiktok.com/*",
  "https://www.facebook.com/*",
  "https://www.instagram.com/*",
  "https://www.threads.net/*",
  "https://www.ign.com/*",
  "https://www.gamespot.com/*",
  "https://kotaku.com/*",
  "https://www.pcgamer.com/*",
  "https://www.eurogamer.net/*"
];

async function syncBundledData() {
  try {
    const [rulesRes, dbRes] = await Promise.all([
      fetch(chrome.runtime.getURL("rules.json")),
      fetch(chrome.runtime.getURL("database.json"))
    ]);

    if (rulesRes.ok) {
      const bundledRules = await rulesRes.json();
      if (Array.isArray(bundledRules.directKeywords) && typeof bundledRules.threshold === "number") {
        await chrome.storage.local.set({ rules: bundledRules });
      }
    }

    if (dbRes.ok) {
      const bundledDb = await dbRes.json();
      await chrome.storage.local.set({
        devDatabase: {
          extraKeywords: Array.isArray(bundledDb.extraKeywords) ? bundledDb.extraKeywords : [],
          extraSpoilerSentences: Array.isArray(bundledDb.extraSpoilerSentences) ? bundledDb.extraSpoilerSentences : [],
          blockedSignatures: Array.isArray(bundledDb.blockedSignatures) ? bundledDb.blockedSignatures : []
        }
      });
    }
  } catch (_) {}
}

async function setupContextMenu(langOverride) {
  try {
    let lang = langOverride;
    if (!lang) {
      const data = await chrome.storage.local.get("uiLang");
      lang = data.uiLang;
    }
    const isTR = lang ? lang === "tr" : (chrome.i18n.getUILanguage() || "").toLowerCase().startsWith("tr");
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "spoiler-shield-hide-card",
        title: isTR ? "🛡️ Spoiler Olarak İşaretle ve Gizle" : "🛡️ Mark & Hide as Spoiler",
        contexts: ["all"],
        documentUrlPatterns: TARGET_HOSTS
      });
    });
  } catch (_) {}
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.uiLang && changes.uiLang.newValue) {
    setupContextMenu(changes.uiLang.newValue);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "spoiler-shield-hide-card" && tab && typeof tab.id === "number") {
    chrome.tabs.sendMessage(tab.id, { type: "CONTEXT_HIDE_SPOILER" }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "REPORT_SPOILER" && typeof msg.signature === "string") {
    const cleanSig = msg.signature.slice(0, 48);
    if (!/^(yt:|x:|txt:|url:)[a-zA-Z0-9_-]+$/.test(cleanSig)) {
      sendResponse({ ok: false });
      return false;
    }
    (async () => {
      try {
        const data = await chrome.storage.local.get(["localConfirmed", "reportedCount"]);
        const localConfirmed = Array.isArray(data.localConfirmed) ? data.localConfirmed : [];
        if (!localConfirmed.includes(cleanSig)) {
          localConfirmed.push(cleanSig);
          if (localConfirmed.length > 2000) localConfirmed.shift();
          await chrome.storage.local.set({
            localConfirmed,
            reportedCount: (data.reportedCount || 0) + 1,
            lastReportedSig: cleanSig
          });
        } else {
          await chrome.storage.local.set({ lastReportedSig: cleanSig });
        }
        sendResponse({ ok: true });
      } catch (_) {
        sendResponse({ ok: false });
      }
    })();
    return true;
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get([
    "enabled",
    "metaScanEnabled",
    "customKeywords",
    "blockedCount",
    "reportedCount",
    "localConfirmed"
  ]);
  if (typeof data.enabled !== "boolean") await chrome.storage.local.set({ enabled: true });
  if (typeof data.metaScanEnabled !== "boolean") await chrome.storage.local.set({ metaScanEnabled: true });
  if (!Array.isArray(data.customKeywords)) await chrome.storage.local.set({ customKeywords: [] });
  if (typeof data.blockedCount !== "number") await chrome.storage.local.set({ blockedCount: 0 });
  if (typeof data.reportedCount !== "number") await chrome.storage.local.set({ reportedCount: 0 });
  if (!Array.isArray(data.localConfirmed)) await chrome.storage.local.set({ localConfirmed: [] });

  await syncBundledData();
  setupContextMenu();
});
