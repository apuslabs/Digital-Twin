import OpenAI from "openai";
import { FineTuneExample, PrivateTwinData, PrivateTwinDataset } from "../types/app";

const DEFAULT_PRIVATE_TWIN_MODEL = import.meta.env.VITE_PRIVATE_TWIN_LLM_MODEL || "gpt-4o-mini";

type DatasetLLMResponse = {
  personaSummary: string;
  styleGuide: string[];
  systemPrompt: string;
  trainingExamples: FineTuneExample[];
};

const getClient = (): OpenAI => {
  const apiKey = import.meta.env.VITE_PRIVATE_TWIN_LLM_API_KEY?.trim();
  const baseURL = import.meta.env.VITE_PRIVATE_TWIN_LLM_BASE_URL?.trim();

  if (!apiKey || !baseURL) {
    throw new Error("Missing VITE_PRIVATE_TWIN_LLM_API_KEY or VITE_PRIVATE_TWIN_LLM_BASE_URL");
  }

  return new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });
};

const buildDatasetPrompt = (raw: PrivateTwinData): string => {
  const posts = raw.posts
    .map((post, index) => {
      const stats = [
        post.likeCount !== undefined ? `likes=${post.likeCount}` : "",
        post.retweetCount !== undefined ? `retweets=${post.retweetCount}` : "",
        post.replyCount !== undefined ? `replies=${post.replyCount}` : "",
        post.quoteCount !== undefined ? `quotes=${post.quoteCount}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      return `${index + 1}. [${post.createdAt || "unknown"}] ${post.text}${stats ? ` (${stats})` : ""}`;
    })
    .join("\n");

  const about = Object.entries(raw.profile.about || {})
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join("\n");

  return `You are preparing a high-quality training dataset for a private digital twin.

Objective:
- Clean noisy social data.
- Infer stable voice and preferences only from evidence.
- Produce standard chat fine-tuning examples.
- Keep this safe, grounded, and useful for a personal digital twin.

Source profile:
name: ${raw.profile.name}
username: @${raw.profile.userName}
bio: ${raw.profile.bio || "unknown"}
location: ${raw.profile.location || "unknown"}
followers: ${raw.profile.followers ?? "unknown"}
following: ${raw.profile.following ?? "unknown"}
createdAt: ${raw.profile.createdAt || "unknown"}
isBlueVerified: ${raw.profile.isBlueVerified ? "true" : "false"}

About data:
${about || "No about data"}

Recent public posts:
${posts || "No public posts"}

Additional user-supplied context:
${raw.personalContext || "No additional context"}

Return strict JSON with this shape:
{
  "personaSummary": "short paragraph",
  "styleGuide": ["bullet", "bullet"],
  "systemPrompt": "production-ready system prompt for the twin",
  "trainingExamples": [
    {
      "messages": [
        { "role": "system", "content": "same twin system prompt or shortened equivalent" },
        { "role": "user", "content": "plausible user message" },
        { "role": "assistant", "content": "ideal response in the inferred voice" }
      ]
    }
  ]
}

Requirements:
- Create 12-18 examples.
- Examples must be diverse: opinions, personal updates, advice, product/market takes, casual banter, self-reflection, audience interaction.
- Assistant responses should sound like this person, but must avoid inventing sensitive personal facts.
- Remove spammy or low-signal patterns.
- Prefer concise, natural chat examples rather than tweet-length outputs only.
- The systemPrompt should clearly say when the model is inferring.
- Output JSON only.`;
};

const sanitizeDataset = (dataset: DatasetLLMResponse): PrivateTwinDataset => {
  const trainingExamples = (dataset.trainingExamples || []).filter(
    (example) =>
      Array.isArray(example.messages) &&
      example.messages.length >= 3 &&
      example.messages.every(
        (message) =>
          message &&
          (message.role === "system" ||
            message.role === "user" ||
            message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0
      )
  );

  if (!trainingExamples.length) {
    throw new Error("LLM did not return valid training examples");
  }

  return {
    personaSummary: dataset.personaSummary?.trim() || "No persona summary generated.",
    styleGuide: (dataset.styleGuide || []).map((item) => item.trim()).filter(Boolean),
    trainingExamples,
    systemPrompt: dataset.systemPrompt?.trim() || trainingExamples[0].messages[0].content,
    generatedAt: new Date().toISOString(),
    model: DEFAULT_PRIVATE_TWIN_MODEL,
  };
};

const buildFallbackDataset = (raw: PrivateTwinData): PrivateTwinDataset => {
  const topPosts = raw.posts.slice(0, 8);
  const examples: FineTuneExample[] = topPosts.map((post) => ({
    messages: [
      {
        role: "system",
        content: raw.systemPrompt,
      },
      {
        role: "user",
        content: `What is your take on this topic: ${post.text.slice(0, 120)}?`,
      },
      {
        role: "assistant",
        content: post.text,
      },
    ],
  }));

  return {
    personaSummary: `${raw.profile.name} appears to communicate around recurring themes found in recent public X posts.`,
    styleGuide: [
      "Mirror the vocabulary and stance patterns visible in recent posts.",
      "Stay grounded in public information and explicit user-provided context.",
      "When uncertain, mark the answer as an inference instead of presenting it as fact.",
    ],
    trainingExamples: examples,
    systemPrompt: raw.systemPrompt,
    generatedAt: new Date().toISOString(),
    model: "fallback-heuristic",
  };
};

export const generatePrivateTwinDataset = async (
  raw: PrivateTwinData
): Promise<PrivateTwinDataset> => {
  try {
    const client = getClient();
    const response = await client.chat.completions.create({
      model: DEFAULT_PRIVATE_TWIN_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You convert social profile data into safe, high-quality chat fine-tuning datasets.",
        },
        {
          role: "user",
          content: buildDatasetPrompt(raw),
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("Empty dataset generation response");
    }

    return sanitizeDataset(JSON.parse(content) as DatasetLLMResponse);
  } catch (error) {
    console.warn("Falling back to heuristic private twin dataset generation", error);
    return buildFallbackDataset(raw);
  }
};
