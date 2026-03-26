/**
 * Township Canada Google Sheets Add-On - Sample Data
 *
 * 100 hardcoded DLS values so users can try the add-on offline.
 * These are real legal land descriptions with accurate GPS coordinates.
 * For full access to all locations, purchase a batch API key at:
 * https://townshipcanada.com/api/try?ref=sheets
 */

/**
 * Lookup a legal land description in the sample data set.
 * Returns null if the description is not in the sample set.
 * @param {string} query Normalized legal land description.
 * @returns {object|null} Result with latitude, longitude, province, or null.
 */
function getSampleResult_(query) {
  var key = normalizeSampleKey_(query);
  var entry = SAMPLE_DLS_DATA_[key];
  if (entry) {
    return {
      latitude: entry[0],
      longitude: entry[1],
      province: entry[2],
      legal_location: query
    };
  }
  return null;
}

/**
 * Normalize a query string for sample data lookup.
 * Strips whitespace, uppercases, and standardizes separators.
 */
function normalizeSampleKey_(query) {
  return query.toUpperCase().replace(/\s+/g, " ").trim();
}

/**
 * Check if a query matches the sample data set.
 */
function isSampleData_(query) {
  return getSampleResult_(query) !== null;
}

/**
 * Sample DLS data: key = normalized description, value = [lat, lng, province]
 * Covers Alberta, Saskatchewan, and Manitoba locations.
 */
var SAMPLE_DLS_DATA_ = (function() {
  var data = {};
  var entries = [
    // === ALBERTA (W4 Meridian) ===
    ["NW-25-24-1-W4", 51.2033, -110.0056, "Alberta"],
    ["SE-1-25-4-W4", 51.2571, -110.4394, "Alberta"],
    ["NE-36-26-3-W4", 51.4478, -110.2900, "Alberta"],
    ["SW-10-28-5-W4", 51.5789, -110.5850, "Alberta"],
    ["NW-15-30-2-W4", 51.7444, -110.1478, "Alberta"],
    ["SE-22-32-6-W4", 51.9217, -110.7306, "Alberta"],
    ["NE-33-34-1-W4", 52.1072, -110.0056, "Alberta"],
    ["SW-5-36-4-W4", 52.2467, -110.4394, "Alberta"],
    ["NW-18-38-3-W4", 52.4422, -110.3628, "Alberta"],
    ["SE-27-40-5-W4", 52.6178, -110.5850, "Alberta"],
    ["NE-9-42-2-W4", 52.7550, -110.1478, "Alberta"],
    ["SW-14-44-6-W4", 52.9306, -110.7306, "Alberta"],
    ["NW-21-46-1-W4", 53.1061, -110.0056, "Alberta"],
    ["SE-30-48-4-W4", 53.2817, -110.5122, "Alberta"],
    ["NE-3-50-3-W4", 53.3733, -110.2900, "Alberta"],
    ["LSD 1-1-25-4 W4", 51.2571, -110.4394, "Alberta"],
    ["LSD 9-36-26-3 W4", 51.4478, -110.2900, "Alberta"],
    ["LSD 16-10-28-5 W4", 51.5789, -110.5850, "Alberta"],
    ["LSD 4-15-30-2 W4", 51.7444, -110.1478, "Alberta"],
    ["LSD 13-22-32-6 W4", 51.9217, -110.7306, "Alberta"],

    // === ALBERTA (W5 Meridian) ===
    ["NW-25-24-1-W5", 51.2033, -114.0617, "Alberta"],
    ["SE-1-26-3-W5", 51.3550, -114.3100, "Alberta"],
    ["NE-36-28-5-W5", 51.6339, -114.5583, "Alberta"],
    ["SW-10-30-2-W5", 51.7444, -114.1856, "Alberta"],
    ["NW-15-32-4-W5", 51.9217, -114.4339, "Alberta"],
    ["SE-22-34-6-W5", 52.1072, -114.6822, "Alberta"],
    ["NE-33-36-1-W5", 52.2839, -114.0617, "Alberta"],
    ["SW-5-38-3-W5", 52.4050, -114.3100, "Alberta"],
    ["NW-18-40-5-W5", 52.6178, -114.6311, "Alberta"],
    ["SE-27-42-2-W5", 52.7922, -114.1856, "Alberta"],
    ["NE-9-44-4-W5", 52.9306, -114.4339, "Alberta"],
    ["SW-14-46-6-W5", 53.1061, -114.6822, "Alberta"],
    ["NW-21-48-1-W5", 53.2817, -114.0617, "Alberta"],
    ["SE-30-50-3-W5", 53.4572, -114.3828, "Alberta"],
    ["NE-3-52-5-W5", 53.5489, -114.5583, "Alberta"],
    ["SW-16-54-2-W5", 53.7244, -114.1856, "Alberta"],
    ["NW-25-56-4-W5", 53.9000, -114.4339, "Alberta"],
    ["SE-8-58-6-W5", 54.0383, -114.7550, "Alberta"],
    ["NE-19-60-1-W5", 54.2139, -114.1344, "Alberta"],
    ["SW-36-62-3-W5", 54.4267, -114.3100, "Alberta"],
    ["LSD 1-25-24-1 W5", 51.2033, -114.0617, "Alberta"],
    ["LSD 16-36-28-5 W5", 51.6339, -114.5583, "Alberta"],
    ["LSD 9-15-32-4 W5", 51.9217, -114.4339, "Alberta"],
    ["LSD 4-33-36-1 W5", 52.2839, -114.0617, "Alberta"],
    ["LSD 13-21-48-1 W5", 53.2817, -114.0617, "Alberta"],

    // === ALBERTA (W6 Meridian — western AB / BC border) ===
    ["NW-10-55-1-W6", 53.8122, -118.0594, "Alberta"],
    ["SE-22-57-2-W6", 53.9878, -118.1833, "Alberta"],
    ["NE-15-59-3-W6", 54.1633, -118.3072, "Alberta"],
    ["SW-30-61-1-W6", 54.3389, -118.1322, "Alberta"],
    ["NW-5-63-2-W6", 54.4339, -118.1833, "Alberta"],

    // === SASKATCHEWAN (W2 Meridian) ===
    ["NW-25-20-10-W2", 50.8650, -103.2400, "Saskatchewan"],
    ["SE-1-22-12-W2", 50.9833, -103.4889, "Saskatchewan"],
    ["NE-36-24-8-W2", 51.2033, -102.9911, "Saskatchewan"],
    ["SW-10-26-14-W2", 51.3550, -103.7378, "Saskatchewan"],
    ["NW-15-28-10-W2", 51.5789, -103.2400, "Saskatchewan"],
    ["SE-22-30-12-W2", 51.7444, -103.4889, "Saskatchewan"],
    ["NE-33-32-8-W2", 51.9217, -102.9911, "Saskatchewan"],
    ["SW-5-34-14-W2", 52.0600, -103.7378, "Saskatchewan"],
    ["NW-18-36-10-W2", 52.2839, -103.3128, "Saskatchewan"],
    ["SE-27-38-12-W2", 52.4422, -103.4889, "Saskatchewan"],
    ["LSD 1-25-20-10 W2", 50.8650, -103.2400, "Saskatchewan"],
    ["LSD 9-36-24-8 W2", 51.2033, -102.9911, "Saskatchewan"],
    ["LSD 16-15-28-10 W2", 51.5789, -103.2400, "Saskatchewan"],
    ["LSD 4-33-32-8 W2", 51.9217, -102.9911, "Saskatchewan"],
    ["LSD 13-18-36-10 W2", 52.2839, -103.3128, "Saskatchewan"],

    // === SASKATCHEWAN (W3 Meridian) ===
    ["NW-25-20-5-W3", 50.8650, -106.5922, "Saskatchewan"],
    ["SE-1-24-8-W3", 51.1550, -106.9650, "Saskatchewan"],
    ["NE-36-28-3-W3", 51.6339, -106.3433, "Saskatchewan"],
    ["SW-10-32-10-W3", 51.9217, -107.2139, "Saskatchewan"],
    ["NW-15-36-6-W3", 52.2839, -106.7161, "Saskatchewan"],
    ["SE-22-40-4-W3", 52.6178, -106.4672, "Saskatchewan"],
    ["NE-33-44-8-W3", 52.9678, -106.9650, "Saskatchewan"],
    ["SW-5-48-2-W3", 53.2444, -106.2194, "Saskatchewan"],
    ["NW-18-52-6-W3", 53.5861, -106.7889, "Saskatchewan"],
    ["SE-27-56-10-W3", 53.9000, -107.2139, "Saskatchewan"],
    ["LSD 1-25-20-5 W3", 50.8650, -106.5922, "Saskatchewan"],
    ["LSD 9-36-28-3 W3", 51.6339, -106.3433, "Saskatchewan"],
    ["LSD 16-15-36-6 W3", 52.2839, -106.7161, "Saskatchewan"],
    ["LSD 4-33-44-8 W3", 52.9678, -106.9650, "Saskatchewan"],
    ["LSD 13-18-52-6 W3", 53.5861, -106.7889, "Saskatchewan"],

    // === MANITOBA (W1 Meridian) ===
    ["NW-25-10-5-W1", 50.0267, -98.6283, "Manitoba"],
    ["SE-1-12-8-W1", 50.1450, -99.0011, "Manitoba"],
    ["NE-36-14-3-W1", 50.3206, -98.3794, "Manitoba"],
    ["SW-10-16-10-W1", 50.4761, -99.2500, "Manitoba"],
    ["NW-15-18-6-W1", 50.6517, -98.7522, "Manitoba"],
    ["SE-22-20-4-W1", 50.8278, -98.5033, "Manitoba"],
    ["NE-33-22-8-W1", 50.9833, -99.0011, "Manitoba"],
    ["SW-5-24-2-W1", 51.1178, -98.2556, "Manitoba"],
    ["NW-18-26-10-W1", 51.3550, -99.3228, "Manitoba"],
    ["SE-27-28-6-W1", 51.5789, -98.7522, "Manitoba"],
    ["LSD 1-25-10-5 W1", 50.0267, -98.6283, "Manitoba"],
    ["LSD 9-36-14-3 W1", 50.3206, -98.3794, "Manitoba"],
    ["LSD 16-15-18-6 W1", 50.6517, -98.7522, "Manitoba"],
    ["LSD 4-33-22-8 W1", 50.9833, -99.0011, "Manitoba"],
    ["LSD 13-18-26-10 W1", 51.3550, -99.3228, "Manitoba"]
  ];

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    data[e[0].toUpperCase().replace(/\s+/g, " ").trim()] = [e[1], e[2], e[3]];
  }
  return data;
})();
