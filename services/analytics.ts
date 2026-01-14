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
 * 3. Track share button clicks
 * 
 * Tracks when "Share Your Out of Context Card" button is clicked.
 * Includes tooltip context to measure tooltip effectiveness.
 * 
 * @param characterName - Name of the character/twin
 * @param tooltipShown - Whether the tooltip was visible when button was clicked
 */
export const trackShareButtonClick = (params: {
  characterName: string;
  tooltipShown: boolean;
}) => {
  trackEvent('share_button_click', {
    event_category: 'Social',
    event_label: params.characterName,
    character_name: params.characterName,
    tooltip_shown: params.tooltipShown,
  });
};

/**
 * 4. Track share actions (copy to X or download)
 * 
 * Tracks when user shares via "Copy to X" or "Download".
 * Also fires legacy 'social_share' event for backward compatibility with existing GA data.
 * 
 * @param actionType - Type of share action ('copy_to_x' or 'download')
 * @param characterName - Name of the character/twin
 */
export const trackShareAction = (params: {
  actionType: 'copy_to_x' | 'download';
  characterName: string;
}) => {
  // Fire new granular event
  const eventName = params.actionType === 'copy_to_x' ? 'share_copy_to_x' : 'share_download';
  trackEvent(eventName, {
    event_category: 'Social',
    event_label: params.characterName,
    character_name: params.characterName,
    action_type: params.actionType,
  });

  // Fire legacy event for backward compatibility with existing GA data
  const legacyShareType = params.actionType === 'copy_to_x' ? 'x' : 'download';
  trackEvent('social_share', {
    event_category: 'Social',
    event_label: `${legacyShareType}_${params.characterName}`,
    share_type: legacyShareType,
    character_name: params.characterName,
  });
};
