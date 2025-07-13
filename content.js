const MAX_TEXT_LENGTH = 20000;

if (document.body && document.body.innerText) {
    const pageText = document.body.innerText.substring(0, MAX_TEXT_LENGTH);
    chrome.runtime.sendMessage({ type: "PAGE_CONTENT_FOR_HASHING", text: pageText });
}

if (document.querySelector('input[type="password"]')) {
  chrome.runtime.sendMessage({ type: "PASSWORD_FIELD_DETECTED" });
}
