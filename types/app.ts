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
