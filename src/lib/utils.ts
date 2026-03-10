import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function getCategoryColor(category?: string): string {
  switch (category) {
    case "travel":
      return "#a78bfa";
    case "career":
      return "#f9a8d4";
    case "achievement":
      return "#67e8f9";
    case "education":
      return "#fbbf24";
    case "life":
      return "#34d399";
    default:
      return "#a78bfa";
  }
}

export function getCategoryIcon(category?: string): string {
  switch (category) {
    case "travel":
      return "✈";
    case "career":
      return "💼";
    case "achievement":
      return "🏆";
    case "education":
      return "🎓";
    case "life":
      return "🏠";
    default:
      return "📌";
  }
}
