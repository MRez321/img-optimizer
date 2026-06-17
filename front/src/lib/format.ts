export const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(val < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

export const formatPercent = (n: number): string => `${n.toFixed(1)}%`;

export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
