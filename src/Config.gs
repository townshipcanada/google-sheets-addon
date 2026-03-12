/**
 * Township Canada Google Sheets Add-On - Configuration
 *
 * Central configuration for API endpoints, limits, and constants.
 */

var CONFIG = (function() {
  var props = PropertiesService.getScriptProperties();
  return {
    API_BASE_URL: props.getProperty("API_BASE_URL") || "https://app.townshipcanada.com/api/integrations/sheets",
    FREE_MONTHLY_LIMIT: 10,
    MAX_BATCH_SIZE: 200,
    ADDON_VERSION: "1.0.0"
  };
})();

/**
 * Get or create a unique installation ID for this add-on instance.
 * Stored in user properties so it persists across sessions.
 */
function getInstallationId() {
  var props = PropertiesService.getUserProperties();
  var id = props.getProperty("INSTALLATION_ID");
  if (!id) {
    id = Utilities.getUuid();
    props.setProperty("INSTALLATION_ID", id);
  }
  return id;
}

/**
 * Get the stored API key (if user has connected one).
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
