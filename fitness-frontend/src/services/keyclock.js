import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: process.env.REACT_APP_KEYCLOAK_REALM,
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID
};

const keycloak = new Keycloak(keycloakConfig);

export const initKeycloak = () => {
  return keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256',
    flow: 'standard'
  });
};

export default keycloak;