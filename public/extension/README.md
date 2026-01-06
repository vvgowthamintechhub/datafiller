# Excellent Data Filler - Chrome Extension

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select this extracted folder
5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon to open the popup
2. Toggle the extension ON (blue) or OFF (red)
3. Click "Open Configuration" to open the web app and configure your sites
4. Navigate to a configured website
5. Click "Run Auto-Fill" to fill the form

## Configuration

The web app (running at http://localhost:3000) allows you to:
- Add and configure sites with URL patterns
- Set up form fields with selectors
- Upload Excel data for form filling
- Map Excel columns to form fields

## Extension States

- **ON (Blue toggle)**: Extension is active and will auto-detect configured sites
- **OFF (Red toggle)**: Extension is disabled and won't interact with any site

## Files

- `manifest.json` - Extension configuration
- `popup.html/js` - Extension popup UI with ON/OFF toggle
- `background.js` - Background service worker
- `content.js` - Content script for form interaction

## Icons

The icons/ folder contains the extension icons (icon16.png, icon48.png, icon128.png).

## Changing the App URL

By default, the extension opens `http://localhost:3000`. To change this:
1. Edit `popup.js`
2. Change the `APP_URL` constant at the top of the file
