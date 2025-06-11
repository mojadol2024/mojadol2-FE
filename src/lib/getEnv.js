export function getEnv(key, fallback = '') {
  if (typeof window !== 'undefined') {
    const env = window._env_ || {};
    
    // OS 감지
    const platform = navigator.platform.toLowerCase();
    const isMac = platform.includes('mac');
    const isWindows = platform.includes('win');

    // OS별 키 지정
    const osKey = isMac
      ? `${key}_MAC`
      : isWindows
      ? `${key}_WIN`
      : key; // 기본값

    // OS에 맞는 키 우선 반환
    if (env[osKey]) return env[osKey];

    // 없으면 일반 키 시도
    if (env[key]) return env[key];
  }
  return fallback;
}
