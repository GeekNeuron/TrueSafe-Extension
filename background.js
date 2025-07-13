// Manages core logic: error detection, whitelist checking, and communication.

// Store temporary data per tab (cleared when tab is closed)
chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PASSWORD_FIELD_DETECTED" && sender.tab?.id) {
    chrome.storage.session.set({ [sender.tab.id]: { passwordField: true } });
  }
});

// Main logic for handling security errors
chrome.webNavigation.onErrorOccurred.addListener(async (details) => {
  const bypassableErrors = ['net::ERR_CERT_AUTHORITY_INVALID', 'net::ERR_CERT_COMMON_NAME_INVALID', 'net::ERR_CERT_DATE_INVALID', 'net::ERR_SSL_PROTOCOL_ERROR'];
  if (!bypassableErrors.includes(details.error) || details.frameId !== 0) {
    return;
  }

  const tabId = details.tabId;
  const url = new URL(details.url);
  const origin = url.origin;

  // Store error details for the popup to display
  const tabData = (await chrome.storage.session.get(tabId.toString()))[tabId] || {};
  tabData.error = details.error;
  await chrome.storage.session.set({ [tabId]: tabData });

  // Execute content script to check for password fields
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["content.js"],
  }).catch(err => console.log("Failed to inject content script:", err));


  // Check if the site is whitelisted
  const { whitelistedSites = [] } = await chrome.storage.sync.get('whitelistedSites');
  const match = whitelistedSites.find(site => isMatch(origin, site.origin));

  if (match) {
    // If expired, remove it and do nothing
    if (match.expires && new Date(match.expires) < new Date()) {
      const updatedSites = whitelistedSites.filter(site => site.origin !== match.origin);
      await chrome.storage.sync.set({ whitelistedSites: updatedSites });
      return;
    }
    // If whitelisted and not expired, reload to allow proceeding
    chrome.tabs.update(details.tabId, { url: details.url });
  }
});

// Helper function for wildcard matching
function isMatch(urlOrigin, whitelistPattern) {
  if (whitelistPattern.startsWith('*.')) {
    const domain = whitelistPattern.substring(2);
    return urlOrigin.endsWith(domain);
  }
  return urlOrigin === whitelistPattern;
}
