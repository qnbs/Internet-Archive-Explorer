

export const formatBytes = (bytesStr?: string, decimals = 2): string => {
    const bytes = Number(bytesStr);
    if (!bytes || isNaN(bytes) || bytes === 0) return 'N/A';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Formats a number into a compact, human-readable string (e.g., 1200 -> '1.2k').
 * @param num The number to format.
 * @returns A formatted string.
 */
export const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return '0';
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
};

/**
 * Formats an identifier (like an email or a name) for display.
 * If it's an email, it returns the part before the '@'.
 * Otherwise, it returns the original string.
 * @param identifier The identifier string to format.
 * @returns A display-friendly version of the identifier.
 */
export const formatIdentifierForDisplay = (identifier: string): string => {
  if (identifier.includes('@')) {
    return identifier.split('@')[0];
  }
  return identifier;
};