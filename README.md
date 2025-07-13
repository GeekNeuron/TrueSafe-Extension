# TrueSafe Extension

**TrueSafe** is a professional browser extension designed to help you safely manage security warnings for trusted websites. It offers advanced features like temporary whitelisting, wildcard support, and a modern, user-friendly interface to give you full control.

This repository (`TrueSafe-Extension`) contains the complete source code for the Chrome extension.

## Features

-   **Modern UI/UX:** A clean, engaging, and easy-to-use interface.
-   **Whitelist Management:** A dedicated page to view, search, and manage your trusted sites.
-   **Temporary Access:** Whitelist sites permanently, for one hour, or for the current session.
-   **Intelligent Security:**
    -   **Certificate Fingerprinting:** Warns if a site's SSL certificate details change unexpectedly.
    -   **VirusTotal Integration:** Scans sites for threats before you whitelist them.
    -   **Content Analyzer (Wasm):** Detects significant content changes on whitelisted pages.
    -   **Whitelist Decay:** Suggests removing unused sites to maintain security hygiene.
-   **Import/Export:** Easily back up and restore your whitelist.

## Installation

1.  Download or clone this repository.
2.  (Optional) If you wish to re-compile the WebAssembly module, install Rust and `wasm-pack`, then run `wasm-pack build --target web` inside the `wasm-hasher` directory.
3.  Open Chrome and navigate to `chrome://extensions`.
4.  Enable "Developer mode".
5.  Click "Load unpacked" and select the `TrueSafe-Extension` directory.
6.  Go to the extension's options page to add your VirusTotal API key.
