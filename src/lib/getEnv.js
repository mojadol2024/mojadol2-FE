export function getEnv(key, fallback = '') {
  if (typeof window !== 'undefined' && window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  return process.env[`REACT_APP_${key}`] || fallback;
}
