/**
 * Township Canada Google Sheets Add-On - Custom Functions
 *
 * Spreadsheet functions that can be used in any cell:
 *   =TOWNSHIP_CANADA("NW-25-24-1-W5")           -> "52.123456, -114.654321"
 *   =TOWNSHIP_CANADA_LAT("NW-25-24-1-W5")       -> 52.123456
 *   =TOWNSHIP_CANADA_LNG("NW-25-24-1-W5")       -> -114.654321
 *   =TOWNSHIP_CANADA_PROVINCE("NW-25-24-1-W5")  -> "Alberta"
 */

/**
 * Retrieve a cached API result or fetch and cache a new one.
 * Uses CacheService with a 6-hour expiry to avoid redundant API calls.
 * @param {string} lld The legal land description.
 * @returns {object} Conversion result with latitude, longitude, province, etc.
 */
function getCachedResult_(lld) {
  const cache = CacheService.getUserCache();
  const cacheKey = "tc_" + lld;
  const cached = cache.get(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // Corrupted cache entry; fall through to fetch
    }
  }

  const result = apiConvertSingle(lld);
  try {
    cache.put(cacheKey, JSON.stringify(result), 21600); // 6 hours
  } catch (e) {
    // Cache write failure is non-critical; continue
  }
  return result;
}

/**
 * Convert a Canadian legal land description to GPS coordinates.
 * Returns "latitude, longitude" as a string.
 *
 * Supports DLS (AB, SK, MB), NTS (BC), Geographic Townships (ON),
 * River Lots, UWI, and FPS Grid formats.
 *
 * Requires a Township Canada API key (trial or paid).
 * Get a free trial key at: townshipcanada.com/api/try
 *
 * Note: Each cell with this function makes a separate API call.
 * For bulk conversions (10+ descriptions), use the sidebar instead:
 * Extensions > Township Canada > Open sidebar
 *
 * @param {string} lld The legal land description (e.g., "NW-25-24-1-W5", "LSD 10-33-045-04 W4").
 * @return {string} GPS coordinates as "latitude, longitude".
 * @customfunction
 */
function TOWNSHIP_CANADA(lld) {
  if (!lld || typeof lld !== "string" || !lld.trim()) {
    return "";
  }

  try {
    const result = getCachedResult_(lld.trim());
    if (result.latitude !== null && result.longitude !== null) {
      return result.latitude.toFixed(6) + ", " + result.longitude.toFixed(6);
    }
    return "Not found";
  } catch (e) {
    if (e.message === "NO_API_KEY") {
      return "API key required";
    }
    if (e.message === "TRIAL_EXPIRED") {
      return "Trial expired";
    }
    if (e.message === "TRIAL_LIMIT_REACHED") {
      return "Trial limit reached";
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
function TOWNSHIP_CANADA_LAT(lld) {
  if (!lld || typeof lld !== "string" || !lld.trim()) {
    return "";
  }

  try {
    const result = getCachedResult_(lld.trim());
    if (result.latitude !== null) {
      return result.latitude;
    }
    return "Not found";
  } catch (e) {
    if (e.message === "NO_API_KEY") {
      return "API key required";
    }
    if (e.message === "TRIAL_EXPIRED" || e.message === "TRIAL_LIMIT_REACHED") {
      return "Trial ended";
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
function TOWNSHIP_CANADA_LNG(lld) {
  if (!lld || typeof lld !== "string" || !lld.trim()) {
    return "";
  }

  try {
    const result = getCachedResult_(lld.trim());
    if (result.longitude !== null) {
      return result.longitude;
    }
    return "Not found";
  } catch (e) {
    if (e.message === "NO_API_KEY") {
      return "API key required";
    }
    if (e.message === "TRIAL_EXPIRED" || e.message === "TRIAL_LIMIT_REACHED") {
      return "Trial ended";
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
function TOWNSHIP_CANADA_PROVINCE(lld) {
  if (!lld || typeof lld !== "string" || !lld.trim()) {
    return "";
  }

  try {
    const result = getCachedResult_(lld.trim());
    if (result.province) {
      return result.province;
    }
    return "Not found";
  } catch (e) {
    if (e.message === "NO_API_KEY") {
      return "API key required";
    }
    if (e.message === "TRIAL_EXPIRED" || e.message === "TRIAL_LIMIT_REACHED") {
      return "Trial ended";
    }
    return "Error";
  }
}
