import type { FactorProps } from "../Components/Factor/Factor";

export const searchFactors = async (query: string): Promise<FactorProps[]> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/factor?query=${query}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  if (!response.ok) throw new Error("Search failed");
  return await response.json();
};