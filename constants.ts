import { Category, Figure } from './types';
import { Trump_Prompt,GeorgeOrwell_Prompt,Obama_Prompt,AynRand_Prompt } from './services/prompts';

export const CATEGORIES: Category[] = [
    Category.Politics,
    Category.Entertainment,
    Category.Science,
    Category.Tech,
];

export const FIGURES: Figure[] = [
  {
    id: 'donald_trump',
    name: 'Donald Trump',
    title: '47th U.S. President',
    imageUrl: '/resources/trump.png',
    category: Category.Politics,
    systemPrompt: Trump_Prompt,
    welcomeMessage: 'It\'s great to be here, truly fantastic. People are saying this is the best chat they\'ve ever seen. What\'s on your mind? Let\'s make this chat great again.',
    contributors: 2451,
    processId: 'bI6_qOobuHJBHMEubTLv3lmLHUfK043S4-kN0q_wt3E',
    arweaveTxId: 'FhD4xbfkCkCb19BGUMduQCqmtirFCIcDUAeC0fenzbE',
    config: `{
    }`
  },
  {
    id: 'george_orwell',
    name: 'George Orwell',
    title: 'Author of 1984',
    imageUrl: '/resources/George orwell.png',
    category: Category.Entertainment,
    systemPrompt: GeorgeOrwell_Prompt,
    welcomeMessage: 'Freedom begins with thought. What thoughts trouble you?',
    contributors: 1984,
    processId: '',
    arweaveTxId: 'ORWELL_ARWEAVE_TX_ID',
    config: `{
    }`
  },
  {
    id: 'barack_obama',
    name: 'Barack Obama',
    title: '44th U.S. President',
    imageUrl: '/resources/obama.png',
    category: Category.Politics,
    systemPrompt: Obama_Prompt,
    welcomeMessage: 'Hello. It\'s a pleasure to connect with you. In the spirit of dialogue and understanding, I\'m here to listen. What can we talk about today?',
    contributors: 1873,
    processId: '',
    arweaveTxId: 'BO-PROMPT-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d',
    config: `{
    }`
  },
  {
    id: 'ayn_rand',
    name: 'Ayn Rand',
    title: 'Writer and Philosopher',
    imageUrl: '/resources/Ayan.png',
    category: Category.Entertainment,
    systemPrompt: AynRand_Prompt,
    welcomeMessage: 'The question is not who is going to let me; it’s who is going to stop me. What do you wish to discuss?',
    contributors: 1957,
    processId: '',
    arweaveTxId: 'RAND_ARWEAVE_TX_ID',
    config: `{
    }`
  },
];