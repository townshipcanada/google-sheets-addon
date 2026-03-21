/**
 * Township Canada Google Sheets Add-On - API Client
 *
 * Handles all HTTP communication with the Township Canada API.
 * Both trial and paid API keys use the same request/response contract.
 * Trial keys route to townshipcanada.com/api/integrations/trial;
 * paid keys route to developer.townshipcanada.com.
 */

/**
 * Build request headers with API key.
 */
function buildHeaders() {
  var headers = {
    "Content-Type": "application/json"
  };
  var apiKey = getApiKey();
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  return headers;
}

/**
 * Check if an API key is configured.
 */
function hasApiKey() {
  return !!getApiKey();
}

/**
 * Extract coordinates from a GeoJSON FeatureCollection response.
 * Finds the centroid feature and returns a flat object.
 */
function extractFromFeatureCollection(fc) {
  var features = fc.features || [];
  var centroid = null;
  for (var i = 0; i < features.length; i++) {
    if (features[i].properties && features[i].properties.shape === "centroid") {
      centroid = features[i];
      break;
    }
  }
  if (!centroid) {
    centroid = features[0];
  }
  if (!centroid) {
    return { latitude: null, longitude: null, legal_location: null, province: null };
  }
  return {
    latitude: centroid.geometry.coordinates[1],
    longitude: centroid.geometry.coordinates[0],
    legal_location: centroid.properties.legal_location || "",
    province: centroid.properties.province || ""
  };
}

/**
 * Convert a single legal land description via the API.
 * Uses GET /search/legal-location — same contract for trial and paid keys.
 * @param {string} query - The legal land description to convert.
 * @returns {object} Conversion result with latitude, longitude, etc.
 */
function apiConvertSingle(query) {
  if (!hasApiKey()) {
    throw new Error("NO_API_KEY");
  }

  var url = getApiBaseUrl() + "/search/legal-location?location=" + encodeURIComponent(query);
  var options = {
    method: "get",
    headers: buildHeaders(),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  var body = JSON.parse(response.getContentText());

  if (code === 401) {
    throw new Error("INVALID_API_KEY");
  }
  if (code === 403) {
    throw new Error("TRIAL_EXPIRED");
  }
  if (code === 429) {
    throw new Error("TRIAL_LIMIT_REACHED");
  }
  if (code !== 200) {
    throw new Error(body.message || "API request failed");
  }

  return extractFromFeatureCollection(body);
}

/**
 * Convert a batch of legal land descriptions via the API.
 * Uses POST /batch/legal-location — same contract for trial and paid keys.
 * @param {string[]} queries - Array of legal land descriptions.
 * @returns {object[]} Array of GeoJSON FeatureCollections.
 */
function apiConvertBatch(queries) {
  if (!hasApiKey()) {
    throw new Error("NO_API_KEY");
  }

  var url = getApiBaseUrl() + "/batch/legal-location";
  var options = {
    method: "post",
    headers: buildHeaders(),
    payload: JSON.stringify(queries),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  var body = JSON.parse(response.getContentText());

  if (code === 401) {
    throw new Error("INVALID_API_KEY");
  }
  if (code === 403) {
    throw new Error("TRIAL_EXPIRED");
  }
  if (code === 429) {
    throw new Error("TRIAL_LIMIT_REACHED");
  }
  if (code !== 200) {
    throw new Error(body.message || "Batch API request failed");
  }

  return body;
}

/**
 * Get current usage information for the connected API key.
 * Usage endpoint is only available for trial keys.
 * @returns {object} Usage data with plan, limit, used, remaining.
 */
function apiGetUsage() {
  if (!hasApiKey()) {
    return { plan: "none", apiKeyValid: false };
  }

  if (!isTrialKey()) {
    return { plan: "api_key", apiKeyValid: true };
  }

  var url = CONFIG.TRIAL_API_BASE_URL + "/usage";
  var options = {
    method: "get",
    headers: buildHeaders(),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);

  if (response.getResponseCode() !== 200) {
    return { plan: "none", apiKeyValid: false };
  }

  return JSON.parse(response.getContentText()).data;
}
