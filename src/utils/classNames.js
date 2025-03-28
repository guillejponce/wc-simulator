/**
 * Merges multiple class name strings, filtering out falsy values
 * Similar to the classnames/clsx libraries
 * 
 * @param {...string} classes - Class names to merge
 * @returns {string} - Merged class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
} 