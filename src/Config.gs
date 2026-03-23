/**
 * Township Canada Google Sheets Add-On - Configuration
 *
 * Central configuration for API endpoints, limits, and constants.
 */

const CONFIG = (function() {
  const props = PropertiesService.getScriptProperties();
  return {
    TRIAL_API_BASE_URL: props.getProperty("TRIAL_API_BASE_URL") || "https://townshipcanada.com/api/integrations/trial",
    PAID_API_BASE_URL: props.getProperty("PAID_API_BASE_URL") || "https://developer.townshipcanada.com",
    MAX_BATCH_SIZE: 200,
    ADDON_VERSION: "1.1.0",
    TRIAL_URL: "https://townshipcanada.com/api/try?ref=sheets"
  };
})();

/**
 * Get the stored API key (trial or paid).
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
 * Check if the stored API key is a trial key.
 * Trial keys use the prefix "tc_trial_".
 */
function isTrialKey() {
  return getApiKey().indexOf("tc_trial_") === 0;
}

/**
 * Get the appropriate API base URL based on the key type.
 * Trial keys use the integration trial endpoint;
 * paid keys use the developer API.
 */
function getApiBaseUrl() {
  return isTrialKey() ? CONFIG.TRIAL_API_BASE_URL : CONFIG.PAID_API_BASE_URL;
}
