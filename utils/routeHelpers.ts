export const isContestRoute = (): boolean => {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.toLowerCase();
  return path.includes("contest") || path.includes("outofcontext");
};
