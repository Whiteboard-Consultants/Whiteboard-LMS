type Entry = { value: unknown; expires: number; generation: number };

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
let generation = 0;

export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now && hit.generation === generation) return Promise.resolve(hit.value as T);
  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;
  const started = generation;
  const next = load()
    .then((value) => {
      if (started === generation) store.set(key, { value, expires: Date.now() + ttlMs, generation: started });
      return value;
    })
    .finally(() => {
      if (inflight.get(key) === next) inflight.delete(key);
    });
  inflight.set(key, next);
  return next;
}

export function clearCrmCache() {
  generation += 1;
  store.clear();
  inflight.clear();
}
