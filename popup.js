document.addEventListener('DOMContentLoaded', () => {
    const whitelistBtn = document.getElementById('whitelist-btn');
    const pageInfo = document.getElementById('page-info');
    const userIssueNotice = document.getElementById('user-issue-notice');

    let currentOrigin = '';

    // Function to check if the user's system clock is correct
    async function checkSystemClock() {
        try {
            const response = await fetch('https://worldtimeapi.org/api/ip');
            const data = await response.json();
            const serverTime = new Date(data.utc_datetime).getTime();
            const localTime = Date.now();
            // If time difference is more than 3 minutes (180,000 ms), show warning
            if (Math.abs(serverTime - localTime) > 180000) {
                userIssueNotice.style.display = 'block';
            }
        } catch (e) {
            console.info("Could not check system time.");
        }
    }

    // Get current tab URL and update the UI
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
            try {
                const url = new URL(tabs[0].url);
                if (url.protocol === 'http:' || url.protocol === 'https:') {
                    currentOrigin = url.origin;
                    pageInfo.textContent = `Site: ${currentOrigin}`;
                    whitelistBtn.disabled = false;
                } else {
                    pageInfo.textContent = 'This page type cannot be whitelisted.';
                }
            } catch (error) {
                pageInfo.textContent = 'Not a valid web page URL.';
            }
        }
    });

    // Handle whitelist button click
    whitelistBtn.addEventListener('click', () => {
        chrome.storage.sync.get({ whitelistedSites: [] }, (data) => {
            const sites = new Set(data.whitelistedSites);
            if (!sites.has(currentOrigin)) {
                sites.add(currentOrigin);
                chrome.storage.sync.set({ whitelistedSites: Array.from(sites) }, () => {
                    whitelistBtn.textContent = 'Added to Whitelist!';
                    whitelistBtn.disabled = true;
                    // Reload the page to attempt bypass
                    chrome.tabs.reload({ bypassCache: true });
                });
            }
        });
    });

    checkSystemClock();
});
