document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    const whitelistList = document.getElementById('whitelist-list');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const exportBtn = document.getElementById('export-btn');

    let allSites = [];

    const renderList = (sites) => {
        whitelistList.innerHTML = '';
        if (sites.length === 0) {
            whitelistList.innerHTML = '<li>Your whitelist is empty.</li>';
            return;
        }
        sites.forEach((site, index) => {
            const li = document.createElement('li');
            li.className = 'list-item';
            
            let status = 'Permanent';
            if (site.expires && site.expires !== 'session') {
                const expiryDate = new Date(site.expires);
                if (expiryDate < new Date()) status = 'Expired';
                else status = `Expires: ${expiryDate.toLocaleString()}`;
            } else if (site.expires === 'session') {
                status = 'For this session';
            }

            li.innerHTML = `
                <div>
                    <div class="origin">${site.origin}</div>
                    <div class="status">${status}</div>
                </div>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            whitelistList.appendChild(li);
        });
    };

    const loadSites = async () => {
        const data = await chrome.storage.sync.get('whitelistedSites');
        allSites = data.whitelistedSites || [];
        renderList(allSites);
    };

    // Event Listeners
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredSites = allSites.filter(site => site.origin.toLowerCase().includes(query));
        renderList(filteredSites);
    });

    whitelistList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const indexToRemove = parseInt(e.target.dataset.index, 10);
            allSites.splice(indexToRemove, 1);
            await chrome.storage.sync.set({ whitelistedSites: allSites });
            loadSites();
        }
    });

    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(allSites, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: 'safepassage_whitelist.json'
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
                // Basic validation
                if (Array.isArray(importedSites)) {
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

    loadSites();
});
