import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn-style class merger: later classes win over earlier conflicting ones
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
