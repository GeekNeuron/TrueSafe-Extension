import init, { process_and_hash_text } from './wasm_hasher.js';

let wasmModule;
init().then(module => {
    wasmModule = module;
    console.log("TrueSafe Wasm module loaded.");
}).catch(console.error);

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const DECAY_ALARM_NAME = 'whitelistDecayAlarm';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(DECAY_ALARM_NAME, { periodInMinutes: 10080 }); // Weekly
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === DECAY_ALARM_NAME) {
    const { whitelistedSites = [] } = await chrome.storage.sync.get('whitelistedSites');
    const now = Date.now();
    const sitesToNotify = whitelistedSites.filter(site =>
      site.lastAccessed && (now - site.lastAccessed > NINETY_DAYS_MS)
    );
    if (sitesToNotify.length > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'TrueSafe Whitelist Cleanup',
        message: `${sitesToNotify.length} site(s) haven't been visited in over 90 days. Consider removing them from the management page.`
      });
    }
  }
});

async function getCertificateFingerprint(domain) {
  try {
    const response = await fetch(`https://crt.sh/?q=${domain}&output=json`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data || data.length === 0) return null;
    const latestCert = data.reduce((prev, current) => (new Date(prev.not_after) > new Date(current.not_after) ? prev : current));
    if (!latestCert) return null;
    return `${latestCert.issuer_name}:${latestCert.not_before}`;
  } catch (error) {
    console.error("Could not fetch certificate info:", error);
    return null;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_FINGERPRINT") {
        getCertificateFingerprint(message.domain).then(sendResponse);
        return true; // Indicates async response
    }
    
    const tabId = sender.tab?.id;
    if (!tabId) return;

    chrome.storage.session.get(tabId.toString(), (data) => {
        const tabData = data[tabId] || {};
        if (message.type === "PASSWORD_FIELD_DETECTED") {
            tabData.passwordField = true;
        } else if (message.type === "PAGE_CONTENT_FOR_HASHING" && wasmModule) {
            tabData.contentHash = process_and_hash_text(message.text);
        }
        chrome.storage.session.set({ [tabId]: tabData });
    });
});

chrome.webNavigation.onErrorOccurred.addListener(async (details) => {
    if (details.frameId !== 0) return;

    const sslErrors = ['net::ERR_CERT_AUTHORITY_INVALID', 'net::ERR_CERT_COMMON_NAME_INVALID', 'net::ERR_CERT_DATE_INVALID', 'net::ERR_SSL_PROTOCOL_ERROR'];
    const networkErrors = ['net::ERR_CONNECTION_RESET', 'net::ERR_TUNNEL_CONNECTION_FAILED', 'net::ERR_NETWORK_CHANGED', 'net::ERR_DNS_PROBE_FINISHED_NO_INTERNET'];
    const tabId = details.tabId;
    const error = details.error;

    if (sslErrors.includes(error)) {
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"],
        }).catch(err => console.log("Failed to inject content script for SSL Error:", err));
    } else if (networkErrors.includes(error)) {
        const tabData = (await chrome.storage.session.get(tabId.toString()))[tabId] || {};
        tabData.networkInterference = true;
        await chrome.storage.session.set({ [tabId]: tabData });
    }
});

chrome.webNavigation.onCommitted.addListener(async (details) => {
    if (details.frameId !== 0) return;
    await chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ["content.js"],
    }).catch(err => console.log("Failed to inject content script on commit:", err));
});


chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  const url = new URL(details.url);
  const { whitelistedSites = [] } = await chrome.storage.sync.get('whitelistedSites');
  const match = whitelistedSites.find(site => url.origin === site.origin);

  if (match) {
    match.lastAccessed = Date.now();
    await chrome.storage.sync.set({ whitelistedSites });

    const currentFingerprint = await getCertificateFingerprint(url.hostname);
    const sessionData = (await chrome.storage.session.get(details.tabId.toString()))[details.tabId] || {};

    if (match.certificateFingerprint && currentFingerprint && match.certificateFingerprint !== currentFingerprint) {
      sessionData.fingerprintChanged = true;
    }
    
    const newHash = sessionData.contentHash;
    if (match.contentHash && newHash && match.contentHash !== newHash) {
        sessionData.contentChanged = true;
    }

    await chrome.storage.session.set({ [details.tabId]: sessionData });
  }
});
