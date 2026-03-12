/**
 * Township Canada Google Sheets Add-On - Custom Functions
 *
 * Spreadsheet functions that can be used in any cell:
 *   =TOWNSHIP("NW-25-24-1-W5")           → "52.123456, -114.654321"
 *   =TOWNSHIP_LAT("NW-25-24-1-W5")       → 52.123456
 *   =TOWNSHIP_LNG("NW-25-24-1-W5")       → -114.654321
 *   =TOWNSHIP_PROVINCE("NW-25-24-1-W5")  → "Alberta"
 */

/**
 * Convert a Canadian legal land description to GPS coordinates.
 * Returns "latitude, longitude" as a string.
 *
 * Supports DLS (AB, SK, MB), NTS (BC), Geographic Townships (ON),
 * River Lots, UWI, and FPS Grid formats.
 *
 * Note: Each cell with this function makes a separate API call.
 * For bulk conversions (10+ descriptions), use the sidebar instead:
 * Extensions > Township Canada > Open sidebar
 *
 * @param {string} lld The legal land description (e.g., "NW-25-24-1-W5", "LSD 10-33-045-04 W4").
 * @return {string} GPS coordinates as "latitude, longitude".
 * @customfunction
 */
function TOWNSHIP(lld) {
  if (!lld || typeof lld !== "string" || !lld.trim()) {
    return "";
  }

  try {
    var result = apiConvertSingle(lld.trim());
    if (result.latitude !== null && result.longitude !== null) {
      return result.latitude.toFixed(6) + ", " + result.longitude.toFixed(6);
    }
    return "Not found";
  } catch (e) {
    if (e.message === "FREE_LIMIT_REACHED") {
      return "Limit reached - connect API key";
    }
    if (e.message === "INVALID_API_KEY") {
      return "Invalid API key";
    }
    return "Error: " + e.message;
  }
}

/**
 * Convert a Canadian legal land description and return only the latitude.
 *
 * @param {string} lld The legal land description (e.g., "NW-25-24-1-W5").
 * @return {number} Latitude in decimal degrees.
 * @customfunction
 */
function TOWNSHIP_LAT(lld) {
  if (!lld || typeof lld !== "string" || !lld.trim()) {
    return "";
  }

  try {
    var result = apiConvertSingle(lld.trim());
    if (result.latitude !== null) {
      return result.latitude;
    }
    return "Not found";
  } catch (e) {
    if (e.message === "FREE_LIMIT_REACHED") {
      return "Limit reached";
    }
    return "Error";
  }
}

/**
 * Convert a Canadian legal land description and return only the longitude.
 *
 * @param {string} lld The legal land description (e.g., "NW-25-24-1-W5").
 * @return {number} Longitude in decimal degrees.
 * @customfunction
 */
function TOWNSHIP_LNG(lld) {
  if (!lld || typeof lld !== "string" || !lld.trim()) {
    return "";
  }

  try {
    var result = apiConvertSingle(lld.trim());
    if (result.longitude !== null) {
      return result.longitude;
    }
    return "Not found";
  } catch (e) {
    if (e.message === "FREE_LIMIT_REACHED") {
      return "Limit reached";
    }
    return "Error";
  }
}

/**
 * Convert a Canadian legal land description and return the province.
 *
 * @param {string} lld The legal land description (e.g., "NW-25-24-1-W5").
 * @return {string} Province name (e.g., "Alberta").
 * @customfunction
 */
function TOWNSHIP_PROVINCE(lld) {
  if (!lld || typeof lld !== "string" || !lld.trim()) {
    return "";
  }

  try {
    var result = apiConvertSingle(lld.trim());
    if (result.province) {
      return result.province;
    }
    return "Not found";
  } catch (e) {
    if (e.message === "FREE_LIMIT_REACHED") {
      return "Limit reached";
    }
    return "Error";
  }
}
