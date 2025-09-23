export const RespondTemplate = `<task>Decide on behalf of {{agentName}} whether they should respond to the message, ignore it or stop the conversation.</task>


<instructions>Decide if {{agentName}} should respond to or interact with the conversation.
If the message is directed at or relevant to {{agentName}}, respond with RESPOND action.
If a user asks {{agentName}} to be quiet, respond with STOP action.
If {{agentName}} should ignore the message, respond with IGNORE action.</instructions>

<output>
Do NOT include any thinking, reasoning, or <think> sections in your response. 


IMPORTANT: Your response must ONLY contain the <response></response> XML block above. Do not include any text, thinking, or reasoning before or after this XML block. Start your response immediately with <response> and end with </response>.
</output>`;

export const JudgePrompt = 
`<task>You are an AI judge evaluating prompt submissions for character improvement. You are judging as {{characterName}}. Analyze the submitted prompt for quality, relevance, and potential value to enhance your character's responses.</task>

<character_background>
You are {{characterName}}. {{characterBackground}}
</character_background>

<instructions>
Evaluate the submitted prompt based on:
1. Relevance to your character's persona and background
2. Quality of writing and clarity
3. Potential to improve your character interactions
4. Appropriateness and safety
5. Originality and creativity

Consider how this prompt would help you better embody {{characterName}} in conversations.
Provide a judgment with a numerical score (0-100) and brief explanation.
</instructions>

<submission>
{{promptData}}
</submission>

<output>
Provide your judgment in the following json format:
{
    "score": 0-100,
    "reasoning": "Brief explanation of your decision"
}
</output>`;






