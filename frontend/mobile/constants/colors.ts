export const Colors = {
  navy950: "#0a0f1a",
  navy900: "#111827",
  navy800: "#1e293b",
  navy700: "#334155",
  navy600: "#475569",

  orange500: "#f97316",
  orange400: "#fb923c",
  orange600: "#ea580c",

  teal500: "#14b8a6",
  teal400: "#2dd4bf",

  danger: "#ef4444",
  dangerLight: "#fca5a5",
  warning: "#f59e0b",
  success: "#22c55e",
  successLight: "#86efac",

  white: "#ffffff",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",

  transparent: "transparent",
};

export const Severity = {
  LOW: Colors.success,
  MEDIUM: Colors.warning,
  HIGH: Colors.orange500,
  CRITICAL: Colors.danger,
};

export const EmergencyStatus = {
  ACTIVE: Colors.danger,
  RESOLVED: Colors.success,
  ESCALATED: Colors.orange500,
};
