// This script checks for the presence of a password field on the page.
if (document.querySelector('input[type="password"]')) {
  chrome.runtime.sendMessage({ type: "PASSWORD_FIELD_DETECTED" });
}
