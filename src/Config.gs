/**
 * Township Canada Google Sheets Add-On - Configuration
 *
 * Central configuration for API endpoints, limits, and constants.
 */

var CONFIG = (function() {
  var props = PropertiesService.getScriptProperties();
  return {
    API_BASE_URL: props.getProperty("API_BASE_URL") || "https://townshipcanada.com/api/integrations/trial",
    MAX_BATCH_SIZE: 200,
    ADDON_VERSION: "1.1.0",
    TRIAL_URL: "https://townshipcanada.com/api/try?ref=sheets"
  };
})();

/**
 * Get the stored API key (trial or paid).
 */
function getApiKey() {
  return PropertiesService.getUserProperties().getProperty("TOWNSHIP_API_KEY") || "";
}

/**
 * Save an API key to user properties.
 */
function setApiKey(apiKey) {
  PropertiesService.getUserProperties().setProperty("TOWNSHIP_API_KEY", apiKey.trim());
}

/**
 * Remove the stored API key.
 */
function removeApiKey() {
  PropertiesService.getUserProperties().deleteProperty("TOWNSHIP_API_KEY");
}
