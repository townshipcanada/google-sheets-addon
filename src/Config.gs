/**
 * Township Canada Google Sheets Add-On - Configuration
 *
 * Central configuration for API endpoints, limits, and constants.
 */

const CONFIG = (function() {
  const props = PropertiesService.getScriptProperties();
  return {
    API_BASE_URL: props.getProperty("API_BASE_URL") || "https://developer.townshipcanada.com",
    MAX_BATCH_SIZE: 200,
    ADDON_VERSION: "1.1.0"
  };
})();

/**
 * Get the stored API key.
 */
function getApiKey() {
  return PropertiesService.getUserProperties().getProperty("TOWNSHIP_CANADA_API_KEY") || "";
}

/**
 * Save an API key to user properties.
 */
function setApiKey(apiKey) {
  PropertiesService.getUserProperties().setProperty("TOWNSHIP_CANADA_API_KEY", apiKey.trim());
}

/**
 * Remove the stored API key.
 */
function removeApiKey() {
  PropertiesService.getUserProperties().deleteProperty("TOWNSHIP_CANADA_API_KEY");
}

/**
 * Get the API base URL.
 */
function getApiBaseUrl() {
  return CONFIG.API_BASE_URL;
}
