/**
 * Township Canada Google Sheets Add-On - API Client
 *
 * Handles all HTTP communication with the Township Canada API.
 * Requires a trial or paid API key.
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
 * Convert a single legal land description via the API.
 * @param {string} query - The legal land description to convert.
 * @returns {object} Conversion result with latitude, longitude, etc.
 */
function apiConvertSingle(query) {
  if (!hasApiKey()) {
    throw new Error("NO_API_KEY");
  }

  var url = CONFIG.API_BASE_URL + "/convert";
  var options = {
    method: "post",
    headers: buildHeaders(),
    payload: JSON.stringify({ query: query }),
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

  return body.data;
}

/**
 * Convert a batch of legal land descriptions via the API.
 * @param {string[]} queries - Array of legal land descriptions.
 * @returns {object} Batch result with data array and statistics.
 */
function apiConvertBatch(queries) {
  if (!hasApiKey()) {
    throw new Error("NO_API_KEY");
  }

  var url = CONFIG.API_BASE_URL + "/convert-batch";
  var options = {
    method: "post",
    headers: buildHeaders(),
    payload: JSON.stringify({ batch: queries }),
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
 * @returns {object} Usage data with plan, limit, used, remaining.
 */
function apiGetUsage() {
  if (!hasApiKey()) {
    return { plan: "none", apiKeyValid: false };
  }

  var url = CONFIG.API_BASE_URL + "/usage";
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
