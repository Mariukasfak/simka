import { z } from 'zod';

/**
 * Checks if the provided string is a valid image Data URI.
 * Allowed formats: png, jpeg, jpg, gif, webp.
 * @param uri The string to validate.
 * @returns true if it is a valid image Data URI, false otherwise.
 */
export const isValidDataUri = (uri: string): boolean => {
  if (!uri || typeof uri !== 'string') return false;

  // Regex to match data:image/<type>;base64,<data>
  // We allow standard base64 characters.
  const regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,([A-Za-z0-9+/=]+)$/;
  return regex.test(uri);
};

// Zod schema for validation
export const dataUriSchema = z.string().refine(isValidDataUri, {
  message: "Invalid image data URI. Must be a base64 encoded png, jpeg, jpg, gif, or webp image.",
});
