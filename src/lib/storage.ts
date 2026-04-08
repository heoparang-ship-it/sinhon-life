const STORAGE_KEY = "sinhon-saved";

interface SavedItem {
  id: string;
  type: "policy";
  savedAt: number;
}

function getSavedItems(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setSavedItems(items: SavedItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function saveItem(id: string, type: "policy" = "policy") {
  const items = getSavedItems();
  if (!items.some((i) => i.id === id)) {
    items.push({ id, type, savedAt: Date.now() });
    setSavedItems(items);
  }
}

export function removeItem(id: string) {
  const items = getSavedItems().filter((i) => i.id !== id);
  setSavedItems(items);
}

export function isItemSaved(id: string): boolean {
  return getSavedItems().some((i) => i.id === id);
}

export function getSavedIds(): string[] {
  return getSavedItems().map((i) => i.id);
}
