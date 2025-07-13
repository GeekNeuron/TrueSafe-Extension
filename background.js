chrome.webNavigation.onErrorOccurred.addListener((details) => {
    // A list of common SSL/TLS related errors
    const bypassableErrors = [
        'net::ERR_CERT_AUTHORITY_INVALID',
        'net::ERR_CERT_COMMON_NAME_INVALID',
        'net::ERR_CERT_DATE_INVALID',
        'net::ERR_SSL_PROTOCOL_ERROR',
        'net::ERR_INSECURE_RESPONSE'
    ];

    if (bypassableErrors.includes(details.error) && details.frameId === 0) {
        const url = new URL(details.url);
        const origin = url.origin;

        chrome.storage.sync.get({ whitelistedSites: [] }, (data) => {
            if (data.whitelistedSites.includes(origin)) {
                // In Manifest V3, we cannot directly bypass the error page.
                // The most we can do is reload, which gives the user a chance
                // to click "proceed" on the error page they are familiar with.
                // This acts as a confirmation that they have previously trusted this site.
                chrome.tabs.update(details.tabId, { url: details.url });
            }
        });
    }
}, { urls: ["<all_urls>"] });
