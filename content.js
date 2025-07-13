const MAX_TEXT_LENGTH = 20000; // Limit text size for performance

// Use a timeout to ensure the body is fully loaded
setTimeout(() => {
    if (document.body && document.body.innerText) {
        const pageText = document.body.innerText.substring(0, MAX_TEXT_LENGTH);
        chrome.runtime.sendMessage({ type: "PAGE_CONTENT_FOR_HASHING", text: pageText });
    }
}, 500);


if (document.querySelector('input[type="password"]')) {
  chrome.runtime.sendMessage({ type: "PASSWORD_FIELD_DETECTED" });
}
