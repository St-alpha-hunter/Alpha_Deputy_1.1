import type { FactorProps } from "../Components/Factor/Factor";

export const searchFactors = async (query: string): Promise<FactorProps[]> => {
  const response = await fetch(`/api/factor?query=${query}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  if (!response.ok) throw new Error("Search failed");
  return await response.json();
};