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
  welcomeMessage: string;
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