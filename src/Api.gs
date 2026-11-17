/**
 * Township Canada Google Sheets Add-On - API Client
 *
 * Handles all HTTP communication with the Township Canada API
 * at developer.townshipcanada.com.
 */

/**
 * Build request headers with API key.
 */
function buildHeaders() {
  const headers = {
    "Content-Type": "application/json"
  };
  const apiKey = getApiKey();
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
 * Safely parse a JSON response body.
 * Returns the parsed object, or an object with the raw text on failure.
 * @param {string} text The raw response text.
 * @returns {object} Parsed JSON or fallback object.
 */
function safeParseJson_(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return { message: "Invalid JSON response: " + text.substring(0, 200) };
  }
}

/**
 * Extract coordinates from a GeoJSON FeatureCollection response.
 * Finds the centroid feature and returns a flat object.
 */
function extractFromFeatureCollection(fc) {
  const features = fc.features || [];
  let centroid = null;
  for (let i = 0; i < features.length; i++) {
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
 * Uses GET /search/legal-location.
 * @param {string} query - The legal land description to convert.
 * @returns {object} Conversion result with latitude, longitude, etc.
 */
function apiConvertSingle(query) {
  if (!hasApiKey()) {
    throw new Error("NO_API_KEY");
  }

  const url = getApiBaseUrl() + "/search/legal-location?location=" + encodeURIComponent(query);
  const options = {
    method: "get",
    headers: buildHeaders(),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  const body = safeParseJson_(response.getContentText());

  if (code === 401) {
    throw new Error("INVALID_API_KEY");
  }
  if (code !== 200) {
    throw new Error(body.message || "API request failed");
  }

  return extractFromFeatureCollection(body);
}

/**
 * Convert a batch of legal land descriptions via the API.
 * Uses POST /batch/legal-location, which accepts at most CONFIG.MAX_BATCH_SIZE
 * items and returns a bare JSON array of GeoJSON FeatureCollections, one per
 * matched input. Unmatched inputs are left out, so callers must match results
 * back to inputs (see matchBatchResults_), not rely on position.
 * @param {string[]} queries - Array of legal land descriptions.
 * @returns {object[]} Array of GeoJSON FeatureCollections.
 */
function apiConvertBatch(queries) {
  if (!hasApiKey()) {
    throw new Error("NO_API_KEY");
  }

  const url = getApiBaseUrl() + "/batch/legal-location";
  const options = {
    method: "post",
    headers: buildHeaders(),
    payload: JSON.stringify(queries),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  const body = safeParseJson_(response.getContentText());

  if (code === 401) {
    throw new Error("INVALID_API_KEY");
  }
  if (code !== 200) {
    throw new Error(body.message || "Batch API request failed");
  }
  if (!Array.isArray(body)) {
    throw new Error("Unexpected Batch API response");
  }

  return body;
}

/**
 * Normalize a description the way the Batch API does before echoing it back
 * as properties.search_term (api/packages/shared sanitizeLocationInput).
 * @param {string} query The raw description.
 * @returns {string} The normalized key.
 */
function normalizeBatchTerm_(query) {
  return String(query).trim().replace(/['"]/g, "").replace(/[;\\]/g, "");
}

/**
 * Match Batch API FeatureCollections back to the queries that produced them.
 * @param {string[]} queries The descriptions sent in one request.
 * @param {object[]} featureCollections The API response array.
 * @returns {object[]} One result per query, in query order; unmatched queries
 *   get null latitude/longitude.
 */
function matchBatchResults_(queries, featureCollections) {
  const byTerm = {};
  for (let i = 0; i < featureCollections.length; i++) {
    const fc = featureCollections[i];
    const features = (fc && fc.features) || [];
    for (let j = 0; j < features.length; j++) {
      const props = features[j].properties || {};
      if (props.search_term) {
        if (!byTerm.hasOwnProperty(props.search_term)) {
          byTerm[props.search_term] = extractFromFeatureCollection(fc);
        }
        break;
      }
    }
  }

  return queries.map(function(query) {
    const key = normalizeBatchTerm_(query);
    if (byTerm.hasOwnProperty(key)) {
      return byTerm[key];
    }
    return { latitude: null, longitude: null, legal_location: null, province: null };
  });
}

/**
 * Convert any number of descriptions, splitting them into requests the Batch
 * API accepts.
 * @param {string[]} queries Non-empty descriptions.
 * @returns {object[]} One result per query, in query order.
 */
function convertQueriesInBatches_(queries) {
  let results = [];
  for (let i = 0; i < queries.length; i += CONFIG.MAX_BATCH_SIZE) {
    const chunk = queries.slice(i, i + CONFIG.MAX_BATCH_SIZE);
    results = results.concat(matchBatchResults_(chunk, apiConvertBatch(chunk)));
  }
  return results;
}

/**
 * Count successes and failures in a list of conversion results.
 * @param {object[]} results Results from convertQueriesInBatches_.
 * @returns {object} { total, success, failure }.
 */
function summarizeBatchResults_(results) {
  const success = results.filter(function(r) { return r.latitude !== null; }).length;
  return { total: results.length, success: success, failure: results.length - success };
}

/**
 * Get current usage information for the connected API key.
 * @returns {object} Usage data with plan and apiKeyValid flag.
 */
function apiGetUsage() {
  if (!hasApiKey()) {
    return { plan: "none", apiKeyValid: false };
  }

  return { plan: "api_key", apiKeyValid: true };
}
