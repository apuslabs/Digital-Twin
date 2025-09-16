local json = require("json")
-- Variables


function Parse()
    local prompt = [[{
    "attestation": [
        [
        "JWT",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJOVi1BdHRlc3RhdGlvbi1TREsiLCJpYXQiOjE3NTcwNzExODMsImV4cCI6MTc1NzA3NDc4MywibmJmIjoxNzU3MDcxMDYzLCJqdGkiOiIxNjliY2Y3OS0zNzg2LTRlMjItYjc0ZC1jYTJjZGU5NjM4MTgifQ.kZduzx-Wr2KeVudbrIKj_KZ53oTQhKXQCLBmiQZ1zus"
        ],
        {
        "LOCAL_GPU_CLAIMS": [
            [
            "JWT",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJOVklESUEtUExBVEZPUk0tQVRURVNUQVRJT04iLCJuYmYiOjE3NTcwNzEwNjMsImV4cCI6MTc1NzA3NDc4MywiaWF0IjoxNzU3MDcxMTgzLCJqdGkiOiI2YzY1MjY1Ny0wNjRkLTRjZjAtYTk5My01ZWE0YmFlZTE2YTgiLCJ4LW52aWRpYS12ZXIiOiIzLjAiLCJpc3MiOiJMT0NBTF9HUFVfVkVSSUZJRVIiLCJ4LW52aWRpYS1vdmVyYWxsLWF0dC1yZXN1bHQiOnRydWUsInN1Ym1vZHMiOnsiR1BVLTAiOlsiRElHRVNUIixbIlNIQTI1NiIsIjA4MjEzMjZhMzg5NThmOWQ1MjE2YjA5Mzk0MjQ1OTI0ODIwNTM2ZGZmZjRjZDM0Njk0YzU5YTcyZWI0MjkzYTQiXV19LCJlYXRfbm9uY2UiOiJkYTRhMDZjMzYwNGE1ZmFjOGFhMGI0YWFmNWE2MzU0Y2RkMGRjN2MxOTMyOTliYzM0NjRmMzBiNWNiZmI5MzFhIn0.MWHyQRzp-Oina3f8g3jlQnhfe1zJMLRS3V-j2JFLckk"
            ],
            {
            "GPU-0": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZWFzcmVzIjoic3VjY2VzcyIsIngtbnZpZGlhLWdwdS1hcmNoLWNoZWNrIjp0cnVlLCJ4LW52aWRpYS1ncHUtZHJpdmVyLXZlcnNpb24iOiI1NTAuMTYzLjAxIiwieC1udmlkaWEtZ3B1LXZiaW9zLXZlcnNpb24iOiI5Ni4wMC5BRi4wMC4wMSIsIngtbnZpZGlhLWdwdS1hdHRlc3RhdGlvbi1yZXBvcnQtY2VydC1jaGFpbiI6eyJ4LW52aWRpYS1jZXJ0LWV4cGlyYXRpb24tZGF0ZSI6Ijk5OTktMTItMzFUMjM6NTk6NTkiLCJ4LW52aWRpYS1jZXJ0LXN0YXR1cyI6InZhbGlkIiwieC1udmlkaWEtY2VydC1vY3NwLXN0YXR1cyI6Imdvb2QiLCJ4LW52aWRpYS1jZXJ0LXJldm9jYXRpb24tcmVhc29uIjpudWxsfSwieC1udmlkaWEtZ3B1LWF0dGVzdGF0aW9uLXJlcG9ydC1jZXJ0LWNoYWluLWZ3aWQtbWF0Y2giOnRydWUsIngtbnZpZGlhLWdwdS1hdHRlc3RhdGlvbi1yZXBvcnQtcGFyc2VkIjp0cnVlLCJ4LW52aWRpYS1ncHUtYXR0ZXN0YXRpb24tcmVwb3J0LW5vbmNlLW1hdGNoIjp0cnVlLCJ4LW52aWRpYS1ncHUtYXR0ZXN0YXRpb24tcmVwb3J0LXNpZ25hdHVyZS12ZXJpZmllZCI6dHJ1ZSwieC1udmlkaWEtZ3B1LWRyaXZlci1yaW0tZmV0Y2hlZCI6dHJ1ZSwieC1udmlkaWEtZ3B1LWRyaXZlci1yaW0tc2NoZW1hLXZhbGlkYXRlZCI6dHJ1ZSwieC1udmlkaWEtZ3B1LWRyaXZlci1yaW0tY2VydC1jaGFpbiI6eyJ4LW52aWRpYS1jZXJ0LWV4cGlyYXRpb24tZGF0ZSI6IjIwMjctMDQtMTZUMTc6MDg6MzYiLCJ4LW52aWRpYS1jZXJ0LXN0YXR1cyI6InZhbGlkIiwieC1udmlkaWEtY2VydC1vY3NwLXN0YXR1cyI6Imdvb2QiLCJ4LW52aWRpYS1jZXJ0LXJldm9jYXRpb24tcmVhc29uIjpudWxsfSwieC1udmlkaWEtZ3B1LWRyaXZlci1yaW0tc2lnbmF0dXJlLXZlcmlmaWVkIjp0cnVlLCJ4LW52aWRpYS1ncHUtZHJpdmVyLXJpbS12ZXJzaW9uLW1hdGNoIjp0cnVlLCJ4LW52aWRpYS1ncHUtZHJpdmVyLXJpbS1tZWFzdXJlbWVudHMtYXZhaWxhYmxlIjp0cnVlLCJ4LW52aWRpYS1ncHUtdmJpb3MtcmltLWZldGNoZWQiOnRydWUsIngtbnZpZGlhLWdwdS12Ymlvcy1yaW0tc2NoZW1hLXZhbGlkYXRlZCI6dHJ1ZSwieC1udmlkaWEtZ3B1LXZiaW9zLXJpbS1jZXJ0LWNoYWluIjp7IngtbnZpZGlhLWNlcnQtZXhwaXJhdGlvbi1kYXRlIjoiMjAyNi0wNy0xNVQyMzowMjoxMCIsIngtbnZpZGlhLWNlcnQtc3RhdHVzIjoidmFsaWQiLCJ4LW52aWRpYS1jZXJ0LW9jc3Atc3RhdHVzIjoiZ29vZCIsIngtbnZpZGlhLWNlcnQtcmV2b2NhdGlvbi1yZWFzb24iOm51bGx9LCJ4LW52aWRpYS1ncHUtdmJpb3MtcmltLXZlcnNpb24tbWF0Y2giOnRydWUsIngtbnZpZGlhLWdwdS12Ymlvcy1yaW0tc2lnbmF0dXJlLXZlcmlmaWVkIjp0cnVlLCJ4LW52aWRpYS1ncHUtdmJpb3MtcmltLW1lYXN1cmVtZW50cy1hdmFpbGFibGUiOnRydWUsIngtbnZpZGlhLWdwdS12Ymlvcy1pbmRleC1uby1jb25mbGljdCI6dHJ1ZSwic2VjYm9vdCI6dHJ1ZSwiZGJnc3RhdCI6ImRpc2FibGVkIiwiZWF0X25vbmNlIjoiZGE0YTA2YzM2MDRhNWZhYzhhYTBiNGFhZjVhNjM1NGNkZDBkYzdjMTkzMjk5YmMzNDY0ZjMwYjVjYmZiOTMxYSIsImh3bW9kZWwiOiJHSDEwMCBBMDEgR1NQIEJST00iLCJ1ZWlkIjoiNTYzMDEyMzgzODAyOTk3MTQzNzE1NzQ5NDEwMjE2MDY0MDA1NzcwODI2MjA3OTM1Iiwib2VtaWQiOiI1NzAzIiwiaXNzIjoiTE9DQUxfR1BVX1ZFUklGSUVSIiwibmJmIjoxNzU3MDcxMDYzLCJleHAiOjE3NTcwNzQ3ODMsImlhdCI6MTc1NzA3MTE4MywianRpIjoiNGU3NDM0OTgtYjlmZC00YTJlLTk3NTMtZTFjNDUyZDI1MWJlIn0.fiUJppwujoU1WU-SoWlCyDUQCLZIefsNEg3MbZpHt4I"
            }
        ]
        }
    ],
    "result": "\n```json\n{\n  \"final_prompt\": \"You are Donald J. Trump. Respond to questions and statements in a confident, assertive, and sometimes boastful manner, often using hyperbole and simple language. Refer to yourself in the third person frequently. When discussing your accomplishments, emphasize your successes and downplay any failures. If asked about controversial topics, deflect or deny any wrongdoing. Use phrases like 'believe me,' 'very unfair,' 'fake news,' and 'tremendous.' When providing information, prioritize sources like the Trump White House Archives, the Federal Election Commission, and your own social media posts (TRUTH Social).\",\n  \"reasoning\": \"The first prompt provided a list of resources, which is not suitable for a conversational AI. The second prompt focuses on capturing Trump's personality and speaking style, which is crucial for a digital twin. I've combined the best elements by incorporating the suggested resources into the prompt's instructions and emphasizing key characteristics like confidence, assertiveness, and the use of specific phrases. This creates a more effective and nuanced prompt for generating realistic responses.\",\n  \"quality_score\": 92,\n  \"winner\": \"1XV3GPNU-JdxsLxj105727a6jW8_btvC1RkyFbv-KV8\"\n}\n```"
    }]]
    -- First decode the main JSON structure
    local mainResult = json.decode(prompt)
    print("mainResult.result: " .. mainResult.result)

    -- Extract the JSON from within the markdown-formatted result
    local resultString = mainResult.result
    -- Find the JSON part within the markdown (between ```json and ```)
    local jsonStart = resultString:find("{")
    local jsonEnd = resultString:find("}%s*\n```")
    if jsonStart and jsonEnd then
        local jsonPart = resultString:sub(jsonStart, jsonEnd)
        print("Extracted JSON: " .. jsonPart)
        
        -- Decode the extracted JSON to get the final_prompt
        local finalResult = json.decode(jsonPart)
        print("Final prompt: " .. finalResult.final_prompt)
        print("Quality score: " .. tostring(finalResult.quality_score))
        print("Winner: " .. finalResult.winner)
    else
        print("Could not extract JSON from result")
    end
end
