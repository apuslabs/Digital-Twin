# Google Analytics Tracking

This document describes the Google Analytics events tracked in the Digital Twin application.

## Setup

Google Analytics is configured in `index.html` with tracking ID: `G-W05SKVSQYE`

## Tracked Events

### 1. Chats per Character

**Event Name:** `chat_per_character`

**When Tracked:** Every time a user sends a message and receives a response from a character.

**Parameters:**
- `event_category`: "Chat"
- `event_label`: Character name (e.g., "Donald Trump")
- `character_name`: Character name
- `message_count`: Total number of messages in the conversation

**Location:** `ChatInterface.tsx` - `handleSubmit()` function

---

### 2. Prompt Submissions + Token Rewards Distributed

**Event Name:** `prompt_submission_reward`

**When Tracked:** When a user's prompt contribution is evaluated and rewards are distributed.

**Parameters:**
- `event_category`: "Contribution"
- `event_label`: Character name
- `character_name`: Character name
- `reward_amount`: Number of tokens rewarded

**Location:** `ChatInterface.tsx` - `handleQueryResult()` when evaluation is complete

**Note:** This event only fires when `reward_amount` is present in the evaluation result. You may need to ensure your backend includes this field.

---

### 3. Number of Social Shares

**Event Name:** `social_share`

**When Tracked:** When a user shares their score card via X/Twitter or downloads it.

**Parameters:**
- `event_category`: "Social"
- `event_label`: "{shareType}_{characterName}" (e.g., "x_Donald Trump")
- `share_type`: "x" or "download"
- `character_name`: Character name

**Location:** `ChatInterface.tsx` - Score card modal share buttons

**Share Types:**
- `x`: User clicked "Copy photo and post to X"
- `download`: User clicked "Save to desktop"

---

## Implementation Files

- **Analytics Utility:** `services/analytics.ts`
- **Main Integration:** `components/ChatInterface.tsx`

## Viewing Analytics

To view these events in Google Analytics:
1. Go to Google Analytics dashboard
2. Navigate to Events > All Events
3. Look for: `chat_per_character`, `prompt_submission_reward`, `social_share`
