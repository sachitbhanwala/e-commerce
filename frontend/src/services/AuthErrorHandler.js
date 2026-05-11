/**
 * Centralized auth error handling
 */
export const handleAuthError = (status) => {
  if (status === 401 || status === 403) {
    // Clear auth state if we get 401/403
    console.log('Received 401/403, clearing auth state');
    localStorage.removeItem('ecommerce-auth-token');
    localStorage.removeItem('ecommerce-auth-known');
    localStorage.removeItem('ecommerce-current-user');
  }
};
