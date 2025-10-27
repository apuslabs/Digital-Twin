/**
 * Google Analytics tracking utility
 * 
 * This module provides functions to track user interactions with Google Analytics.
 * Make sure GA is initialized in index.html with gtag.js
 */

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Track a custom event in Google Analytics
 */
const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  } else {
    console.warn('Google Analytics not initialized');
  }
};

/**
 * 1. Track chats per character
 * 
 * @param characterName - Name of the character/twin
 * @param messageCount - Number of messages in the conversation
 */
export const trackChatPerCharacter = (
  characterName: string,
  messageCount: number
) => {
  trackEvent('chat_per_character', {
    event_category: 'Chat',
    event_label: characterName,
    character_name: characterName,
    message_count: messageCount,
  });
};

/**
 * 2. Track prompt submission and token rewards distributed
 * 
 * @param characterName - Name of the character/twin
 * @param rewardAmount - Amount of tokens distributed
 */
export const trackPromptSubmissionWithReward = (params: {
  characterName: string;
  rewardAmount: number;
}) => {
  trackEvent('prompt_submission_reward', {
    event_category: 'Contribution',
    event_label: params.characterName,
    character_name: params.characterName,
    reward_amount: params.rewardAmount,
  });
};

/**
 * 3. Track social shares
 * 
 * @param shareType - Type of share action ('x', 'download')
 * @param characterName - Name of the character/twin
 */
export const trackSocialShare = (params: {
  shareType: 'x' | 'download';
  characterName: string;
}) => {
  trackEvent('social_share', {
    event_category: 'Social',
    event_label: `${params.shareType}_${params.characterName}`,
    share_type: params.shareType,
    character_name: params.characterName,
  });
};
