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

### 3. Share Button Click

**Event Name:** `share_button_click`

**When Tracked:** Every time a user clicks the "Share Your Out of Context Card" button.

**Parameters:**
- `event_category`: "Social"
- `event_label`: Character name
- `character_name`: Character name
- `tooltip_shown`: `true` if tooltip was visible when clicked, `false` if tooltip was dismissed or never shown

**Location:** `ChatInterface.tsx` - `handleShareClick()` function

**Use Cases:**
- **Total clicks:** Count all `share_button_click` events
- **Tooltip effectiveness:** Filter by `tooltip_shown: true` vs `tooltip_shown: false`

---

### 4. Copy to X (Clipboard)

**Event Name:** `share_copy_to_x`

**When Tracked:** When a user clicks "Copy photo and post to X" in the share modal.

**Parameters:**
- `event_category`: "Social"
- `event_label`: Character name
- `character_name`: Character name
- `action_type`: "copy_to_x"

**Location:** `ChatInterface.tsx` - Out of Context card modal "Copy photo and post to X" button

**Use Case:** Track how many users copy the Out of Context card to clipboard for sharing on X/Twitter.

---

### 5. Download to Desktop

**Event Name:** `share_download`

**When Tracked:** When a user clicks "Save to desktop" in the share modal.

**Parameters:**
- `event_category`: "Social"
- `event_label`: Character name
- `character_name`: Character name
- `action_type`: "download"

**Location:** `ChatInterface.tsx` - Out of Context card modal "Save to desktop" button

**Use Case:** Track how many users download the Out of Context card to their desktop.

---

### Legacy: Social Share (Backward Compatibility)

**Event Name:** `social_share`

**When Tracked:** Automatically fired alongside `share_copy_to_x` and `share_download` for backward compatibility with existing GA data.

**Parameters:**
- `event_category`: "Social"
- `event_label`: "{shareType}_{characterName}" (e.g., "x_Donald Trump")
- `share_type`: "x" or "download"
- `character_name`: Character name

**Note:** This event is maintained for continuity with historical data. Use `share_copy_to_x` and `share_download` for new analyses.

---

## Implementation Files

- **Analytics Utility:** `services/analytics.ts`
- **Main Integration:** `components/ChatInterface.tsx`

## Viewing Analytics

To view these events in Google Analytics:
1. Go to Google Analytics dashboard
2. Navigate to Events > All Events
3. Look for the following events:
   - `chat_per_character`
   - `prompt_submission_reward`
   - `share_button_click`
   - `share_copy_to_x`
   - `share_download`
   - `social_share` (legacy, for backward compatibility)

### Filtering by Parameters

You can filter events by their parameters to answer specific questions:

- **Total share button clicks:** Count all `share_button_click` events
- **Tooltip effectiveness:** Filter `share_button_click` by `tooltip_shown: true` vs `tooltip_shown: false`
- **Copy vs Download preference:** Compare counts of `share_copy_to_x` vs `share_download` events
- **Character-specific metrics:** Filter any event by `character_name` parameter
