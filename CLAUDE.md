## Research delegation

ALWAYS use the `researcher` skill (Haiku 5.5, graphify first) for any research: web search, finding files, exploring the codebase, docs lookups. Do not run WebSearch, WebFetch, Grep, Glob or exploratory Read yourself. The agent carries the /i-have-adhd output rules itself (cloned into `.claude/agents/researcher.md`). Whenever the researcher has run, ALWAYS apply the /i-have-adhd rules to your own reply that uses its result (the skill is user-invoked: don't try to load it, follow the rules from `.claude/agents/researcher.md`): answer or next action on the first line, numbered steps, max 5 items per list, `path:line` evidence, one under-2-minute next action last, no preamble, recap or closer. Never paste its output verbatim if it breaks these rules. Do not pass a per-call `model` when spawning the `researcher` agent directly: it would override the Haiku 5.5 pin.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
