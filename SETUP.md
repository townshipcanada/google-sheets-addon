# Township Canada Google Sheets Add-On

Convert Canadian legal land descriptions (DLS, NTS, Geographic Townships) to GPS coordinates directly in Google Sheets.

## Features

- **Custom functions**: `=TOWNSHIP("NW-25-24-1-W5")` returns lat/lng in any cell
- **Batch conversion**: Convert entire columns via the sidebar UI
- **Freemium model**: 10 free conversions/month, unlimited with API key
- **All survey systems**: DLS (AB, SK, MB), NTS (BC), Geographic Townships (ON), River Lots, UWI

## Custom Functions

| Function                   | Returns           | Example                                                 |
| -------------------------- | ----------------- | ------------------------------------------------------- |
| `=TOWNSHIP(cell)`          | "lat, lng" string | `=TOWNSHIP("NW-25-24-1-W5")` → "52.123456, -114.654321" |
| `=TOWNSHIP_LAT(cell)`      | Latitude number   | `=TOWNSHIP_LAT("NW-25-24-1-W5")` → 52.123456            |
| `=TOWNSHIP_LNG(cell)`      | Longitude number  | `=TOWNSHIP_LNG("NW-25-24-1-W5")` → -114.654321          |
| `=TOWNSHIP_PROVINCE(cell)` | Province name     | `=TOWNSHIP_PROVINCE("NW-25-24-1-W5")` → "Alberta"       |

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

3. Create a new Apps Script project:

   ```bash
   clasp create --type sheets --title "Township Canada"
   ```

   This updates `.clasp.json` with your new script ID.

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
2. Test custom functions: type `=TOWNSHIP("NW-25-24-1-W5")` in a cell
3. Test sidebar: Extensions > Township Canada > Open sidebar
4. Test batch: Select cells with LLDs, then Extensions > Township Canada > Convert selected cells

## Marketplace Submission

### Required Assets

- Icon: 128x128 PNG (use Township Canada logo)
- Screenshots: At least 3 showing custom functions, sidebar, and results
- Demo video: 1-2 minutes showing the workflow

### OAuth Scopes

The add-on requests minimal permissions:

- `spreadsheets.currentonly` - Read/write the current spreadsheet only
- `script.container.ui` - Show sidebar and dialogs

### Environment Variables

The add-on calls the Township Canada API at:

- `POST /api/integrations/sheets/convert` - Single conversion
- `POST /api/integrations/sheets/convert-batch` - Batch conversion
- `GET /api/integrations/sheets/usage` - Usage check

No environment variables needed on the Apps Script side. API key is stored in the user's Google PropertiesService.

## Server-Side Endpoints

The following endpoints in the main Township Canada app support this add-on:

| Endpoint                                 | Method | Description           |
| ---------------------------------------- | ------ | --------------------- |
| `/api/integrations/sheets/convert`       | POST   | Convert single LLD    |
| `/api/integrations/sheets/convert-batch` | POST   | Convert batch of LLDs |
| `/api/integrations/sheets/usage`         | GET    | Check usage/limits    |

### Headers

- `X-Installation-Id`: Unique installation identifier (required for free tier)
- `X-API-Key`: Township Canada API key (optional, for unlimited access)

### Database

Migration `027_sheets_addon_usage.sql` creates the `app.sheets_addon_usage` table for tracking free tier usage per installation.
