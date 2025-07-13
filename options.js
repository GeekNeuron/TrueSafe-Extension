document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    const whitelistGrid = document.getElementById('whitelist-grid');
    const emptyState = document.getElementById('empty-state');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const exportBtn = document.getElementById('export-btn');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const vtApiKeyInput = document.getElementById('vt-api-key');

    let allSites = [];

    const renderList = (sites) => {
        whitelistGrid.innerHTML = '';
        if (sites.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';

        sites.forEach((site) => {
            const card = document.createElement('div');
            card.className = 'card';
            
            let statusText = 'Permanent';
            let statusClass = 'permanent';
            if (site.expires) {
                if (site.expires === 'session') {
                    statusText = 'Session';
                    statusClass = 'session';
                } else {
                    const expiryDate = new Date(site.expires);
                    if (expiryDate < new Date()) {
                        statusText = 'Expired';
                        statusClass = 'expired';
                    } else {
                        statusText = `Expires ${expiryDate.toLocaleDateString()}`;
                        statusClass = 'expires';
                    }
                }
            }
            
            const lastAccessedText = site.lastAccessed ? `Last Accessed: ${new Date(site.lastAccessed).toLocaleDateString()}` : 'Never';

            card.innerHTML = `
                <div class="card-header">
                    <span class="origin">${site.origin}</span>
                </div>
                <div class="card-body">
                    <div class="status ${statusClass}">${statusText}</div>
                    <div class="metadata">${lastAccessedText}</div>
                </div>
                <div class="card-actions">
                    <button class="action-btn analyze-ssl-btn" data-domain="${new URL(site.origin).hostname}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                        Analyze SSL
                    </button>
                    <button class="delete-btn" data-origin="${site.origin}" title="Remove">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                    </button>
                </div>
            `;
            whitelistGrid.appendChild(card);
        });
    };

    const loadSites = async () => {
        const data = await chrome.storage.sync.get('whitelistedSites');
        allSites = data.whitelistedSites || [];
        renderList(allSites);
    };

    // --- Event Listeners ---
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredSites = allSites.filter(site => site.origin.toLowerCase().includes(query));
        renderList(filteredSites);
    });

    whitelistGrid.addEventListener('click', async (e) => {
        const deleteButton = e.target.closest('.delete-btn');
        const analyzeButton = e.target.closest('.analyze-ssl-btn');

        if (deleteButton) {
            const originToRemove = deleteButton.dataset.origin;
            allSites = allSites.filter(site => site.origin !== originToRemove);
            await chrome.storage.sync.set({ whitelistedSites: allSites });
            loadSites();
        }

        if (analyzeButton) {
            const domain = analyzeButton.dataset.domain;
            const analysisUrl = `https://www.ssllabs.com/ssltest/analyze.html?d=${domain}&hideResults=on`;
            chrome.tabs.create({ url: analysisUrl });
        }
    });

    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(allSites, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: 'truesafe_whitelist.json',
            saveAs: true
        });
    });

    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const importedSites = JSON.parse(event.target.result);
                if (Array.isArray(importedSites)) { // Basic validation
                    await chrome.storage.sync.set({ whitelistedSites: importedSites });
                    loadSites();
                    alert('Whitelist imported successfully!');
                } else {
                    alert('Invalid file format.');
                }
            } catch (error) {
                alert('Error reading or parsing file.');
            }
        };
        reader.readAsText(file);
    });
    
    // API Key Logic
    chrome.storage.sync.get('virusTotalApiKey', (data) => {
        if (data.virusTotalApiKey) {
            vtApiKeyInput.value = data.virusTotalApiKey;
        }
    });

    saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = vtApiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({ virusTotalApiKey: apiKey }, () => {
                saveApiKeyBtn.textContent = 'Saved!';
                setTimeout(() => { saveApiKeyBtn.textContent = 'Save'; }, 2000);
            });
        }
    });

    loadSites();
});
