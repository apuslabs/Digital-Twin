local json = require("json")
-- Digital Twin Judge Process

-- Variables
Agent_registry = Agent_registry or{}
Judge_history = Judge_history or {}
local Judge_prompt = [[
You are an AI judge responsible for evaluating prompt submissions for digital twin characters. Your task is to:

1. Analyze the quality and authenticity of proposed prompt improvements
2. Ensure the prompts align with the character's known personality, speaking style, and behaviors
3. Check for factual accuracy and consistency with the character's public persona
4. Evaluate the prompt's potential to improve the digital twin's conversational quality
5. Select the best prompt from the submissions or create an improved version by combining the best elements

For each evaluation, consider:
- Authenticity: Does this sound like something the character would say or how they would behave?
- Quality: Is the prompt well-written and clear?
- Improvement: Will this make the digital twin more engaging and accurate?
- Safety: Is the content appropriate and non-harmful?

Respond like this json format
{
  "final_prompt": "summarized prompt text based on the best elements of submissions",
  "reasoning": "Brief explanation of why this prompt was selected/created",
  "quality_score": 85,
  "winner": winner address
}
]] 

-- Handler to register new agents
Handlers.add(
    "RegisterAgent",
    Handlers.utils.hasMatchingTag("Action", "RegisterAgent"),
    function(msg)
        local agent_id = msg.From
        local character = msg.Data
        
        if character and character ~= "" then
            Agent_registry[agent_id] = character
            print("Registered agent: " .. agent_id .. " for character: " .. character)
            
            msg.reply({
                Data = "Agent registered successfully",
                AgentId = agent_id,
                Character = character
            })
        else
            msg.reply({
                Error = "Character name required for registration"
            })
        end
    end
)

-- Handler to accept JudgePrompts requests from agents
Handlers.add(
    "JudgePrompts",
    Handlers.utils.hasMatchingTag("Action", "JudgePrompts"),
    function(msg)
        local agent_id = msg.From
        local character = Agent_registry[agent_id]
        
        if not character then
            print("Unknown agent attempted to send prompts: " .. agent_id)
            msg.reply({
                Error = "Agent not registered. Please register first."
            })
            return
        end
        -- Data cannot be nil or empty
        local new_prompts = msg.Data or ""
        if not new_prompts or #new_prompts == 0 then
            msg.reply({
                Error = "No prompts provided for evaluation"
            })
            return
        end

        -- Prepare prompt and options
        local final_prompt = Judge_prompt .. "\n\nCharacter: " .. character .. "\n\nCurrent prompts to evaluate:\n" .. new_prompts
        local options = msg["X-Options"] or [[{"max_tokens":30000}]]
        
        -- Generate reference for tracking
        local reference = agent_id .. "-" .. os.time()
        
        -- Create history entry for tracking using reference as key
        Judge_history[reference] = {
            character = character,
            agent_id = agent_id,
            timestamp = os.time(),
            status = "pending",
        }
        
        print("Created history entry with reference: " .. reference)
        
        -- Send request to APUS AI
        local request = {
            Target = "TED2PpCVx0KbkQtzEYBo0TRAO-HPJlpCMmUzch9ZL2g",
            Action = "Infer",
            Data = final_prompt,
            Tags = {
            ["X-Reference"] = reference,
            ["X-Options"] = options,
            }
        }
        Send(request)
        
        print("Sent prompts to APUS AI for evaluation.")

        -- Reply to the requesting agent
        msg.reply({
            Data = "Prompts submitted for AI evaluation",
            Character = character,
        })
    end
)
-- Handler for response from APUS AI with final prompt_data
Handlers.add(
    "AcceptResponse",
    Handlers.utils.hasMatchingTag("Action", "Infer-Response"),
    function(msg)
        local reference = msg.Tags["X-Reference"] or ""
        
        print("Received APUS AI response with reference: " .. reference)
        
        -- Parse the AI response (assuming it's JSON)
        local response = json.decode(msg.Data or "{}")
        local result = json.decode(response.result)
        local status = "failed"  -- Default to failed
        print("result : ", result)
        if result.final_prompt then
            print("AI judgment received:")
            print("Final prompt: " .. result.final_prompt)
            print("Reasoning: " .. (result.reasoning or "N/A"))
            print("Quality score: " .. (result.quality_score or "N/A"))
            print("Winner: " .. (result.winner or "N/A"))

            status = "succeed"
            print("AI evaluation completed successfully")
        else
            print("Warning: No final_prompt found in AI response")
            print("Raw result: " .. result)
        end
        
        -- Update history entry using reference as key
        if reference and reference ~= "" and Judge_history[reference] then
            Judge_history[reference].status = status
            Judge_history[reference].completed_at = os.time()
            print("Updated history entry: " .. reference .. " with status: " .. status)
        else
            print("Warning: No matching history entry found for reference: " .. reference)
        end
    end
)



-- Initialize message
print("Digital Twin Judge Process initialized")
print("Judge ID: " .. ao.id)
print("Ready to evaluate prompts from registered agents...")
print("Registered agents: " .. #Agent_registry)
