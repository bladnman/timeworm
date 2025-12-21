# Timeworm Open Agent System

## System Purpose

Transform research documents and data files into structured timeline data for the timeworm visualization application.

## How It Works

This system uses a pointer pattern:
1. Entry points (CLAUDE.md) direct AI to read this file
2. This file catalogs available agents and routes requests
3. Agent definitions in `agents/` contain full specifications

## Project Structure

```
timeworm/
├── inbox/              # Input: raw research files to ingest
├── data/               # Output: timeline JSON files + manifest
│   └── manifest.ts     # Timeline registry
├── src/types/          # Schema definitions
│   └── timeline.ts     # TimelineData, TimelineEvent types
└── open-agents/        # This system
    ├── agents/         # Agent definitions
    └── output/         # Staging for processed files
```

## Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| **Ingest** | `agents/ingest.md` | Transform inbox files into timeline data |

## Routing Logic

| User Says | Route To |
|-----------|----------|
| "ingest", "import", "add data" | Ingest Agent |
| "process inbox", "convert file" | Ingest Agent |
| `/ingest` | Ingest Agent |
| `/ingest <filename>` | Ingest Agent (specific file) |

## Schema Reference

### TimelineData Structure

```typescript
interface TimelineData {
  meta: {
    title: string;
    version: string;
    generated_date: string;  // YYYY-MM-DD
    overview: string;
    attribution: string;
    defaultView?: ViewMode;
  };
  groups: Array<{
    id: string;
    title: string;
    date_range: string;
    description: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    date_display: string;
    date_start: string;      // YYYY-MM-DD or -YYYY-MM-DD for BCE
    date_end?: string;
    group_ids: string[];
    image_urls: string[];
    description: string;
    metrics: { [key: string]: string };
    links?: Array<{ title: string; url: string }>;
  }>;
}
```

### Manifest Entry

When adding a new timeline, update `data/manifest.ts`:

```typescript
{
  id: 'timeline_id',
  filename: 'timeline_id_data.json',
  title: 'Timeline Title',
  overview: 'Brief description',
  eventCount: 26,
  dateRange: '2025',
  defaultView: 'youtube',
}
```

## Behavioral Rules

### Git Commits
- Only commit when explicitly requested
- Use conventional commit format: `feat(data): add <timeline> timeline`

### Naming Conventions
- Timeline IDs: `snake_case` (e.g., `ai_2025_review`)
- Event IDs: `evt_<descriptive_name>` (e.g., `evt_deepseek_r1`)
- Group IDs: `grp_<descriptive_name>` (e.g., `grp_q1_2025`)

### File Operations
- On success: Move original to trash (use OS trash mechanism)
- On failure: Preserve original, report error with specific reason
- Never delete inbox files without successful data creation

## Operations Guide

### Adding a New Agent

1. Create agent file in `agents/<agent_name>.md`
2. Follow the agent template (Purpose, When to Use, Core Behaviors, Output)
3. Add to routing table in this file
4. Create command in `.claude/commands/agents/<agent_name>.md`
5. Commit changes

### Modifying an Agent

1. Edit the agent definition file
2. Update routing table if triggers change
3. Update command description if purpose changes
