# Township Canada Google Sheets Add-On

Convert Canadian legal land descriptions (DLS, NTS, Geographic Townships) to GPS coordinates directly in Google Sheets.

## Features

- **Custom functions**: Use `=TOWNSHIP_CANADA("NW-25-24-1-W5")` in any cell to get coordinates
- **Batch conversion**: Convert entire columns via the sidebar UI
- **All survey systems**: DLS (AB, SK, MB), NTS (BC), Geographic Townships (ON), River Lots, UWI, FPS Grid
- **Caching**: Results are cached for 6 hours to reduce redundant API calls
- **Freemium**: Free trial key available; unlimited access with a paid API key

## Custom Functions

| Function | Returns | Example |
| --- | --- | --- |
| `=TOWNSHIP_CANADA(cell)` | "lat, lng" string | `=TOWNSHIP_CANADA("NW-25-24-1-W5")` -> "52.123456, -114.654321" |
| `=TOWNSHIP_CANADA_LAT(cell)` | Latitude number | `=TOWNSHIP_CANADA_LAT("NW-25-24-1-W5")` -> 52.123456 |
| `=TOWNSHIP_CANADA_LNG(cell)` | Longitude number | `=TOWNSHIP_CANADA_LNG("NW-25-24-1-W5")` -> -114.654321 |
| `=TOWNSHIP_CANADA_PROVINCE(cell)` | Province name | `=TOWNSHIP_CANADA_PROVINCE("NW-25-24-1-W5")` -> "Alberta" |

## API Endpoints

The add-on communicates with the Township Canada API. The base URL depends on the key type:

- **Trial keys** (`tc_trial_*`): `https://townshipcanada.com/api/integrations/trial`
- **Paid keys** (`tc_*`): `https://developer.townshipcanada.com`

| Endpoint | Method | Description |
| --- | --- | --- |
| `/search/legal-location?location={query}` | GET | Convert a single legal land description |
| `/batch/legal-location` | POST | Convert a batch of legal land descriptions (JSON array body) |
| `/usage` | GET | Check trial key usage (trial keys only) |

Authentication is via the `X-API-Key` header.

## Development Setup

### Prerequisites

- Node.js 18+
- [clasp](https://github.com/google/clasp) CLI for Google Apps Script

### Initial Setup

1. Install clasp globally:

   ```bash
   npm install -g @google/clasp
   ```

2. Login to Google:

   ```bash
   clasp login
   ```

3. Copy `.clasp.json.example` to `.clasp.json` and fill in your script/spreadsheet IDs, or create a new project:

   ```bash
   clasp create --type sheets --title "Township Canada"
   ```

4. Push the source code:

   ```bash
   npm run push
   ```

5. Open the script in the Apps Script editor:

   ```bash
   npm run open
   ```

### Development Workflow

```bash
# Watch for changes and auto-push
npm run watch

# Push manually
npm run push

# View logs
npm run logs
```

### Testing

1. Open a Google Sheet linked to the Apps Script project
2. Test custom functions: type `=TOWNSHIP_CANADA("NW-25-24-1-W5")` in a cell
3. Test sidebar: Extensions > Township Canada > Open sidebar
4. Test batch: Select cells with LLDs, then Extensions > Township Canada > Convert selected cells

## OAuth Scopes

The add-on requests minimal permissions:

- `spreadsheets.currentonly` - Read/write the current spreadsheet only
- `script.container.ui` - Show sidebar and dialogs
- `script.external_request` - Call the Township Canada API

## License

See [LICENSE](LICENSE).
