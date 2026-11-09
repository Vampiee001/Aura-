import { OfflineAction } from '../types';

const OFFLINE_QUEUE_KEY = 'aura_offline_action_queue_v1';

export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): OfflineAction {
  const current = getOfflineQueue();
  const newAction: OfflineAction = {
    ...action,
    id: `off-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleTimeString(),
    synced: false
  };
  const updated = [newAction, ...current];
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to write offline action:', e);
  }
  return newAction;
}

export async function syncOfflineQueueToServer(): Promise<{ count: number; success: boolean }> {
  const current = getOfflineQueue();
  const unsynced = current.filter(a => !a.synced);
  if (unsynced.length === 0) {
    return { count: 0, success: true };
  }

  // Simulate network dispatch with latency
  await new Promise(r => setTimeout(r, 700));

  const syncedList = current.map(a => ({ ...a, synced: true }));
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(syncedList));
  } catch (e) {}

  return { count: unsynced.length, success: true };
}

export function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}
