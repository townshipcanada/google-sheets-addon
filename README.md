# Township Canada Google Sheets Add-On

Convert Canadian legal land descriptions (DLS, NTS, Geographic Townships) to GPS coordinates directly in Google Sheets.

## Features

- **Custom functions**: Use `=TOWNSHIP_CANADA("NW-25-24-1-W5")` in any cell to get coordinates
- **Batch conversion**: Convert entire columns via the sidebar UI
- **All survey systems**: DLS (AB, SK, MB), NTS (BC), Geographic Townships (ON), River Lots, UWI, FPS Grid
- **Caching**: Results are cached for 6 hours to reduce redundant API calls
- **Try offline**: 100 built-in sample DLS locations work instantly without an API key
- **API access**: Connect your Township Canada API key for full access

## Custom Functions

| Function | Returns | Example |
| --- | --- | --- |
| `=TOWNSHIP_CANADA(cell)` | "lat, lng" string | `=TOWNSHIP_CANADA("NW-25-24-1-W5")` -> "52.123456, -114.654321" |
| `=TOWNSHIP_CANADA_LAT(cell)` | Latitude number | `=TOWNSHIP_CANADA_LAT("NW-25-24-1-W5")` -> 52.123456 |
| `=TOWNSHIP_CANADA_LNG(cell)` | Longitude number | `=TOWNSHIP_CANADA_LNG("NW-25-24-1-W5")` -> -114.654321 |
| `=TOWNSHIP_CANADA_PROVINCE(cell)` | Province name | `=TOWNSHIP_CANADA_PROVINCE("NW-25-24-1-W5")` -> "Alberta" |

## Sample Data (No API Key Required)

The add-on includes 100 hardcoded DLS locations across Alberta, Saskatchewan, and Manitoba (W1–W6 meridians) in both quarter-section and LSD formats. These work instantly without an API key so you can try the add-on right away.

For example, try `=TOWNSHIP_CANADA("NW-25-24-1-W5")` — no setup needed.

To convert any legal land description beyond the sample set, get an API key at [townshipcanada.com/pricing](https://townshipcanada.com/pricing#api).

## API Endpoints

The add-on communicates with the Township Canada API at `https://townshipcanada.com/api`.

| Endpoint | Method | Description |
| --- | --- | --- |
| `/search/legal-location?location={query}` | GET | Convert a single legal land description |
| `/batch/legal-location` | POST | Convert a batch of legal land descriptions (JSON array body) |

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
