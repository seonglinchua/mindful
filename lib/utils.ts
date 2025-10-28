/**
 * Combines multiple class names into a single string, filtering out falsy values
 * Useful for conditionally applying CSS classes
 *
 * @param classes - Array of class names or falsy values
 * @returns Combined class name string with falsy values removed
 *
 * @example
 * cn("base", "active", false, null) // Returns "base active"
 *
 * @example
 * // Conditional classes
 * const isActive = true;
 * cn("btn", isActive && "btn-active") // Returns "btn btn-active"
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
