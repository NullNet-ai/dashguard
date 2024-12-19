import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Camel Case
export function formatAndCapitalize(entityName: string): string {
  if (!entityName) return "";
  return entityName
    .split(/[_-]/) // Split by both underscore and hyphen
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatTabName(tab_name: string): string {
  if (!tab_name) return "";
  if (tab_name.startsWith(tab_name.charAt(0).toUpperCase())) return tab_name;
  return tab_name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
export function formatFormTestID(id: string) {
  return id.replace(/[\s,]+/g, "-").toLowerCase();
}
