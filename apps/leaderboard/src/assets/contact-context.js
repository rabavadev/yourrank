export function resolveContactType({ helpTab, queryType, serverType } = {}) {
  const explicitType = helpTab || queryType;
  if (explicitType === "feedback" || explicitType === "support") return explicitType;
  if (serverType === "feedback" || serverType === "support") return serverType;
  return "support";
}
