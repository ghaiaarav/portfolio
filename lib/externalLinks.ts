export function needsExternalConfirm(href: string | undefined | null): boolean {
  if (!href) return false;
  const value = href.trim();
  if (!value || value.startsWith("#")) return false;
  if (value.startsWith("mailto:") || value.startsWith("tel:")) return false;
  if (value.startsWith("/") && !/\.pdf($|\?)/i.test(value)) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//") ||
    /\.pdf($|\?)/i.test(value)
  );
}
