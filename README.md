# X/Twitter Country Block and Flag Chrome Extension

This has been cloned and built on top of [RhysSullivan-Twitter Account Location in Username](https://github.com/RhysSullivan/twitter-account-location-in-username)

X/Twitter Country Block and Flag Chrome Extension

A Chrome extension that hides the selected countries and displays country flag emojis next to Twitter/X usernames based on the account's location information.

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the directory containing this extension
6. The extension will now be active on Twitter/X pages

## How To Use

1. Click the extension icon.
2. Select the countries you want to filter out.
3. Refresh or open the X/Twitter and that's it!

<img width="230" height="240" alt="extension" src="https://github.com/user-attachments/assets/5e77eb76-b8c0-4db5-87ed-39d4f1f9e006" />

## How It Works

1. The extension runs a content script on all Twitter/X pages
2. It identifies username elements in tweets and user profiles
3. For each username, it queries Twitter's GraphQL API endpoint (`AboutAccountQuery`) to get the account's location
4. The location is mapped to a flag emoji using the country flags mapping
5. The flag emoji is displayed next to the username

## Features

- Automatically detects usernames on Twitter/X pages
- Automatically hides tweets from the accounts of selected countries.
- Queries Twitter's GraphQL API to get account location information
- Displays the corresponding country flag emoji next to usernames
- Works with dynamically loaded content (infinite scroll)
- Caches location data to minimize API calls

## Limitations

- Requires the user to be logged into Twitter/X
- Only works for accounts that have location information available
- Rate limiting may apply if making too many requests

## Privacy

- The extension only queries public account information
- No data is stored or transmitted to third-party servers
- All API requests are made directly to Twitter/X servers
- Location data is cached locally in memory

## Troubleshooting

If flags are not appearing:

1. Make sure you're logged into Twitter/X
2. Check the browser console for any error messages
3. Verify that the account has location information available
4. Try refreshing the page

## License

MIT
