# Google Workspace Marketplace Listing

## App Name

Township Canada - Legal Land Description Converter

## Short Description (140 chars)

Convert Canadian legal land descriptions (DLS, NTS, Township) to GPS coordinates directly in Google Sheets.

## Detailed Description

Township Canada converts Canadian legal land descriptions to GPS coordinates directly in your Google Sheets spreadsheet. No copy-pasting from web tools, no manual lookups.

**Custom spreadsheet functions:**

Use =TOWNSHIP_CANADA("NW-25-24-1-W5") in any cell to get latitude and longitude instantly. Separate functions for latitude only (=TOWNSHIP_CANADA_LAT), longitude only (=TOWNSHIP_CANADA_LNG), and province (=TOWNSHIP_CANADA_PROVINCE).

**Batch conversion sidebar:**

Select a column of legal land descriptions and convert them all at once. Results appear in adjacent columns with latitude, longitude, and province. Handles hundreds of descriptions in seconds.

**All Canadian survey systems supported:**

- DLS (Dominion Land Survey) - Alberta, Saskatchewan, Manitoba
- NTS (National Topographic System) - British Columbia
- Geographic Townships - Ontario
- River Lots, UWI (Unique Well Identifiers), FPS Grid

**Free to start:**

Get a free trial key (100 calls, 7 days). Connect your Township Canada API key for unlimited access.

**Who uses Township Canada:**

Landmen, geologists, agronomists, insurance adjusters, real estate professionals, surveyors, and anyone who works with Canadian legal land descriptions in spreadsheets.

## Category

Productivity

## Supported Regions

Canada (also available globally)

## Languages

English

## Pricing

Freemium - free trial key (100 calls, 7 days), paid API key for unlimited

## Screenshots Required

1. Custom function in action (=TOWNSHIP_CANADA formula in a cell with result)
2. Sidebar batch conversion UI
3. Results written to adjacent columns after batch conversion
4. Settings dialog with API key connection

## Privacy Policy URL

https://townshipcanada.com/privacy

## Terms of Service URL

https://townshipcanada.com/terms

## Support URL

https://townshipcanada.com/support

## OAuth Scopes Justification

- spreadsheets.currentonly: Required to read legal land descriptions from cells and write conversion results (coordinates) back to the spreadsheet.
- script.container.ui: Required to display the batch conversion sidebar and API key settings dialog.
- script.external_request: Required to call the Township Canada API for land description conversions.

## Trademark Attribution

Google Sheets is a trademark of Google LLC.
