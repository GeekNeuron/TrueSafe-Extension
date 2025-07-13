document.addEventListener('DOMContentLoaded', async () => {
    // UI Elements
    const pageInfo = document.getElementById('page-info');
    const warningArea = document.getElementById('warning-area');
    const addBtn = document.getElementById('add-btn');
    const removeBtn = document.getElementById('remove-btn');
    const addSection = document.getElementById('add-section');
    const durationSelect = document.getElementById('duration-select');
    const manageBtn = document.getElementById('manage-btn');
    const feedbackArea = document.getElementById('feedback-area');

    // Get Active Tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
        pageInfo.textContent = 'Not a valid web page.';
        return;
    }
    const url = new URL(tab.url);
    const origin = url.origin;
    pageInfo.textContent = `Site: ${origin}`;
    addBtn.disabled = false;

    // Check for warnings
    const tabData = (await chrome.storage.session.get(tab.id.toString()))[tab.id];
    if (tabData) {
        let warnings = '';
        if (tabData.error) {
            warnings += `<div class="warning"><b>Reason:</b> ${tabData.error}</div>`;
        }
        if (tabData.passwordField) {
            warnings += `<div class="critical" style="margin-top: 5px;"><b>CRITICAL:</b> Password field detected. Whitelisting is highly discouraged.</div>`;
        }
        if (warnings) {
            warningArea.innerHTML = warnings;
            warningArea.style.display = 'block';
        }
    }

    // Check if site is already whitelisted
    const { whitelistedSites = [] } = await chrome.storage.sync.get('whitelistedSites');
    const existingSite = whitelistedSites.find(site => origin.includes(site.origin.replace('*.', '')));
    if (existingSite) {
        addSection.style.display = 'none';
        removeBtn.style.display = 'block';
    }

    // --- Event Listeners ---
    addBtn.addEventListener('click', async () => {
        // HTTP Warning
        if (url.protocol === 'http:') {
            if (!confirm('This is an insecure HTTP site. Are you sure you want to whitelist it?')) {
                return;
            }
        }
        let expires = null;
        const duration = durationSelect.value;
        if (duration === 'hour') {
            expires = new Date().getTime() + (60 * 60 * 1000);
        } else if (duration === 'session') {
            expires = 'session'; // Background will handle this
        }
        
        const newSite = { origin, expires };
        whitelistedSites.push(newSite);
        await chrome.storage.sync.set({ whitelistedSites });
        showFeedback('✅ Added to Whitelist!');
        setTimeout(() => chrome.tabs.reload(tab.id), 1000);
    });

    removeBtn.addEventListener('click', async () => {
        const updatedSites = whitelistedSites.filter(site => site.origin !== origin);
        await chrome.storage.sync.set({ whitelistedSites: updatedSites });
        showFeedback('❌ Removed from Whitelist!');
        setTimeout(() => window.close(), 1000);
    });

    manageBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());

    function showFeedback(message) {
        addBtn.disabled = true;
        removeBtn.disabled = true;
        feedbackArea.textContent = message;
    }
});
