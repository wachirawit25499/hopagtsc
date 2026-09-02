export const REPAIRS_CHANGED_EVENT = "repairs:changed";

export function notifyRepairsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(REPAIRS_CHANGED_EVENT));
  }
}
