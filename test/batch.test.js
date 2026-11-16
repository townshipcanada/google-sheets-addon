/**
 * Tests for the batch conversion path (sidebar "Convert Selected Cells" /
 * "Convert Entire Column" and the matching menu items).
 *
 * The .gs sources are loaded into one shared V8 context, the same way Apps
 * Script runs them, with small fakes for the Google services they touch.
 * The fake Batch API mirrors api/services/batch/handler.js:
 *   - request body is a JSON array of 1..100 strings, more returns 413
 *   - success body is a bare JSON array of FeatureCollections, one per
 *     matched input (grid + centroid features, properties.search_term is the
 *     sanitized input); unmatched inputs are omitted entirely
 */

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SRC = path.join(__dirname, "..", "src");
const API_MAX_ITEMS = 100;

// Same sanitizing as api/packages/shared/helpers.js sanitizeLocationInput.
function apiSanitize(input) {
  return input.trim().replace(/['"]/g, "").replace(/[;\\]/g, "");
}

function knownLocation(term) {
  // Treat anything shaped like a DLS LSD/quarter as found, "BAD-*" as not found.
  return !/^BAD-/.test(term);
}

function featureCollectionFor(term, index) {
  const lng = -110 - index / 1000;
  const lat = 50 + index / 1000;
  const props = function (shape) {
    return {
      shape: shape,
      search_term: term,
      legal_location: term,
      unit: "LSD",
      survey_system: "DLS",
      province: "Alberta"
    };
  };
  return {
    type: "FeatureCollection",
    features: [
      { type: "Feature", geometry: { type: "MultiPolygon", coordinates: [] }, properties: props("grid") },
      { type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties: props("centroid") }
    ]
  };
}

function makeFakeBatchApi() {
  const calls = [];
  const fetch = function (url, options) {
    const items = JSON.parse(options.payload);
    calls.push({ url: url, method: options.method, items: items });
    let code;
    let body;
    if (items.length > API_MAX_ITEMS) {
      code = 413;
      body = { error: "Payload Too Large.", message: "Maximum payload size is 100 items." };
    } else {
      code = 200;
      body = [];
      items.forEach(function (item) {
        const term = apiSanitize(item);
        if (knownLocation(term)) {
          body.push(featureCollectionFor(term, body.length));
        }
      });
    }
    return {
      getResponseCode: function () { return code; },
      getContentText: function () { return JSON.stringify(body); }
    };
  };
  return { calls: calls, fetch: fetch };
}

// Minimal sheet: a sparse grid keyed by "row,col" (1-based).
function makeFakeSheet(cells, activeRange) {
  const grid = Object.assign({}, cells);
  const key = function (r, c) { return r + "," + c; };
  const sheet = {
    grid: grid,
    getLastRow: function () {
      let last = 0;
      Object.keys(grid).forEach(function (k) {
        const r = Number(k.split(",")[0]);
        if (grid[k] !== "" && grid[k] != null && r > last) last = r;
      });
      return last;
    },
    getRange: function (row, col, numRows, numCols) {
      numRows = numRows || 1;
      numCols = numCols || 1;
      return {
        getRow: function () { return row; },
        getColumn: function () { return col; },
        getNumColumns: function () { return numCols; },
        getValues: function () {
          const out = [];
          for (let r = 0; r < numRows; r++) {
            const line = [];
            for (let c = 0; c < numCols; c++) {
              const v = grid[key(row + r, col + c)];
              line.push(v == null ? "" : v);
            }
            out.push(line);
          }
          return out;
        },
        setValues: function (values) {
          values.forEach(function (line, r) {
            line.forEach(function (v, c) { grid[key(row + r, col + c)] = v; });
          });
        },
        setFontWeight: function () {}
      };
    },
    getActiveRange: function () {
      return activeRange ? sheet.getRange.apply(null, activeRange) : null;
    }
  };
  return sheet;
}

function loadAddon(sheet, api) {
  const alerts = [];
  const context = vm.createContext({
    console: console,
    PropertiesService: {
      getScriptProperties: function () { return { getProperty: function () { return null; } }; },
      getUserProperties: function () {
        return {
          getProperty: function (k) { return k === "TOWNSHIP_CANADA_API_KEY" ? "test-key" : null; },
          setProperty: function () {},
          deleteProperty: function () {}
        };
      }
    },
    UrlFetchApp: { fetch: api.fetch },
    SpreadsheetApp: {
      getActiveSheet: function () { return sheet; },
      getUi: function () {
        return {
          alert: function (msg) { alerts.push(msg); },
          ButtonSet: { OK: "OK", OK_CANCEL: "OK_CANCEL" },
          Button: { OK: "OK" }
        };
      }
    }
  });
  const files = fs.readdirSync(SRC).filter(function (f) { return f.endsWith(".gs"); }).sort();
  const source = files.map(function (f) { return fs.readFileSync(path.join(SRC, f), "utf8"); }).join("\n;\n");
  vm.runInContext(source, context, { filename: "addon.gs" });
  context.__alerts = alerts;
  return context;
}

// Objects built inside the vm context have that context's prototypes.
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function columnCells(col, values) {
  const cells = { ["1," + col]: "LLD" };
  values.forEach(function (v, i) { cells[(i + 2) + "," + col] = v; });
  return cells;
}

function lsd(i) {
  return (1 + (i % 16)) + "-" + (1 + (i % 36)) + "-" + (1 + Math.floor(i / 36)) + "-1-W5";
}

test("column conversion never sends more than 100 items per Batch API request", function () {
  const values = [];
  for (let i = 0; i < 250; i++) values.push(lsd(i));
  const sheet = makeFakeSheet(columnCells(1, values));
  const api = makeFakeBatchApi();
  const addon = loadAddon(sheet, api);

  const result = plain(addon.convertColumnDirect("A"));

  assert.deepEqual(api.calls.map(function (c) { return c.items.length; }), [100, 100, 50]);
  api.calls.forEach(function (c) {
    assert.equal(c.method, "post");
    assert.match(c.url, /\/batch\/legal-location$/);
  });
  assert.deepEqual(result, { total: 250, success: 250, failure: 0 });
  // Last row got real coordinates, not N/A.
  assert.equal(typeof sheet.grid["251,2"], "number");
  assert.equal(sheet.grid["251,4"], "Alberta");
});

test("column conversion keeps rows aligned when the API omits unmatched inputs", function () {
  const values = ["NW-25-24-1-W5", "BAD-1", "", "10-25-24-1-W5", "BAD-2", "SE-1-1-1-W4"];
  const sheet = makeFakeSheet(columnCells(1, values));
  const api = makeFakeBatchApi();
  const addon = loadAddon(sheet, api);

  const result = plain(addon.convertColumnDirect("A"));

  assert.deepEqual(result, { total: 5, success: 3, failure: 2 });
  assert.equal(typeof sheet.grid["2,2"], "number");
  assert.deepEqual(plain([sheet.grid["3,2"], sheet.grid["3,3"], sheet.grid["3,4"]]), ["N/A", "N/A", "N/A"]);
  assert.equal(sheet.grid["4,2"], undefined); // blank input row is left alone
  assert.equal(typeof sheet.grid["5,2"], "number");
  assert.equal(sheet.grid["6,2"], "N/A");
  assert.equal(typeof sheet.grid["7,2"], "number");
});

test("selected-cell conversion chunks to 100 and reports real counts", function () {
  const values = [];
  for (let i = 0; i < 150; i++) values.push(i === 120 ? "BAD-x" : lsd(i));
  const cells = {};
  values.forEach(function (v, i) { cells[(i + 2) + ",1"] = v; });
  const sheet = makeFakeSheet(cells, [2, 1, 150, 1]);
  const api = makeFakeBatchApi();
  const addon = loadAddon(sheet, api);

  const result = plain(addon.convertSelectedDirect());

  assert.deepEqual(api.calls.map(function (c) { return c.items.length; }), [100, 50]);
  assert.deepEqual(result, { total: 150, success: 149, failure: 1 });
  assert.equal(sheet.grid["122,2"], "N/A");
  assert.equal(typeof sheet.grid["123,2"], "number");
});

test("menu selected-cell conversion shows the real counts", function () {
  const sheet = makeFakeSheet({ "2,1": "NW-25-24-1-W5", "3,1": "BAD-1" }, [2, 1, 2, 1]);
  const api = makeFakeBatchApi();
  const addon = loadAddon(sheet, api);

  addon.convertSelectedCells();

  assert.equal(addon.__alerts.length, 1);
  assert.match(addon.__alerts[0], /Total: 2\nSuccess: 1\nFailed: 1/);
});

test("results match inputs the API sanitizes (quotes, whitespace)", function () {
  const sheet = makeFakeSheet({ "2,1": " 'NW-25-24-1-W5' ", "3,1": "\"10-25-24-1-W5\"" }, [2, 1, 2, 1]);
  const api = makeFakeBatchApi();
  const addon = loadAddon(sheet, api);

  const result = plain(addon.convertSelectedDirect());

  assert.deepEqual(result, { total: 2, success: 2, failure: 0 });
  assert.equal(typeof sheet.grid["2,2"], "number");
  assert.equal(typeof sheet.grid["3,2"], "number");
});

test("batch API errors surface the API message", function () {
  const sheet = makeFakeSheet({ "2,1": "NW-25-24-1-W5" }, [2, 1, 1, 1]);
  const api = {
    calls: [],
    fetch: function () {
      return {
        getResponseCode: function () { return 429; },
        getContentText: function () {
          return JSON.stringify({ error: "Rate Limit Exceeded", message: "You've exceeded your quota." });
        }
      };
    }
  };
  const addon = loadAddon(sheet, api);

  assert.throws(function () { addon.convertSelectedDirect(); }, /exceeded your quota/);
});
