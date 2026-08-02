export const DEPARTMENT_COLORS: string[] = [
  "#ef4444", // vermelho
  "#f97316", // laranja
  "#f59e0b", // âmbar
  "#eab308", // amarelo
  "#84cc16", // lima
  "#22c55e", // verde
  "#10b981", // esmeralda
  "#14b8a6", // verde-azulado
  "#06b6d4", // ciano
  "#0ea5e9", // azul-claro
  "#3b82f6", // azul
  "#6366f1", // índigo
  "#8b5cf6", // violeta
  "#92400e", // marrom
  "#d946ef", // fúcsia
  "#ec4899", // rosa
  "#f43f5e", // rosa-avermelhado
  "#b91c1c", // vermelho escuro
  "#15803d", // verde escuro
  "#1d4ed8", // azul escuro
];

export function getReadableTextColor(hex: string): "#000000" | "#ffffff" {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const toLinear = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);

  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > 0.45 ? "#000000" : "#ffffff";
}
