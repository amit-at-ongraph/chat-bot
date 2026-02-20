/**
 * Configuration for file upload functionality
 * This file contains settings that can be easily modified for upload behavior
 */

/**
 * Prefix identifier for manually created files (paste text)
 * Files created from pasted content will use this prefix in their filename
 * Example: If prefix is "manual-entry", files will be named like "manual-entry-1234567890.txt"
 */
export const MANUAL_FILE_PREFIX = "manual-entry";

/**
 * Checks if a filename is a manually created file based on the prefix
 * @param fileName - The filename to check
 * @returns true if the file is manually created, false otherwise
 */
export function isManualFile(fileName: string): boolean {
  return fileName.startsWith(`${MANUAL_FILE_PREFIX}-`);
}

/**
 * Generates a filename for a manually created file
 * @param extension - File extension (default: "txt")
 * @returns A filename with the manual prefix and timestamp
 */
export function generateManualFileName(extension: string = "txt"): string {
  return `${MANUAL_FILE_PREFIX}-${Date.now()}.${extension}`;
}
