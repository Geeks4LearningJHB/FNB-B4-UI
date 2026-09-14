import { Injectable, effect, signal } from '@angular/core';

const DARK_MODE_KEY = 'ibs.darkMode';
const HIDE_BALANCE_KEY = 'ibs.hideBalance';

function readBool(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false; // localStorage unavailable (private mode, etc.) — fall back to defaults
  }
}

function writeBool(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore — nothing sensible to do if storage is blocked
  }
}

/** App-wide UI preferences (dark mode, balance visibility) shared between the shell
 *  (titlebar/settings modal) and routed pages (dashboard's balance card) that live
 *  on opposite sides of the router-outlet boundary. Persisted to localStorage so a
 *  reload doesn't silently reset the theme back to light. */
@Injectable({ providedIn: 'root' })
export class UiSettingsService {
  darkMode = signal(readBool(DARK_MODE_KEY));
  hideBalance = signal(readBool(HIDE_BALANCE_KEY));

  constructor() {
    effect(() => writeBool(DARK_MODE_KEY, this.darkMode()));
    effect(() => writeBool(HIDE_BALANCE_KEY, this.hideBalance()));
  }
}
