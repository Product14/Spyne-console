export type SoldEntry = { soldAt: Date }

class SoldVehiclesStore {
  private store = new Map<string, SoldEntry>()
  private listeners = new Set<() => void>()

  mark(vin: string) {
    this.store.set(vin, { soldAt: new Date() })
    this.notify()
  }

  unmark(vin: string) {
    this.store.delete(vin)
    this.notify()
  }

  isSold(vin: string) {
    return this.store.has(vin)
  }

  getEntry(vin: string) {
    return this.store.get(vin)
  }

  getAll(): Map<string, SoldEntry> {
    return new Map(this.store)
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private notify() {
    this.listeners.forEach((f) => f())
  }
}

export const soldVehiclesStore = new SoldVehiclesStore()
