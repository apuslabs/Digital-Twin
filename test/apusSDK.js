import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "APUS_KEY",
  baseURL: "https://hb.apus.network/~inference@1.0",
});

const logResult = (label, value) => {
  const output = typeof value === "string" ? value.trim() : "";
  console.log(`${label}:`, output || "[no content returned]");
};

const runCompletionExample = async () => {
  try {
    const completion = await openai.completions.create({
      model: "Test_model",
      prompt: "List three use cases for the APUS platform.",
      max_tokens: 150, 
    });

    logResult(
      "Completion sample",
      completion.choices?.[0]?.text
    );
  } catch (error) {
    console.error("Completion API error:", error);
  }
};

const runChatExample = async () => {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "Test_model",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: "Give me a concise overview of the APUS Digital Twin project.",
        },
      ],
      max_tokens: 300,
    });

    logResult(
      "Chat sample",
      chatCompletion.choices?.[0]?.message?.content
    );
  } catch (error) {
    console.error("Chat API error:", error);
  }
};

await runCompletionExample();
await runChatExample();
