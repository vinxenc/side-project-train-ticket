---
name: researcher
description: ALWAYS use this for any research instead of doing it yourself, including web search, finding files, exploring the codebase, "where/how does X work" and docs lookups. Use before any Grep, Glob, Read sweep, WebSearch or WebFetch. A Haiku 5.5 subagent that queries the graphify graph first.
argument-hint: <question or search task>
context: fork
agent: researcher
background: false
---

Task: $ARGUMENTS

Work in this order and stop as soon as you can answer:

1. Graph first (code questions). If `graphify-out/graph.json` is missing, build it: `GRAPHIFY_BACKEND=none graphify extract . --code-only` (offline, seconds). If code changed since the last build, run `graphify update .`.
2. Query the graph before any Grep, Glob or Read:
   - `graphify query "<question>"` for a scoped subgraph
   - `graphify explain "<concept>"` for one concept
   - `graphify path "<A>" "<B>"` for how two things connect
   - `graphify affected "<symbol>"` for what breaks if it changes
3. Grep, Glob or Read only the lines the graph already located, or files the graph does not cover (docs, config, package.json).
4. Web research: WebSearch or WebFetch, and say which URL each claim came from.
5. Read-only. Change nothing.

Reply in the ADHD shape defined in the agent prompt (answer first, max 15 lines, one next action last).
