// server/config/storage.config.ts

export type StorageStrategy = 'database' | 'filesystem';

export const STORAGE_STRATEGY: StorageStrategy = (process.env.STORAGE_STRATEGY as StorageStrategy) || 'filesystem';

export const getStorageStrategy = (): StorageStrategy => {
  return STORAGE_STRATEGY;
};

export const isFileSystemStrategy = (): boolean => {
  return STORAGE_STRATEGY === 'filesystem';
};

export const isDatabaseStrategy = (): boolean => {
  return STORAGE_STRATEGY === 'database';
};