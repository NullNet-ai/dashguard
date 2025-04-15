import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { menu_tab_name } from '~/server/menu/menu_tab_name';

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
  if(menu_tab_name[tab_name]) return menu_tab_name[tab_name];
  if (!tab_name) return "";
  if (tab_name.startsWith(tab_name.charAt(0).toUpperCase())) return tab_name;
  const result = tab_name
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  if (/\d/.exec(result)) {
    return result.toUpperCase()
  }


  return result
}

export function formatGridTabName(tab_name: string): string {
  if(menu_tab_name[tab_name]) return menu_tab_name[tab_name];
  if (!tab_name) return "";
  if (tab_name.startsWith(tab_name.charAt(0).toUpperCase())) return tab_name;
  const result = tab_name
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");


  return result
}

export function formatFormTestID(id: string) {
  return id.replace(/[\s,]+/g, "-").toLowerCase();
}
