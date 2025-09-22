New_prompts = {}

-- 1. RECEIVE HANDLER - For receiving new prompt submissions
Handlers.add(
    "ReceivePrompt",
    Handlers.utils.hasMatchingTag("Action", "ReceivePrompt"),
    function(msg)
        local prompt_data = msg.Data or ""
        local contributor = msg.From or "unknown"
        
        if prompt_data == "" then
            msg.reply({
                Error = "Empty prompt data received"
            })
            return
        end
        
        -- Create new prompt entry
        local new_prompt = {
            contributor = contributor,
            data = prompt_data,
            timestamp = msg.Timestamp,
            scores = {}
        }
        
        -- Add to new_prompts list
        New_prompts[#New_prompts + 1] = new_prompt
        print("New prompt received from: " .. contributor)
        print("Total pending prompts: " .. #New_prompts)

        msg.reply({
            Success = "Prompt received successfully",
            Character = Character,
        })
    end
)