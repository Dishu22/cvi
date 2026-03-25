export const loginWithGoogle = () => {
  const redirectUrl = window.location.origin + '/dashboard';
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};

export const logout = async () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  try {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
  }
};