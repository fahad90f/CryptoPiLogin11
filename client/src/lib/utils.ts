import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD", digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercentage(value: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value / 100);
}

export function formatCryptoAmount(value: number, symbol: string): string {
  // Handle different crypto formats
  if (symbol === "BTC") {
    return `${value.toFixed(8)} ${symbol}`;
  } else if (["ETH", "BNB", "SOL"].includes(symbol)) {
    return `${value.toFixed(6)} ${symbol}`;
  } else {
    return `${value.toFixed(2)} ${symbol}`;
  }
}

export function formatCompactNumber(value: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  });
  return formatter.format(value);
}

export function getPercentageClass(value: number): string {
  return value >= 0 ? "text-success" : "text-error";
}

export function getPercentageIcon(value: number): string {
  return value >= 0 ? "arrow-up" : "arrow-down";
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return "";
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function getRandomColor(index: number): string {
  const colors = [
    "bg-primary text-primary-foreground",
    "bg-accent text-accent-foreground",
    "bg-destructive text-destructive-foreground",
    "bg-yellow-500 text-black",
    "bg-green-500 text-black",
  ];
  
  return colors[index % colors.length];
}
