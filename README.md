# TrueSafe - The Intelligent Security Whitelist

<p align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/b24bb0da-c870-43cf-be72-a043ed444857" alt="TrueSafe Logo" width="150">
</p>

<h3 align="center">An advanced browser extension for intelligently managing security warnings, giving you peace of mind while Browse the web.</h3>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-6.0.0-blue.svg?cacheSeconds=2592000" />
  <img alt="Browsers" src="https://img.shields.io/badge/browsers-chrome%20%7C%20firefox-green.svg" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

---

**TrueSafe** is not just another whitelist extension. It's a proactive security platform designed for power users, developers, and security-conscious individuals who need granular control over browser security warnings. It goes beyond simple whitelisting by providing multiple layers of intelligent diagnostics and security checks to help you make informed decisions.

<p align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/661a9ac5-6c7c-47a3-8646-e5c98d6333ea" alt="TrueSafe Demo Screenshot">
</p>

## ✨ Key Features

| Feature                       | Description                                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Advanced Diagnostics** | Automatically detects system time errors and potential network interference from firewalls or antivirus.  |
| **VirusTotal Integration** | Scans domains against 70+ security vendors before you whitelist them to prevent adding malicious sites.     |
| **Certificate Fingerprinting**| Monitors SSL certificate details and warns you if they change unexpectedly, protecting against hijacks.   |
| **WebAssembly Content Analysis**| A high-performance Rust-based module detects significant content changes on trusted pages.              |
| **Intelligent Whitelist Decay** | Proactively suggests removing old, unused sites from your whitelist to maintain security hygiene.         |
| **Deep SSL Analysis** | One-click, in-depth server security analysis powered by SSL Labs from the management page.                |
| **Flexible Whitelisting** | Whitelist sites permanently, for one hour, or for the current session.                                    |
| **Professional Management** | A clean interface to search, manage, import, and export your whitelist.                                   |

---

##  browsers/supported-browsers.md
| Browser | Supported |
| --- | :---: |
| <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png" alt="Chrome" width="24" height="24" /> [**Google Chrome**](https://www.google.com/chrome/) | **Yes** |
| <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png" alt="Firefox" width="24" height="24" /> [**Mozilla Firefox**](https://www.mozilla.org/firefox/) | **Yes** |

---

## ⚙️ Installation

To install TrueSafe locally from this repository:

1.  Download or clone the repository:
    `git clone https://github.com/YourUsername/TrueSafe-Extension.git`
2.  Navigate to your browser's extension management page:
    -   Chrome: `chrome://extensions`
    -   Firefox: `about:debugging#/runtime/this-firefox`
3.  Enable "Developer mode" (for Chrome) or "Enable add-on debugging" (for Firefox).
4.  Load the extension:
    -   **For Chrome:** Click **"Load unpacked"** and select the `TrueSafe-Extension/chrome` folder.
    -   **For Firefox:** Click **"Load Temporary Add-on..."** and select the `manifest.json` file inside the `TrueSafe-Extension/firefox` folder.
5.  Navigate to the extension's options page and add your [VirusTotal API key](https://www.virustotal.com/) to enable all security features.

---

## 📂 Project Structure

This repository is structured to support multiple browsers from a shared core logic.

---

## 🦀 WebAssembly Module

The high-performance content analyzer is written in Rust and compiled to WebAssembly. If you wish to modify its logic, you'll need to have the [Rust toolchain](https://rustup.rs/) and [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/) installed.

To re-compile the module, navigate to the `/wasm-hasher` directory and run:
`wasm-pack build --target web`

Then, copy the generated files from `/wasm-hasher/pkg` into both the `/chrome` and `/firefox` directories.

---

## ❤️ Support The Developer

If you find TrueSafe useful and want to support its development, you can make a donation using the following cryptocurrency addresses:

-   **Bitcoin (BTC):** `bc1q...`
-   **Ethereum (ETH):** `0x...`
-   **Monero (XMR):** `4...`

Your support is greatly appreciated and helps keep the project alive and updated!

---

<p align="center">
  Created with ❤️ by GeekNeuron
</p>
