// server/config/storage.config.ts

export type StorageStrategy = 'database' | 'filesystem';

// Default to database so new writes go to MongoDB. You can override with STORAGE_STRATEGY env var.
export const STORAGE_STRATEGY: StorageStrategy = (process.env.STORAGE_STRATEGY as StorageStrategy) || 'database';

export const getStorageStrategy = (): StorageStrategy => {
  return STORAGE_STRATEGY;
};

export const isFileSystemStrategy = (): boolean => {
  return STORAGE_STRATEGY === 'filesystem';
};

export const isDatabaseStrategy = (): boolean => {
  return STORAGE_STRATEGY === 'database';
};