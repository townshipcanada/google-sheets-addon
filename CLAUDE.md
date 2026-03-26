# Township Canada Google Sheets Add-On

Google Sheets add-on that converts Canadian legal land descriptions (DLS, NTS, Geographic Townships) to GPS coordinates.

## Tech Stack

- **Google Apps Script** (V8 runtime)
- **clasp** for local development and deployment
- No build step — `.gs` and `.html` files are pushed directly via `clasp push`

## Project Structure

- `src/Api.gs` — API client (calls townshipcanada.com endpoints)
- `src/Config.gs` — Configuration constants (API URLs, cache TTL)
- `src/CustomFunctions.gs` — Sheet functions: `TOWNSHIP_CANADA()`, `_LAT()`, `_LNG()`, `_PROVINCE()`
- `src/SampleData.gs` — 100 hardcoded DLS sample values for offline demo (no API key needed)
- `src/Cards.gs` — Card-based UI for the add-on homepage
- `src/Menu.gs` — Menu and sidebar triggers
- `src/Sidebar.html` — Sidebar UI for batch conversion
- `src/Settings.html` — Settings/API key management UI
- `appsscript.json` — Manifest (scopes, triggers, whitelist)

## API Integration

- Trial keys (`tc_trial_*`) → `https://townshipcanada.com/api/integrations/trial`
- Paid keys (`tc_*`) → `https://developer.townshipcanada.com`
- Auth via `X-API-Key` header
- Results cached 6 hours via CacheService
- 100 sample DLS values work offline without any API key (AB, SK, MB across W1–W6 meridians)

## Development

```bash
npm run push    # Push to Apps Script
npm run watch   # Watch + auto-push
npm run logs    # View execution logs
```

## Conventions

- All source files use `.gs` extension (Google Apps Script)
- HTML files contain inline CSS/JS (Apps Script limitation)
- No module system — all functions are global
- Keep OAuth scopes minimal (`spreadsheets.currentonly`, `script.container.ui`, `script.external_request`)
