/**
 * Simple typed local storage wrapper.
 * Falls back to in-memory if localStorage is unavailable.
 */
const memoryStore = new Map<string, string>();

function getStorage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

export function getItem<T>(key: string, fallback: T): T {
  const store = getStorage();
  if (store) {
    try {
      const raw = store.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {}
  } else {
    const raw = memoryStore.get(key);
    if (raw !== undefined) return JSON.parse(raw) as T;
  }
  return fallback;
}

export function setItem<T>(key: string, value: T): void {
  const store = getStorage();
  const raw = JSON.stringify(value);
  if (store) {
    try {
      store.setItem(key, raw);
    } catch {}
  } else {
    memoryStore.set(key, raw);
  }
}

export function removeItem(key: string): void {
  const store = getStorage();
  if (store) {
    try {
      store.removeItem(key);
    } catch {}
  }
  memoryStore.delete(key);
}
