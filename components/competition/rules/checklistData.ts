export interface ChecklistItemData {
  id: number;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
}

export const checklistItems: ChecklistItemData[] = [
  {
    id: 1,
    icon: "ph-[eye-slash]",
    iconColor: "text-red-500",
    title: "Redact sensitive info",
    description:
      "Use image editing tools or blur features to cover up any wallet addresses, transaction IDs, or other personally identifiable information. This protects your privacy and keeps submissions safe for public viewing.",
  },
  {
    id: 2,
    icon: "ph-[info]",
    iconColor: "text-blue-500",
    title: "Tag your moment",
    description:
      'Include the name of the Digital Twin you were chatting with (e.g., "Satoshi", "Obama", "Ayn Rand"). Select the category tag that best matches the moment—whether it\'s unhinged, wholesome, oddly specific, cursed, advice, or out of character. This helps judges quickly understand your submission.',
  },
  {
    id: 3,
    icon: "ph-[sparkle]",
    iconColor: "text-amber-500",
    title: "One moment per entry",
    description:
      "Focus on quality over quantity. Each submission should highlight a single standout moment from your conversation. If you have multiple great moments, submit them separately so the Fwd Research marketing team can review each one fairly.",
  },
  {
    id: 4,
    icon: "ph-[smiley]",
    iconColor: "text-emerald-500",
    title: "Keep it fun and clean",
    description:
      "This competition is meant to be fun and entertaining. Keep submissions lighthearted and respectful. Any content that includes hate speech, harassment, doxxing, or other harmful material will be disqualified. Let's keep the community positive and enjoyable for everyone.",
  },
  {
    id: 5,
    icon: "ph-[target]",
    iconColor: "text-indigo-500",
    title: "What counts in the competition",
    description:
      "Screenshots or snippets from your Twin chats that feel out-of-context, unhinged, eerily accurate, or just hilariously wrong.",
  },
  {
    id: 6,
    icon: "ph-[gavel]",
    iconColor: "text-purple-500",
    title: "How judging works",
    description:
      "The Fwd Research marketing team reviews entries for originality, entertainment, and category fit. Winning posts are featured during the event.",

  },
];
