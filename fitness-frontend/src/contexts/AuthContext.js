import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak, { initKeycloak } from '../services/keycloak';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserWithBackend = async (keycloakUser) => {
    try {
      const userProfile = {
        id: keycloakUser.sub,
        username: keycloakUser.preferred_username || keycloakUser.email,
        email: keycloakUser.email,
        firstName: keycloakUser.given_name || '',
        lastName: keycloakUser.family_name || ''
      };
      
      // First try to sync with backend
      try {
        const response = await authService.syncUser(userProfile);
        setUser(response.data);
        return response.data;
      } catch (syncError) {
        console.log('Sync endpoint not available, trying profile update...');
        // If sync fails, try regular profile update
        const profileResponse = await authService.updateProfile(userProfile);
        setUser(profileResponse.data);
        return profileResponse.data;
      }
    } catch (error) {
      console.error('User sync failed:', error);
      // Fallback: use Keycloak user info
      setUser({
        id: keycloakUser.sub,
        username: keycloakUser.preferred_username || keycloakUser.email,
        email: keycloakUser.email,
        firstName: keycloakUser.given_name || '',
        lastName: keycloakUser.family_name || ''
      });
      return userProfile;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const initialized = await initKeycloak();
        if (initialized) {
          setAuthenticated(true);
          
          // Sync user with backend
          await syncUserWithBackend(keycloak.tokenParsed);
        }
      } catch (error) {
        console.error('Keycloak initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Token refresh handler
    const onTokenExpired = () => {
      keycloak.updateToken(70).then((refreshed) => {
        if (refreshed) {
          console.log('Token refreshed');
        }
      }).catch(() => {
        console.error('Failed to refresh token');
        logout();
      });
    };

    keycloak.onTokenExpired = onTokenExpired;

    // Cleanup
    return () => {
      keycloak.onTokenExpired = null;
    };
  }, []);

  const login = () => {
    keycloak.login();
  };

  const logout = () => {
    keycloak.logout();
  };

  const getToken = () => {
    return keycloak.token;
  };

  const value = {
    authenticated,
    user,
    login,
    logout,
    getToken,
    hasRole: (role) => keycloak.hasRealmRole(role),
    token: keycloak.token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};