import { PrivateTwinData, PrivateTwinPostSummary, PrivateTwinProfile, PrivateTwinWorkspace } from "../types/app";

export const PRIVATE_TWIN_STORAGE_KEY = "privateTwinWorkspace";

type TwitterApiStatus = "success" | "error";

type TwitterUserAboutShape = {
  id?: string;
  name?: string;
  userName?: string;
  createdAt?: string;
  isBlueVerified?: boolean;
  about_profile?: Record<string, unknown>;
};

type TwitterUserAboutResponse = {
  data?: TwitterUserAboutShape;
  status?: TwitterApiStatus;
  msg?: string;
} & TwitterUserAboutShape;

type TwitterTweetAuthor = {
  id?: string;
  name?: string;
  userName?: string;
  description?: string;
  location?: string;
  profilePicture?: string;
  followers?: number;
  following?: number;
  createdAt?: string;
  isBlueVerified?: boolean;
};

type TwitterTweet = {
  id?: string;
  text?: string;
  url?: string;
  createdAt?: string;
  likeCount?: number;
  retweetCount?: number;
  replyCount?: number;
  quoteCount?: number;
  author?: TwitterTweetAuthor;
};

type TwitterUserLastTweetsResponse = {
  data?: {
    tweets?: TwitterTweet[];
  };
  tweets?: TwitterTweet[];
  status?: TwitterApiStatus;
  message?: string;
};

const fetchTwitterApi = async <T>(
  path: string,
  query: Record<string, string | boolean | undefined>
): Promise<T> => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const response = await fetch(`/api/twitter${path}?${params.toString()}`);

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMessage =
      payload?.msg || payload?.message || `Twitter API request failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload as T;
};

export const extractXUsername = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const handleOnlyMatch = trimmed.match(/^@?([A-Za-z0-9_]{1,15})$/);
  if (handleOnlyMatch) {
    return handleOnlyMatch[1];
  }

  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(normalized);
    const isXHost =
      url.hostname === "x.com" ||
      url.hostname === "www.x.com" ||
      url.hostname === "twitter.com" ||
      url.hostname === "www.twitter.com";

    if (!isXHost) {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const candidate = segments[0]?.replace(/^@/, "");
    if (!candidate || !/^[A-Za-z0-9_]{1,15}$/.test(candidate)) {
      return null;
    }

    return candidate;
  } catch (_) {
    return null;
  }
};

const normalizePostText = (text?: string): string => {
  return (text || "").replace(/\s+/g, " ").trim();
};

const buildRawSystemPrompt = (
  profile: PrivateTwinProfile,
  posts: PrivateTwinPostSummary[],
  personalContext: string
): string => {
  const postLines = posts.length
    ? posts
        .map((post, index) => `${index + 1}. ${post.text}`)
        .join("\n")
    : "No recent public posts were returned.";

  return `<task>
You are a private digital twin for ${profile.name} (@${profile.userName}).
Speak like this person based on the public X profile data and recent posts below.
</task>

<profile>
bio: ${profile.bio || "unknown"}
location: ${profile.location || "unknown"}
followers: ${profile.followers ?? "unknown"}
</profile>

<recent_posts>
${postLines}
</recent_posts>

<additional_context>
${personalContext.trim() || "No extra personal context provided."}
</additional_context>`;
};

export const fetchPrivateTwinData = async (
  xLink: string,
  personalContext: string
): Promise<PrivateTwinData> => {
  const userName = extractXUsername(xLink);
  if (!userName) {
    throw new Error("Invalid X profile link or username");
  }

  const [aboutResponse, tweetsResponse] = await Promise.all([
    fetchTwitterApi<TwitterUserAboutResponse>("/twitter/user/about", { userName }),
    fetchTwitterApi<TwitterUserLastTweetsResponse>("/twitter/user/last_tweets", {
      userName,
      includeReplies: false,
    }),
  ]);

  if (aboutResponse.status === "error") {
    throw new Error(aboutResponse.msg || "Failed to fetch user profile");
  }

  if (tweetsResponse.status === "error") {
    throw new Error(tweetsResponse.message || "Failed to fetch user tweets");
  }

  const about = aboutResponse.data || aboutResponse;
  const tweets = (tweetsResponse.tweets || tweetsResponse.data?.tweets || []).filter(
    (tweet) => !!normalizePostText(tweet.text)
  );
  const author = tweets[0]?.author;

  const profile: PrivateTwinProfile = {
    id: about.id || author?.id,
    name: about.name || author?.name || userName,
    userName: about.userName || author?.userName || userName,
    bio: author?.description,
    location: author?.location,
    profilePicture: author?.profilePicture,
    followers: author?.followers,
    following: author?.following,
    createdAt: about.createdAt || author?.createdAt,
    isBlueVerified: about.isBlueVerified ?? author?.isBlueVerified,
    about: about.about_profile || {},
  };

  const posts: PrivateTwinPostSummary[] = tweets.slice(0, 25).map((tweet) => ({
    id: tweet.id || crypto.randomUUID(),
    text: normalizePostText(tweet.text),
    createdAt: tweet.createdAt || "",
    url: tweet.url,
    likeCount: tweet.likeCount,
    retweetCount: tweet.retweetCount,
    replyCount: tweet.replyCount,
    quoteCount: tweet.quoteCount,
  }));

  return {
    profile,
    posts,
    personalContext,
    sourceLink: xLink,
    systemPrompt: buildRawSystemPrompt(profile, posts, personalContext),
    welcomeMessage: `I have loaded @${profile.userName}'s public X footprint. What do you want to explore?`,
  };
};

export const savePrivateTwinWorkspace = (workspace: PrivateTwinWorkspace): void => {
  sessionStorage.setItem(PRIVATE_TWIN_STORAGE_KEY, JSON.stringify(workspace));
};

export const loadPrivateTwinWorkspace = (): PrivateTwinWorkspace | null => {
  const raw = sessionStorage.getItem(PRIVATE_TWIN_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PrivateTwinWorkspace;
  } catch (error) {
    console.warn("Failed to parse private twin workspace from sessionStorage", error);
    sessionStorage.removeItem(PRIVATE_TWIN_STORAGE_KEY);
    return null;
  }
};
