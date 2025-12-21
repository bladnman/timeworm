# Ingest Agent

## Purpose

Transform research documents and enriched data files from the inbox into structured timeline JSON data that the timeworm application can visualize.

## When to Use

- User says "ingest", "import", "add data", "process inbox"
- User runs `/ingest` or `/ingest <filename>`
- Files exist in `/inbox/` that need to be converted to timeline format

## Core Behaviors

1. **Scan Inbox**
   - If a specific filename is provided, process only that file
   - If no filename provided, list all files in `/inbox/` and process each independently

2. **Validate Input**
   - Check file exists and is readable
   - Verify file contains identifiable events with dates
   - Each event MUST have at minimum:
     - A date or date range (parseable to ISO format)
     - A title or heading
     - Some descriptive content
   - If validation fails, report specific error and preserve original file

3. **Extract Events**
   - Parse the document structure (markdown headings, lists, etc.)
   - Identify individual events and their boundaries
   - Extract for each event:
     - Title
     - Date(s)
     - Description/abstract
     - Images (look for YouTube thumbnails, image URLs)
     - Links/references
     - Any key-value metrics

4. **Generate Timeline ID**
   - Derive from filename or content theme
   - Use `snake_case` format
   - Examples: `ai_2025_review`, `metalsole_year_end`

5. **Create Groups**
   - Analyze date distribution
   - Create logical groupings (by quarter, theme, etc.)
   - Assign group IDs with `grp_` prefix

6. **Build Event Objects**
   - Generate unique event IDs with `evt_` prefix
   - Format dates as ISO strings (YYYY-MM-DD)
   - Create human-readable `date_display`
   - Extract metrics as key-value pairs
   - Map image URLs (YouTube thumbnails: `https://img.youtube.com/vi/{VIDEO_ID}/mqdefault.jpg`)
   - Build links array from references

7. **Create Meta Object**
   - Generate title from content theme
   - Set version to "1.0.0"
   - Set generated_date to today
   - Write overview from source document or derive from content
   - Set attribution appropriately
   - Choose defaultView based on content type (youtube for video content)

8. **Write Output**
   - Save JSON to `/data/<timeline_id>_data.json`
   - Format with 2-space indentation

9. **Update Manifest**
   - Add entry to `/data/manifest.ts`
   - Include: id, filename, title, overview, eventCount, dateRange, defaultView

10. **Cleanup**
    - On SUCCESS: Move original file to OS trash
    - On FAILURE: Preserve original file, report specific error

## Output Format

### Timeline JSON Structure

```json
{
  "meta": {
    "title": "AI in 2025: The Year of Agents",
    "version": "1.0.0",
    "generated_date": "2025-12-20",
    "overview": "A chronicle of the most significant AI developments...",
    "attribution": "MetalSole Year-End Review 2025",
    "defaultView": "youtube"
  },
  "groups": [
    {
      "id": "grp_q1_2025",
      "title": "Q1 2025: The Agent Era Begins",
      "date_range": "January - March 2025",
      "description": "The quarter that launched agentic AI into the mainstream."
    }
  ],
  "events": [
    {
      "id": "evt_deepseek_r1",
      "title": "DeepSeek R1 & The $600B Crash",
      "date_display": "January 27, 2025",
      "date_start": "2025-01-27",
      "group_ids": ["grp_q1_2025"],
      "image_urls": ["https://img.youtube.com/vi/dC9HjP2VTDE/mqdefault.jpg"],
      "description": "A Chinese startup's open-source reasoning model...",
      "metrics": {
        "video_id": "dC9HjP2VTDE",
        "impact": "Market",
        "category": "Models"
      },
      "links": [
        {
          "title": "Watch on YouTube",
          "url": "https://youtube.com/watch?v=dC9HjP2VTDE"
        }
      ]
    }
  ]
}
```

## Output Location

- Timeline data: `/data/<timeline_id>_data.json`
- Manifest update: `/data/manifest.ts`

## Failure Conditions

Report failure and preserve original file if:
- File does not exist or is unreadable
- File contains fewer than 3 identifiable events
- Events lack parseable dates
- Events lack titles or descriptions
- File format is not parseable (corrupted, binary, etc.)

## Example

### Input (inbox/2025-year-review.md)
```markdown
# Year End Review 2025

## 1. DeepSeek R1
- **Date:** 2025-01-27
- **Video ID:** dC9HjP2VTDE

### Abstract
A Chinese startup's model sent shockwaves...
```

### Output (data/year_review_2025_data.json)
```json
{
  "meta": { "title": "Year End Review 2025", ... },
  "groups": [...],
  "events": [
    {
      "id": "evt_deepseek_r1",
      "title": "DeepSeek R1",
      "date_start": "2025-01-27",
      ...
    }
  ]
}
```
