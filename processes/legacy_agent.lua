-- Digital Twin Prompt Storage Agent
local json = require("json")
-- Variables
New_prompts = New_prompts or {}  -- List to store new prompt submissions
Character = "Trump"  -- Character this agent represents
Permanent_messageTX = Permanent_messageTX or {}  -- Current permanent prompt that gets updated
Worker_process_id = "Hpn46xgT5UAuPl5PL6CDC-k-Krs5rVeDhaUVRTzSKN8"
-- 1. RECEIVE HANDLER - For receiving new prompt submissions
Handlers.add(
    "ReceivePrompt",
    Handlers.utils.hasMatchingTag("Action", "ReceivePrompt"),
    function(msg)
        local prompt_data = msg.Data or ""
        local contributor = msg.From or "unknown"
        local reference = msg["X-Reference"] or msg.Reference
        
         --- IGNORE ---
        if prompt_data == "" then
            msg.reply({
                Error = "Empty prompt data received"
            })
            return
        end
        
        -- Create new prompt entry
        local new_prompt = {
            contributor = contributor,
            created_at = msg.Timestamp,
        }
        
        -- Add to new_prompts list
        New_prompts[#New_prompts + 1] = new_prompt
        print("New prompt received from: " .. contributor)
        print("Total pending prompts: " .. #New_prompts)
        --sendToWorker
        Send({
            Target = Worker_process_id,
            Action = "Infer",
            ["X-Reference"] = reference,
            Data = prompt_data,
        })

        msg.reply({
            Success = "Prompt received successfully",
            Character = Character,
        })
    end
)
-- 2. Info handlers
Handlers.add('Info', Handlers.utils.hasMatchingTag('Action', 'Info'), function(msg)
    msg.reply({
        Data = json.encode({
            Character = Character,
            PendingPrompts = #New_prompts,
            PermanentMessageTX = Permanent_messageTX,
        }),
    })
end)



-- Initialize message
print("Digital Twin Agent initialized for character: " .. Character)
print("Agent ID: " .. ao.id)
print("Ready to receive prompts...")



-- Handler to receive responses from worker
Handlers.add(
    "WorkerResponse",
    Handlers.utils.hasMatchingTag("Action", "Infer-Response"),
    function(msg)
        local reference = msg["X-Reference"] or msg.Reference
        local result = msg.Data
        
        print("[WORKER-RESPONSE] Reference: " .. (reference or "none"))
        print("[WORKER-RESPONSE] Result: " .. string.sub(result or "", 1, 50) .. "...")
        
        -- Process the response as needed
        -- This could forward to judge, store in history, etc.
        
        -- Example: Store in results table
        Worker_results = Worker_results or {}
        Worker_results[reference] = {
            result = result,
            received_at = os.time(),
            reference = reference
        }
        
        print("[STORED] Worker response stored for reference: " .. (reference or "none"))
    end
)

-- Initialize worker integration variables
Worker_results = Worker_results or {}

print("Legacy Agent with Worker Integration loaded")
