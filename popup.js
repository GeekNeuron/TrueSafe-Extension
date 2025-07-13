document.addEventListener('DOMContentLoaded', async () => {
    // --- UI Elements ---
    const pageInfo = document.getElementById('page-info');
    const diagnosticsArea = document.getElementById('diagnostics-area');
    const warningArea = document.getElementById('warning-area');
    const recommendationArea = document.getElementById('recommendation-area');
    const addBtn = document.getElementById('add-btn');
    const removeBtn = document.getElementById('remove-btn');
    const addSection = document.getElementById('add-section');
    const durationSelect = document.getElementById('duration-select');
    const manageBtn = document.getElementById('manage-btn');
    const feedbackArea = document.getElementById('feedback-area');

    // --- Initial Setup ---
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || !tab.url.startsWith('http')) {
        pageInfo.textContent = 'Not a valid web page.';
        addBtn.disabled = true;
        return;
    }
    const url = new URL(tab.url);
    const origin = url.origin;
    pageInfo.textContent = `Site: ${origin}`;
    addBtn.disabled = false;

    // --- System Diagnostics ---
    async function runSystemDiagnostics() {
        // 1. Check for network interference flag
        const tabData = (await chrome.storage.session.get(tab.id.toString()))[tab.id] || {};
        if (tabData.networkInterference) {
            const networkWarning = document.createElement('div');
            networkWarning.className = 'diag-warning diag-network';
            networkWarning.innerHTML = '<b>Network Issue Detected:</b> Your connection was interrupted. This may be caused by your Antivirus, Firewall, or a local proxy.';
            diagnosticsArea.appendChild(networkWarning);
        }

        // 2. Check system time
        try {
            const response = await fetch('https://worldtimeapi.org/api/ip');
            if (!response.ok) return;
            const data = await response.json();
            const serverTime = new Date(data.utc_datetime).getTime();
            const localTime = Date.now();
            if (Math.abs(serverTime - localTime) > 180000) { // 3 minutes difference
                const timeWarning = document.createElement('div');
                timeWarning.className = 'diag-warning diag-time';
                timeWarning.innerHTML = '<b>System Time is Incorrect:</b> Your computer\'s clock is out of sync. Please enable "Set time automatically" in your OS settings.';
                diagnosticsArea.appendChild(timeWarning);
            }
        } catch (e) { console.info("Could not check system time."); }
    }
    await runSystemDiagnostics();

    // --- Risk Scoring & Warning Display ---
    const { whitelistedSites = [] } = await chrome.storage.sync.get('whitelistedSites');
    const existingSite = whitelistedSites.find(site => site.origin === origin);
    const tabData = (await chrome.storage.session.get(tab.id.toString()))[tab.id] || {};
    let riskScore = 0;
    let recommendationReason = '';
    
    // Create warning divs
    if (tabData.fingerprintChanged) {
        let div = document.createElement('div');
        div.className = 'critical';
        div.textContent = 'MAJOR WARNING: Certificate fingerprint has changed! This could be a hijack.';
        warningArea.appendChild(div);
    }
    if (tabData.contentChanged) {
        let div = document.createElement('div');
        div.className = 'warning';
        div.textContent = 'Content Changed: The structure of this page has significantly changed. Please re-verify.';
        warningArea.appendChild(div);
    }
    if (tabData.passwordField) {
        let div = document.createElement('div');
        div.className = 'critical';
        div.textContent = 'CRITICAL: Password field detected. Whitelisting is highly discouraged.';
        warningArea.appendChild(div);
        riskScore += 3;
        recommendationReason = 'a password field was detected';
    }
    if (url.protocol === 'http:') {
        riskScore += 2;
        recommendationReason = 'site is not encrypted (HTTP)';
    }

    if (riskScore > 0) {
        durationSelect.value = 'session';
        recommendationArea.textContent = `💡 Recommendation: Whitelist for "Session" only because this ${recommendationReason}.`;
        recommendationArea.style.display = 'block';
    }

    if (existingSite) {
        addSection.style.display = 'none';
        removeBtn.style.display = 'block';
    }

    // --- VirusTotal Check ---
    async function checkVirusTotal(domain, apiKey) {
        addBtn.disabled = true;
        addBtn.textContent = 'Analyzing...';
        try {
            const response = await fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, { headers: { 'x-apikey': apiKey } });
            if (!response.ok) {
                showFeedback('Could not analyze. Proceeding without check.', true);
                return true;
            }
            const data = await response.json();
            const stats = data.data.attributes.last_analysis_stats;
            if (stats.malicious > 0 || stats.suspicious > 0) {
                const threatCount = stats.malicious + stats.suspicious;
                let div = document.createElement('div');
                div.className = 'critical';
                div.innerHTML = `<b>THREAT DETECTED:</b> VirusTotal reports this site as malicious (${threatCount} vendors). Whitelisting is blocked.`;
                warningArea.appendChild(div);
                addSection.style.display = 'none';
                return false;
            }
            return true;
        } catch (error) {
            showFeedback('Analysis failed. Proceeding without check.', true);
            return true;
        }
    }
    
    // --- Event Listeners ---
    addBtn.addEventListener('click', async () => {
        const { virusTotalApiKey } = await chrome.storage.sync.get('virusTotalApiKey');
        if (!virusTotalApiKey) {
            showFeedback('Please set your VirusTotal API key in the options page first.', true);
            return;
        }

        const isSafe = await checkVirusTotal(url.hostname, virusTotalApiKey);
        if (!isSafe) return;

        let expires = null;
        const duration = durationSelect.value;
        if (duration === 'hour') expires = Date.now() + 3600000;
        else if (duration === 'session') expires = 'session';
        
        const latestTabData = (await chrome.storage.session.get(tab.id.toString()))[tab.id] || {};
        const fingerprint = await chrome.runtime.sendMessage({ type: "GET_FINGERPRINT", domain: url.hostname });

        const newSite = {
            origin,
            expires,
            addedDate: Date.now(),
            lastAccessed: Date.now(),
            certificateFingerprint: fingerprint,
            contentHash: latestTabData.contentHash || null
        };
        
        const data = await chrome.storage.sync.get('whitelistedSites');
        const sites = data.whitelistedSites || [];
        sites.push(newSite);
        await chrome.storage.sync.set({ whitelistedSites: sites });

        showFeedback('✅ Analyzed and added to Whitelist!');
        setTimeout(() => chrome.tabs.reload(tab.id), 1500);
    });

    removeBtn.addEventListener('click', async () => {
        const data = await chrome.storage.sync.get('whitelistedSites');
        const updatedSites = data.whitelistedSites.filter(site => site.origin !== origin);
        await chrome.storage.sync.set({ whitelistedSites: updatedSites });
        showFeedback('❌ Removed from Whitelist!');
        setTimeout(() => window.close(), 1000);
    });

    manageBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());

    function showFeedback(message, isError = false) {
        feedbackArea.textContent = message;
        feedbackArea.style.color = isError ? 'var(--danger)' : 'var(--primary)';
        if (isError) {
             addBtn.disabled = false;
             addBtn.textContent = 'Add to Whitelist';
        }
    }
});
