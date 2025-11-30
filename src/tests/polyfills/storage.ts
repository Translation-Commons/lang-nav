// Some dependencies (notably MSW) expect browser Storage APIs to exist. Provide a minimal in-memory
// implementation so Vitest's jsdom environment doesn't crash when they are accessed.
function createMemoryStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(store).length;
    },
    clear() {
      store = {};
    },
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    key(index) {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    },
    removeItem(key) {
      delete store[key];
    },
    setItem(key, value) {
      store[key] = value;
    },
  };
}

['localStorage', 'sessionStorage'].forEach((name) => {
  const storageName = name as 'localStorage' | 'sessionStorage';
  const storage = createMemoryStorage();
  Object.defineProperty(globalThis, storageName, {
    value: storage,
    configurable: true,
    writable: true,
  });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, storageName, {
      value: storage,
      configurable: true,
      writable: true,
    });
  }
});
