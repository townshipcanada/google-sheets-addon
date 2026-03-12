/**
 * Township Canada Google Sheets Add-On - Menu & Triggers
 *
 * Sets up the add-on menu and handles lifecycle events.
 */

/**
 * Runs when the add-on is installed.
 * @param {object} e The event parameter.
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Runs when the spreadsheet is opened.
 * Creates the Township Canada menu.
 * @param {object} e The event parameter.
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem("Open sidebar", "showSidebar")
    .addSeparator()
    .addItem("Convert selected cells", "convertSelectedCells")
    .addItem("Convert column to coordinates", "convertColumnPrompt")
    .addSeparator()
    .addItem("Check usage", "showUsageDialog")
    .addItem("Settings", "showSettingsDialog")
    .addToUi();
}

/**
 * Homepage trigger for the add-on card.
 */
function onHomepage() {
  return createHomepageCard();
}

/**
 * Show the sidebar for batch operations.
 */
function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile("Sidebar")
    .setTitle("Township Canada")
    .setWidth(350);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Convert the currently selected cells in-place.
 * Reads LLDs from selected range, converts them, and writes lat/lng to adjacent columns.
 */
function convertSelectedCells() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getActiveRange();

  if (!range) {
    SpreadsheetApp.getUi().alert("Please select cells containing legal land descriptions.");
    return;
  }

  var values = range.getValues();
  var queries = [];

  // Collect non-empty values
  for (var i = 0; i < values.length; i++) {
    var val = String(values[i][0]).trim();
    if (val) {
      queries.push(val);
    }
  }

  if (queries.length === 0) {
    SpreadsheetApp.getUi().alert("No legal land descriptions found in the selected cells.");
    return;
  }

  try {
    var response = apiConvertBatch(queries);
    var results = response.data;

    // Write results to columns immediately right of selection
    var startRow = range.getRow();
    var startCol = range.getColumn() + range.getNumColumns();
    var resultIndex = 0;

    // Add headers if the cells above are empty
    if (startRow > 1) {
      var headerRow = startRow - 1;
      var existingHeaders = sheet.getRange(headerRow, startCol, 1, 3).getValues()[0];
      if (!existingHeaders[0] && !existingHeaders[1] && !existingHeaders[2]) {
        sheet.getRange(headerRow, startCol, 1, 3).setValues([["Latitude", "Longitude", "Province"]]);
        sheet.getRange(headerRow, startCol, 1, 3).setFontWeight("bold");
      }
    }

    for (var i = 0; i < values.length; i++) {
      var val = String(values[i][0]).trim();
      if (val && resultIndex < results.length) {
        var r = results[resultIndex];
        sheet.getRange(startRow + i, startCol, 1, 3).setValues([
          [r.latitude || "N/A", r.longitude || "N/A", r.province || "N/A"]
        ]);
        resultIndex++;
      }
    }

    var stats = response.statistics;
    SpreadsheetApp.getUi().alert(
      "Conversion complete!\n\n" +
      "Total: " + stats.total + "\n" +
      "Success: " + stats.success + "\n" +
      "Failed: " + stats.failure
    );
  } catch (e) {
    if (e.message === "FREE_LIMIT_REACHED") {
      SpreadsheetApp.getUi().alert(
        "Free monthly limit reached (10 conversions/month).\n\n" +
        "To continue, connect your Township Canada API key:\n" +
        "Township Canada menu > Settings\n\n" +
        "Get an API key at: https://townshipcanada.com/app/api"
      );
    } else {
      SpreadsheetApp.getUi().alert("Error: " + e.message);
    }
  }
}

/**
 * Prompt user to select a column for batch conversion.
 */
function convertColumnPrompt() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.prompt(
    "Convert Column",
    'Enter the column letter containing legal land descriptions (e.g., "A"):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) return;

  var colLetter = response.getResponseText().trim().toUpperCase();
  if (!/^[A-Z]{1,2}$/.test(colLetter)) {
    ui.alert("Invalid column letter. Please enter a letter like A, B, or AA.");
    return;
  }

  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    ui.alert("No data found in the sheet.");
    return;
  }

  // Convert column letter to number
  var colNum = 0;
  for (var i = 0; i < colLetter.length; i++) {
    colNum = colNum * 26 + (colLetter.charCodeAt(i) - 64);
  }

  var dataRange = sheet.getRange(2, colNum, lastRow - 1, 1);
  var values = dataRange.getValues();
  var queries = [];

  for (var i = 0; i < values.length; i++) {
    var val = String(values[i][0]).trim();
    if (val) {
      queries.push(val);
    }
  }

  if (queries.length === 0) {
    ui.alert("No legal land descriptions found in column " + colLetter + ".");
    return;
  }

  // Process in batches
  var allResults = [];
  for (var i = 0; i < queries.length; i += CONFIG.MAX_BATCH_SIZE) {
    var chunk = queries.slice(i, i + CONFIG.MAX_BATCH_SIZE);
    try {
      var response = apiConvertBatch(chunk);
      allResults = allResults.concat(response.data);
    } catch (e) {
      if (e.message === "FREE_LIMIT_REACHED") {
        ui.alert(
          "Free monthly limit reached after " + allResults.length + " conversions.\n\n" +
          "Connect your API key for unlimited access:\n" +
          "Township Canada menu > Settings"
        );
        break;
      }
      throw e;
    }
  }

  // Write results
  var outputCol = colNum + 1;

  // Headers
  sheet.getRange(1, outputCol, 1, 3).setValues([["Latitude", "Longitude", "Province"]]);
  sheet.getRange(1, outputCol, 1, 3).setFontWeight("bold");

  var resultIndex = 0;
  for (var i = 0; i < values.length; i++) {
    var val = String(values[i][0]).trim();
    if (val && resultIndex < allResults.length) {
      var r = allResults[resultIndex];
      sheet.getRange(i + 2, outputCol, 1, 3).setValues([
        [r.latitude || "N/A", r.longitude || "N/A", r.province || "N/A"]
      ]);
      resultIndex++;
    }
  }

  var total = allResults.length;
  var success = allResults.filter(function(r) { return r.latitude !== null; }).length;
  ui.alert("Done! Converted " + success + "/" + total + " descriptions.");
}

/**
 * Convert a column directly (called from sidebar with column letter).
 * @param {string} colLetter Column letter (e.g., "A", "AB").
 * @returns {object} Result with total, success, failure counts.
 */
function convertColumnDirect(colLetter) {
  colLetter = colLetter.trim().toUpperCase();
  if (!/^[A-Z]{1,2}$/.test(colLetter)) {
    throw new Error("Invalid column letter. Please enter a letter like A, B, or AA.");
  }

  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    throw new Error("No data found in the sheet.");
  }

  var colNum = 0;
  for (var i = 0; i < colLetter.length; i++) {
    colNum = colNum * 26 + (colLetter.charCodeAt(i) - 64);
  }

  var dataRange = sheet.getRange(2, colNum, lastRow - 1, 1);
  var values = dataRange.getValues();
  var queries = [];

  for (var i = 0; i < values.length; i++) {
    var val = String(values[i][0]).trim();
    if (val) {
      queries.push(val);
    }
  }

  if (queries.length === 0) {
    throw new Error("No legal land descriptions found in column " + colLetter + ".");
  }

  var allResults = [];
  for (var i = 0; i < queries.length; i += CONFIG.MAX_BATCH_SIZE) {
    var chunk = queries.slice(i, i + CONFIG.MAX_BATCH_SIZE);
    var response = apiConvertBatch(chunk);
    allResults = allResults.concat(response.data);
  }

  var outputCol = colNum + 1;
  sheet.getRange(1, outputCol, 1, 3).setValues([["Latitude", "Longitude", "Province"]]);
  sheet.getRange(1, outputCol, 1, 3).setFontWeight("bold");

  var resultIndex = 0;
  for (var i = 0; i < values.length; i++) {
    var val = String(values[i][0]).trim();
    if (val && resultIndex < allResults.length) {
      var r = allResults[resultIndex];
      sheet.getRange(i + 2, outputCol, 1, 3).setValues([
        [r.latitude || "N/A", r.longitude || "N/A", r.province || "N/A"]
      ]);
      resultIndex++;
    }
  }

  var total = allResults.length;
  var success = allResults.filter(function(r) { return r.latitude !== null; }).length;
  return { total: total, success: success, failure: total - success };
}

/**
 * Convert selected cells directly (called from sidebar).
 * @returns {object} Result with total, success, failure counts.
 */
function convertSelectedDirect() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getActiveRange();

  if (!range) {
    throw new Error("Please select cells containing legal land descriptions.");
  }

  var values = range.getValues();
  var queries = [];

  for (var i = 0; i < values.length; i++) {
    var val = String(values[i][0]).trim();
    if (val) {
      queries.push(val);
    }
  }

  if (queries.length === 0) {
    throw new Error("No legal land descriptions found in the selected cells.");
  }

  var response = apiConvertBatch(queries);
  var results = response.data;

  var startRow = range.getRow();
  var startCol = range.getColumn() + range.getNumColumns();
  var resultIndex = 0;

  if (startRow > 1) {
    var headerRow = startRow - 1;
    var existingHeaders = sheet.getRange(headerRow, startCol, 1, 3).getValues()[0];
    if (!existingHeaders[0] && !existingHeaders[1] && !existingHeaders[2]) {
      sheet.getRange(headerRow, startCol, 1, 3).setValues([["Latitude", "Longitude", "Province"]]);
      sheet.getRange(headerRow, startCol, 1, 3).setFontWeight("bold");
    }
  }

  for (var i = 0; i < values.length; i++) {
    var val = String(values[i][0]).trim();
    if (val && resultIndex < results.length) {
      var r = results[resultIndex];
      sheet.getRange(startRow + i, startCol, 1, 3).setValues([
        [r.latitude || "N/A", r.longitude || "N/A", r.province || "N/A"]
      ]);
      resultIndex++;
    }
  }

  var stats = response.statistics;
  return { total: stats.total, success: stats.success, failure: stats.failure };
}

/**
 * Show a dialog with current usage information.
 */
function showUsageDialog() {
  var usage = apiGetUsage();
  var message;

  if (usage.apiKeyValid) {
    message = "Plan: API Key (unlimited)\nAPI key is connected and valid.";
  } else {
    message = "Plan: Free\n" +
      "Used: " + usage.used + "/" + usage.limit + " this month\n" +
      "Remaining: " + usage.remaining + " conversions\n\n" +
      "Connect an API key for unlimited conversions:\n" +
      "Township Canada menu > Settings";
  }

  SpreadsheetApp.getUi().alert("Township Canada Usage", message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Show settings dialog for API key management.
 */
function showSettingsDialog() {
  var html = HtmlService.createHtmlOutputFromFile("Settings")
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, "Township Canada Settings");
}
