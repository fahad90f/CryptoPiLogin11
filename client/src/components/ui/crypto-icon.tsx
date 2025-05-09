import { getRandomColor } from "@/lib/utils";

interface CryptoIconProps {
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CryptoIcon({ symbol, size = "md", className = "" }: CryptoIconProps) {
  // Get a deterministic color based on the symbol
  const colorIndex = symbol.charCodeAt(0) % 5;
  const bgColorClass = getRandomColor(colorIndex);
  
  // Map size to class
  const sizeClass = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm"
  };
  
  return (
    <div className={`${sizeClass[size]} rounded-full ${bgColorClass} flex items-center justify-center font-bold ${className}`}>
      {symbol}
    </div>
  );
}
