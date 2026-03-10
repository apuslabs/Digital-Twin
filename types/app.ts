export type View = "selector" | "chat" | "competition" | "contest";

export type TagOption = {
  emoji: string;
  label: string;
  color: string;
};

export type PostOption = {
  tag: TagOption;
  text: string;
};

export type PrivateTwinPostSummary = {
  id: string;
  text: string;
  createdAt: string;
  url?: string;
  likeCount?: number;
  retweetCount?: number;
  replyCount?: number;
  quoteCount?: number;
};

export type PrivateTwinProfile = {
  id?: string;
  name: string;
  userName: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
  followers?: number;
  following?: number;
  createdAt?: string;
  isBlueVerified?: boolean;
  about: Record<string, unknown>;
};

export type PrivateTwinData = {
  profile: PrivateTwinProfile;
  posts: PrivateTwinPostSummary[];
  personalContext: string;
  sourceLink: string;
  systemPrompt: string;
  welcomeMessage: string;
};

export type FineTuneMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type FineTuneExample = {
  messages: FineTuneMessage[];
};

export type PrivateTwinDataset = {
  personaSummary: string;
  styleGuide: string[];
  trainingExamples: FineTuneExample[];
  systemPrompt: string;
  generatedAt: string;
  model?: string;
};

export type PrivateTwinWorkspace = {
  raw: PrivateTwinData;
  dataset?: PrivateTwinDataset;
};
