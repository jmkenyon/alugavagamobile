
// app/utils/locationUtils.ts

export function formatLocation(locationValue: string): string {
    if (!locationValue) return "";
  
    const parts = locationValue.split(",").map((p) => p.trim());
    const cityStateIndex = parts.findIndex((p) => p.includes(" - "));
    if (cityStateIndex === -1) return locationValue; // fallback
  
    let before = parts[cityStateIndex - 1] || "";
    let cityState = parts[cityStateIndex];
  
    before = before.replace(/\d+/g, "").trim();
  
    // Normalize helper to compare without accents/case
    const normalize = (str: string) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
  
    // Example: "Rio de Janeiro - Rio de Janeiro" → "Rio de Janeiro"
    if (cityState.includes(" - ")) {
      const [left, right] = cityState.split(" - ").map((p) => p.trim());
      if (normalize(left) === normalize(right)) {
        cityState = left;
      }
    }
  
    return `${before} ${cityState}`.trim();
  }