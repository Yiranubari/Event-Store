export interface StoredEvent {
  id: string;
  createdAt: string; // ISO 8601 timestamp
  [key: string]: unknown;
}
export interface IndexEntry {
  offset: number;
  length: number;
}
export interface StoreStats {
  total: number;
  bytes: number;
}
