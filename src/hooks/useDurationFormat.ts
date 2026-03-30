export const formatDuration = (seconds?: number | null): string => {
    if (!seconds || seconds <= 0) return "-";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];

    if (hours > 0) {
      parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    }

    if (minutes > 0) {
      parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    }

    if (hours === 0 && secs > 0) {
      parts.push(`${secs} second${secs > 1 ? "s" : ""}`);
    }

    return parts.join(" ");
  };