// Country Flag Emoji Polyfill for Windows Chromium browsers
// Based on country-flag-emoji-polyfill library by TalkJS

/**
 * Polyfill to add country flag emoji support to Chromium browsers on Windows
 * @returns {boolean} True if polyfill was applied, false otherwise
 */
function polyfillCountryFlagEmojis() {
  // Check if we need the polyfill
  if (!needsPolyfill()) {
    console.log('Flag emoji polyfill not needed - browser has native support');
    return false;
  }

  console.log('Applying flag emoji polyfill for Windows Chromium browser');

  // Inject the Twemoji Country Flags font
  injectFlagFont();

  return true;
}

/**
 * Detect if the browser needs flag emoji polyfill
 * @returns {boolean} True if polyfill is needed
 */
function needsPolyfill() {
  // Check if running on Windows
  const isWindows = navigator.platform.toLowerCase().includes('win');

  // Check if Chromium-based (Edge, Chrome, etc.)
  const isChromium = /Chrome|Chromium|Edge/.test(navigator.userAgent);

  // Firefox and Safari have native flag emoji support
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  const isSafari = navigator.userAgent.toLowerCase().includes('safari') &&
                   !navigator.userAgent.toLowerCase().includes('chrome');

  // Only apply polyfill on Windows Chromium browsers
  return isWindows && isChromium && !isFirefox && !isSafari;
}

/**
 * Inject the Twemoji Country Flags font CSS
 */
function injectFlagFont() {
  // Check if already injected
  if (document.getElementById('twemoji-country-flags-polyfill')) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'twemoji-country-flags-polyfill';
  styleElement.textContent = `
    @font-face {
      font-family: 'Twemoji Country Flags';
      src: url('https://cdn.jsdelivr.net/npm/country-flag-emoji-polyfill@0.1/dist/TwemojiCountryFlags.woff2') format('woff2');
      font-display: swap;
      unicode-range: U+1F1E6-1F1FF;
    }
  `;

  // Insert into head
  document.head.appendChild(styleElement);

  console.log('✓ Twemoji Country Flags font injected');
}

/**
 * Apply flag font to specific element
 * @param {HTMLElement} element - Element to apply flag font to
 */
function applyFlagFont(element) {
  if (!element) return;

  const currentFontFamily = getComputedStyle(element).fontFamily;

  // Only add if not already present
  if (!currentFontFamily.includes('Twemoji Country Flags')) {
    element.style.fontFamily = `"Twemoji Country Flags", ${currentFontFamily}`;
  }
}

// Auto-initialize if this script is loaded directly
if (typeof window !== 'undefined' && document.readyState !== 'loading') {
  polyfillCountryFlagEmojis();
} else if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', polyfillCountryFlagEmojis);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { polyfillCountryFlagEmojis, applyFlagFont };
}