import { TagOption } from "../types/app";

export function makeHashtag(tag: TagOption): string {
  const compact = tag.label.toUpperCase().replace(/[^A-Z0-9]+/g, "");
  return `#${tag.emoji}${compact}`;
}

export function makePrefix(label: string): string {
  const upper = label.toUpperCase();
  if (upper.includes("UNHINGED")) return "Wow what a time to be alive.";
  if (upper.includes("WHOLESOME"))
    return "Did not expect this, but it's kind of perfect.";
  if (upper.includes("ODDLY")) return "Why is this so oddly specific?";
  if (upper.includes("CURSED"))
    return "I regret reading this with my own eyes.";
  if (upper.includes("ADVICE")) return "Absolutely do not do this.";
  if (upper.includes("OUT OF CHARACTER"))
    return "This is so out of character it's scary.";
  return "This twin just surprised me.";
}
