import Keycloak from "keycloak-js";

const keycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    pkceMethod: 'S256',
    checkLoginIframe: false
  };

export const keycloakInstance = new Keycloak(keycloakConfig);