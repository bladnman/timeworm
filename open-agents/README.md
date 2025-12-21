# Open Agent System: Timeworm

This folder contains AI agent definitions for automating timeworm workflows.

## Quick Reference

| Agent | Command | Description |
|-------|---------|-------------|
| Ingest | `/ingest` | Transform inbox files into timeline data |

## Structure

```
open-agents/
├── README.md           # This file
├── INSTRUCTIONS.md     # Agent catalog & routing (AI reads this)
├── agents/             # Agent definitions
│   └── ingest.md       # Data ingestion agent
└── output/             # Successful ingestion outputs (staging)
```

## How It Works

1. Place research files in `/inbox/`
2. Run `/ingest` or `/ingest <filename>`
3. Agent validates, transforms, and creates timeline data
4. On success: data file created, original moved to trash
5. On failure: error reported, original preserved

## Data Schema

Timeline events require:
- `id`: Unique identifier (e.g., `evt_deepseek_r1`)
- `title`: Event title
- `date_display`: Human-readable date (e.g., "January 2025")
- `date_start`: ISO date (e.g., "2025-01-27")
- `group_ids`: Array of group references
- `image_urls`: Array of image URLs
- `description`: Event description
- `metrics`: Key-value pairs for event-specific data
- `links`: Optional array of `{title, url}` references
