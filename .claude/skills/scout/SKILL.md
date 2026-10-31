---
name: scout
description: Delegate any research, file search, codebase investigation or "where/how does X work" question to a Haiku 5.5 subagent instead of exploring yourself. Use before any Grep, Glob or Read sweep. It queries the graphify graph first.
argument-hint: <question or search task>
context: fork
agent: scout
background: false
---

Task: $ARGUMENTS

Work in this order and stop as soon as you can answer:

1. Graph first. If `graphify-out/graph.json` is missing, build it: `GRAPHIFY_BACKEND=none graphify extract . --code-only` (offline, seconds). If code changed since the last build, run `graphify update .`.
2. Query the graph before any Grep, Glob or Read:
   - `graphify query "<question>"` for a scoped subgraph
   - `graphify explain "<concept>"` for one concept
   - `graphify path "<A>" "<B>"` for how two things connect
   - `graphify affected "<symbol>"` for what breaks if it changes
3. Grep, Glob or Read only the lines the graph already located, or files the graph does not cover (docs, config, package.json).
4. Web research: WebSearch or WebFetch, and say which URL each claim came from.
5. Read-only. Change nothing.

Report the answer in the first line, then `path:line` references, at most 15 lines. Say so when the graph was missing or stale, or when you are unsure.
