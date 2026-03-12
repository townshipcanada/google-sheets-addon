/**
 * Township Canada Google Sheets Add-On - API Client
 *
 * Handles all HTTP communication with the Township Canada API.
 */

/**
 * Build request headers with installation ID and optional API key.
 */
function buildHeaders() {
  var headers = {
    "X-Installation-Id": getInstallationId(),
    "Content-Type": "application/json"
  };
  var apiKey = getApiKey();
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  return headers;
}

/**
 * Convert a single legal land description via the API.
 * @param {string} query - The legal land description to convert.
 * @returns {object} Conversion result with latitude, longitude, etc.
 */
function apiConvertSingle(query) {
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

  if (code === 429) {
    throw new Error("FREE_LIMIT_REACHED");
  }
  if (code === 401) {
    throw new Error("INVALID_API_KEY");
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

  if (code === 429) {
    throw new Error("FREE_LIMIT_REACHED");
  }
  if (code === 401) {
    throw new Error("INVALID_API_KEY");
  }
  if (code !== 200) {
    throw new Error(body.message || "Batch API request failed");
  }

  return body;
}

/**
 * Get current usage information for this installation.
 * @returns {object} Usage data with plan, limit, used, remaining.
 */
function apiGetUsage() {
  var url = CONFIG.API_BASE_URL + "/usage";
  var options = {
    method: "get",
    headers: buildHeaders(),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var body = JSON.parse(response.getContentText());

  if (response.getResponseCode() !== 200) {
    return { plan: "free", limit: CONFIG.FREE_MONTHLY_LIMIT, used: 0, remaining: CONFIG.FREE_MONTHLY_LIMIT };
  }

  return body.data;
}
