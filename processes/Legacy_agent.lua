local json = require('json')

TaskQueue = TaskQueue or {}
Tasks = Tasks or {}


-- 1. RECEIVE HANDLER - For receiving new prompt submissions
Handlers.add(
    "ReceivePrompt",
    Handlers.utils.hasMatchingTag("Action", "ReceivePrompt"),
    function(msg)
        local prompt_data = msg.Data or ""
        
        if prompt_data == "" then
            msg.reply({
                Error = "Empty prompt data received"
            })
            return
        end
        
        local reference = msg["X-Reference"] or msg.Reference 
        
        local NewTask = {
            prompt = prompt_data,
            contributor = msg.From ,
            created_at = msg.Timestamp,
            reference = reference,
            status = "pending"
        }

        Tasks[reference] = NewTask
        table.insert(TaskQueue, reference)

        print("[INFERENCE-QUEUED]" .. reference)

    end
)


Handlers.add("Get-Worker-Task-Count", "Task-Count", function(msg)
    msg.reply({
        Data = #TaskQueue,
    })
end)

Handlers.add("Get-Task", "Get-Task",
    function(msg)
        if #TaskQueue > 0 then
            local task_ref = table.remove(TaskQueue, 1)
            local task = Tasks[task_ref]

            if task then
                print("[GET-TASK] Assigned task " .. task.reference)

                msg.reply({
                    Data = json.encode(task)
                })
                task.status = "processing"
                task.started_at = os.time()
            else
                print("[GET-TASK-ERR] Task with ref " .. task_ref .. " not found in Tasks table.")
            end
        else
            print("[GET-TASK-ERR] No available tasks")
        end
    end
)


Handlers.add(
    "AI-Infer-Response",
    Handlers.utils.hasMatchingTag("Action", "Infer-Response"),
    function(msg)
        local task_ref = msg["X-Reference"] or msg.Reference
        local task = Tasks[task_ref]
        
        if not task then
            print("[ERR] Invalid task: " .. string.sub(task_ref or "nil", 1, 10))
            return
        end
        
        print("[RES] Task: " .. task_ref .. " | Result: " .. string.sub(msg.Data, 1, 20))

        -- Update the task with the result
        task.result = msg.Data 
        task.status = "done"
    end
)
-- query task results

Handlers.add(
    "Query-Task-Result",
    Handlers.utils.hasMatchingTag("Action", "Query-Task-Result"),
    function(msg)
        local task_ref = msg["X-Reference"] or msg.Reference
        local task = Tasks[task_ref]
        
        if not task then
            msg.reply({
                Error = "Task not found for reference: " .. (task_ref or "nil")
            })
            return
        end
        
        msg.reply({
            status = task.status,
            Data = task.result or "",
        })
    end
)