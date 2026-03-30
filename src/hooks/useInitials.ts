export const getInitials = (name?: string | null) => {
  if (!name) return "DR";

  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() ?? "DR";

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}