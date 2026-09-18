export const MENU_ORIGINS = ["home", "options", "experience"] as const;

export type MenuOrigin = (typeof MENU_ORIGINS)[number];

export function parseMenuOrigin(value: string | string[] | undefined): MenuOrigin {
  const candidate = Array.isArray(value) ? value[0] : value;
  return MENU_ORIGINS.includes(candidate as MenuOrigin)
    ? (candidate as MenuOrigin)
    : "options";
}

export function originHref(origin: MenuOrigin): string {
  if (origin === "experience") return "/experience";
  if (origin === "home") return "/";
  return "/options";
}
