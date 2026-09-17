export type MenuOrigin = "home" | "options" | "experience";

const ORIGIN_DESTINATIONS: Record<MenuOrigin, string> = {
  home: "/",
  options: "/options",
  experience: "/experience",
};

export function parseMenuOrigin(value: string | string[] | undefined): MenuOrigin {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "experience" || candidate === "home" ? candidate : "options";
}

export function originDestination(origin: MenuOrigin): string {
  return ORIGIN_DESTINATIONS[origin];
}

export function withOrigin(path: string, origin: MenuOrigin): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}origin=${origin}`;
}
