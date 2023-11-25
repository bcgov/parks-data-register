(function (window) {
  window.__env = window.__env || {};

  window.__env.logLevel = 0; // All

  // Get config from remote host?
  window.__env.configEndpoint = false;

  // Environment name
  window.__env.ENVIRONMENT = "local"; // local | dev | test | prod

  window.__env.API_LOCATION = "https://zloys5cfvf.execute-api.ca-central-1.amazonaws.com";
  window.__env.API_PATH = "/api";
  window.__env.GH_HASH = "local-build";
  window.__env.KEYCLOAK_CLIENT_ID = "data-register";
  window.__env.KEYCLOAK_URL = "https://dev.loginproxy.gov.bc.ca/auth";
  window.__env.KEYCLOAK_REALM = "bcparks-service-transformation";
  window.__env.KEYCLOAK_ENABLED = true;
  window.__env.API_KEY = "GsVlO8cCiHdhvmigTJLGa7QLibEH6Av72tLZy7K3";

  // Add any feature-toggles
  // window.__env.coolFeatureActive = false;
})(this);
