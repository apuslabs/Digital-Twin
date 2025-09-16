-- Digital Twin Prompt Storage Agent
local json = require("json")
-- Variables
New_prompts = New_prompts or {}  -- List to store new prompt submissions
Character = "Trump"  -- Character this agent represents
Permanent_messageTX = Permanent_messageTX or {}  -- Current permanent prompt that gets updated
Judge_process_id = "GGQMJVDB93m1E0X6BcTkDeXy4GdDTNMbsOm8JtrYSAQ"  -- ID of the judge process

-- Global function to register with judge process
function Register(judge_process_id)
    if not judge_process_id or judge_process_id == "" then
        print("Error: Judge process ID is required for registration")
        return false
    end
    
    -- Update the global judge process ID
    Judge_process_id = judge_process_id
    
    print("Registering agent with judge process: " .. judge_process_id)
    print("Character: " .. Character)
    print("Agent ID: " .. ao.id)
    
    -- Send registration message to judge
    Send({
        Target = judge_process_id,
        Action = "RegisterAgent",
        Data = Character
    })
    
    print("Registration message sent to judge: " .. judge_process_id)
    return true
end


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
            created_at = msg.Timestamp,
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


-- 3. SEND TO JUDGE HANDLER - Send prompts to judge process for evaluation
Handlers.add(
    "SendToJudge",
    Handlers.utils.hasMatchingTag("Action", "SendToJudge"),
    function(msg)
        -- if #New_prompts == 0 then
        --     msg.reply({
        --         Error = "No pending prompts to send for judging"
        --     })
        --     return
        -- end
        -- Send to judge process
        ao.send({
            Target = "GGQMJVDB93m1E0X6BcTkDeXy4GdDTNMbsOm8JtrYSAQ",
            Action = "HelloTest",
            --Data = json.encode(New_prompts)
        })
        print("Sent " .. #New_prompts .. " prompts to judge process: " .. Judge_process_id)
        -- after sending to judge, clear the list
        New_prompts = {}
    end
)

-- 4. ACCEPT HANDLER - UpdateMemory
Handlers.add(
    "UpdateMemory",
    Handlers.utils.hasMatchingTag("Action", "UpdateMemory"),
    function(msg)
        -- Verify sender is the judge process
        if msg.From ~= Judge_process_id then
            msg.reply({
                Error = "Unauthorized: Only judge process can update prompts"
            })
            return
        end
        
        local message_ID = msg.Data or ""
        Permanent_messageTX[#Permanent_messageTX+1] = message_ID
        print("Permanent message updated with ID: " .. message_ID)
    end
)

-- Initialize message
print("Digital Twin Agent initialized for character: " .. Character)
print("Agent ID: " .. ao.id)
print("Judge Process ID: " .. Judge_process_id)
print("Ready to receive prompts...")
