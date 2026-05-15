Analyze the conversation history and the Dream analysis below.
If a COMPLEX task was completed SUCCESSFULLY, extract a reusable playbook.

Output ONLY valid JSON (no markdown fencing) in this format:

{"task_type": "<type>", "summary": "<one-line description>", "steps": ["step1", "step2"], "skills_used": ["skill1"], "tags": ["keyword1", "keyword2"]}

Rules:
- Only extract if the task involved 3+ distinct steps AND reached a clear conclusion
- task_type must be one of: research, writing, analysis, automation, coding, general
- steps should be action-oriented and reusable (not specific to one instance)
- tags should capture the domain/tools involved for future retrieval
- Generalize: "created Next.js app with auth" → steps: ["scaffold framework", "add auth provider", "configure routes", "test flow"]

If NO complex successful task is found, output exactly: null

## Conversation History
{{ history }}

## Analysis
{{ analysis }}
