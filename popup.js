// Popup script for extension toggle and country selection
const TOGGLE_KEY = 'extension_enabled';
const HIDDEN_COUNTRIES_KEY = 'hidden_countries';
const DEFAULT_ENABLED = true;
const DEFAULT_HIDDEN_COUNTRIES = []; // No countries selected by default

// Get UI elements
const toggleSwitch = document.getElementById('toggleSwitch');
const status = document.getElementById('status');
const countryDropdownTrigger = document.getElementById('countryDropdownTrigger');
const dropdownContent = document.getElementById('dropdownContent');
const dropdownArrow = document.getElementById('dropdownArrow');
const dropdownText = document.getElementById('dropdownText');
const selectedCountriesDiv = document.getElementById('selectedCountries');
const countrySearch = document.getElementById('countrySearch');
const countriesList = document.getElementById('countriesList');

let selectedCountries = [];
let isDropdownOpen = false;
let allCountries = [];

// Initialize popup
async function initializePopup() {
  // Load current state
  const result = await chrome.storage.local.get([TOGGLE_KEY, HIDDEN_COUNTRIES_KEY]);
  const isEnabled = result[TOGGLE_KEY] !== undefined ? result[TOGGLE_KEY] : DEFAULT_ENABLED;
  selectedCountries = result[HIDDEN_COUNTRIES_KEY] || DEFAULT_HIDDEN_COUNTRIES;

  updateToggle(isEnabled);
  populateCountryDropdown();
  updateSelectedCountriesDisplay();
}

// Populate country dropdown with options
function populateCountryDropdown() {
  if (!COUNTRY_FLAGS) {
    console.error('COUNTRY_FLAGS not loaded');
    return;
  }

  // Store all countries for search
  allCountries = Object.keys(COUNTRY_FLAGS).sort();

  // Setup search functionality
  setupSearchHandlers();

  // Render all countries initially
  renderCountries(allCountries);
}

// Setup search event handlers
function setupSearchHandlers() {
  // Clear search when dropdown opens
  countryDropdownTrigger.addEventListener('click', () => {
    setTimeout(() => {
      if (isDropdownOpen) {
        countrySearch.value = '';
        countrySearch.focus();
        renderCountries(allCountries);
      }
    }, 100);
  });

  // Search as user types
  countrySearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === '') {
      renderCountries(allCountries);
    } else {
      const filteredCountries = allCountries.filter(country =>
        country.toLowerCase().includes(searchTerm)
      );
      renderCountries(filteredCountries);
    }
  });

  // Prevent dropdown from closing when clicking on search
  countrySearch.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// Render countries in the dropdown
function renderCountries(countries) {
  countriesList.innerHTML = '';

  if (countries.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'country-option';
    noResults.style.color = '#536471';
    noResults.style.fontStyle = 'italic';
    noResults.textContent = 'No countries found';
    countriesList.appendChild(noResults);
    return;
  }

  countries.forEach(countryName => {
    const flag = COUNTRY_FLAGS[countryName];

    const option = document.createElement('div');
    option.className = 'country-option';
    option.setAttribute('data-country', countryName);

    const isSelected = selectedCountries.includes(countryName);

    option.innerHTML = `
      <input type="checkbox" class="country-checkbox" ${isSelected ? 'checked' : ''}>
      <span class="country-flag">${flag}</span>
      <span class="country-name">${countryName}</span>
    `;

    // Add click handler
    option.addEventListener('click', (e) => {
      const checkbox = option.querySelector('.country-checkbox');

      // Toggle if clicked on the option itself (not the checkbox)
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }

      toggleCountrySelection(countryName, checkbox.checked);
    });

    countriesList.appendChild(option);
  });
}

// Toggle country selection
async function toggleCountrySelection(countryName, isSelected) {
  if (isSelected) {
    if (!selectedCountries.includes(countryName)) {
      selectedCountries.push(countryName);
    }
  } else {
    selectedCountries = selectedCountries.filter(c => c !== countryName);
  }

  // Save to storage
  await chrome.storage.local.set({ [HIDDEN_COUNTRIES_KEY]: selectedCountries });

  // Update UI
  updateSelectedCountriesDisplay();

  // Re-render dropdown to update checkboxes
  const currentSearch = countrySearch.value.toLowerCase().trim();
  if (currentSearch === '') {
    renderCountries(allCountries);
  } else {
    const filteredCountries = allCountries.filter(country =>
      country.toLowerCase().includes(currentSearch)
    );
    renderCountries(filteredCountries);
  }

  // Notify content script
  notifyContentScriptCountryChange();
}

// Update selected countries display
function updateSelectedCountriesDisplay() {
  if (selectedCountries.length === 0) {
    selectedCountriesDiv.className = 'selected-countries empty';
    selectedCountriesDiv.textContent = 'No countries selected';
    dropdownText.textContent = 'Select countries to hide...';
  } else {
    selectedCountriesDiv.className = 'selected-countries';

    // Create chip elements with X buttons
    selectedCountriesDiv.innerHTML = selectedCountries.map(country => {
      const flag = COUNTRY_FLAGS[country];
      return `
        <div class="country-chip" data-country="${country}">
          <div class="chip-content">
            <span class="chip-flag">${flag}</span>
            <span class="chip-name">${country}</span>
          </div>
          <button class="chip-remove" title="Remove ${country}">×</button>
        </div>
      `;
    }).join('');

    // Add click handlers for X buttons
    selectedCountriesDiv.querySelectorAll('.chip-remove').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const chip = button.closest('.country-chip');
        const countryName = chip.getAttribute('data-country');

        // Remove the country
        removeCountry(countryName);
      });
    });

    // Update dropdown trigger text
    dropdownText.textContent = `${selectedCountries.length} country${selectedCountries.length === 1 ? '' : 's'} selected`;
  }
}

// Remove a country from selection
async function removeCountry(countryName) {
  selectedCountries = selectedCountries.filter(c => c !== countryName);

  // Save to storage
  await chrome.storage.local.set({ [HIDDEN_COUNTRIES_KEY]: selectedCountries });

  // Update UI
  updateSelectedCountriesDisplay();

  // Re-render dropdown to update checkboxes
  const currentSearch = countrySearch.value.toLowerCase().trim();
  if (currentSearch === '') {
    renderCountries(allCountries);
  } else {
    const filteredCountries = allCountries.filter(country =>
      country.toLowerCase().includes(currentSearch)
    );
    renderCountries(filteredCountries);
  }

  // Notify content script
  notifyContentScriptCountryChange();
}

// Notify content script about country changes
function notifyContentScriptCountryChange() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'hiddenCountriesChanged',
        countries: selectedCountries
      }).catch(() => {
        // Tab might not have content script loaded yet, that's okay
      });
    }
  });
}

// Toggle click handler
toggleSwitch.addEventListener('click', () => {
  chrome.storage.local.get([TOGGLE_KEY], (result) => {
    const currentState = result[TOGGLE_KEY] !== undefined ? result[TOGGLE_KEY] : DEFAULT_ENABLED;
    const newState = !currentState;
    
    chrome.storage.local.set({ [TOGGLE_KEY]: newState }, () => {
      updateToggle(newState);
      
      // Notify content script to update
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'extensionToggle',
            enabled: newState
          }).catch(() => {
            // Tab might not have content script loaded yet, that's okay
          });
        }
      });
    });
  });
});

function updateToggle(isEnabled) {
  if (isEnabled) {
    toggleSwitch.classList.add('enabled');
    status.textContent = 'Extension is enabled';
    status.style.color = '#1d9bf0';
  } else {
    toggleSwitch.classList.remove('enabled');
    status.textContent = 'Extension is disabled';
    status.style.color = '#536471';
  }
}

// Dropdown toggle functionality
countryDropdownTrigger.addEventListener('click', () => {
  isDropdownOpen = !isDropdownOpen;

  if (isDropdownOpen) {
    dropdownContent.classList.add('open');
    dropdownArrow.classList.add('open');
  } else {
    dropdownContent.classList.remove('open');
    dropdownArrow.classList.remove('open');
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!countryDropdownTrigger.contains(e.target) && !dropdownContent.contains(e.target)) {
    isDropdownOpen = false;
    dropdownContent.classList.remove('open');
    dropdownArrow.classList.remove('open');
  }
});

// Prevent dropdown from closing when clicking inside dropdown content
dropdownContent.addEventListener('click', (e) => {
  e.stopPropagation();
});

// Initialize when popup loads
initializePopup();

