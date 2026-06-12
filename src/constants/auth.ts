/** Ключ сессии в sessionStorage */
export const AUTH_STORAGE_KEY = "growth-sp-viz-authenticated";

/** Токен после успешного входа (не храните пароль в storage) */
export const AUTH_SESSION_TOKEN = "growth-sp-viz-session-v1";

const APP_PASSWORD = "admin1234";

export function verifyPassword(input: string): boolean {
  return input === APP_PASSWORD;
}

export function isAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === AUTH_SESSION_TOKEN;
  } catch {
    return false;
  }
}

export function setAuthenticated(): void {
  sessionStorage.setItem(AUTH_STORAGE_KEY, AUTH_SESSION_TOKEN);
}

export function clearAuthentication(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
