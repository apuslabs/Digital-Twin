export enum Category {
  Politics = 'Politics',
  Entertainment = 'Entertainment',
  Science = 'Science',
  Tech = 'Tech',
}

export interface Figure {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  systemPrompt: string;
  config: string; 
  category: Category;
  welcomeMessage: string | (() => string); // Can be static string or dynamic function
  contributors: number;
  processId: string; // AO process ID for this character's agent
  arweaveTxId: string; // Arweave transaction ID for permanent prompt storage
}

export enum MessageAuthor {
    User = 'user',
    AI = 'ai'
}

export interface ChatMessage {
    id: string;
    text: string;
    author: MessageAuthor | string; // Allow both enum and figure name
}

export enum ShareCategory {
  UNHINGED = 'UNHINGED',
  UNEXPECTEDLY_WHOLESOME = 'UNEXPECTEDLY_WHOLESOME',
  ODDLY_SPECIFIC = 'ODDLY_SPECIFIC',
  MOST_CURSED = 'MOST_CURSED',
  TERRIBLE_ADVICE = 'TERRIBLE_ADVICE',
  OUT_OF_CHARACTER = 'OUT_OF_CHARACTER',
}

export interface CategoryMetadata {
  emoji: string;
  label: string;
  color: string;
  moodImage: 'happy' | 'sad' | 'angry';
}

export const CATEGORY_METADATA: Record<ShareCategory, CategoryMetadata> = {
  [ShareCategory.UNHINGED]: {
    emoji: '🔥',
    label: 'UNHINGED',
    color: '#f97316',
    moodImage: 'angry',
  },
  [ShareCategory.UNEXPECTEDLY_WHOLESOME]: {
    emoji: '💕',
    label: 'UNEXPECTEDLY WHOLESOME',
    color: '#ec4899',
    moodImage: 'happy',
  },
  [ShareCategory.ODDLY_SPECIFIC]: {
    emoji: '🎯',
    label: 'ODDLY SPECIFIC',
    color: '#3b82f6',
    moodImage: 'happy',
  },
  [ShareCategory.MOST_CURSED]: {
    emoji: '🤯',
    label: 'MOST CURSED',
    color: '#a855f7',
    moodImage: 'angry',
  },
  [ShareCategory.TERRIBLE_ADVICE]: {
    emoji: '💼',
    label: 'TERRIBLE ADVICE',
    color: '#64748b',
    moodImage: 'sad',
  },
  [ShareCategory.OUT_OF_CHARACTER]: {
    emoji: '🎭',
    label: 'OUT OF CHARACTER',
    color: '#14b8a6',
    moodImage: 'sad',
  },
};