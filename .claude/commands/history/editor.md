---
description: Enhance a history timeline JSON file
argument-hint: history file to edit
---

Edit and enhance a history timeline JSON file.

If no filename is provided, list the available history files in `data/` and ask the user to select one.

$ARGUMENTS

INSTRUCTIONS:

# History File Editor Agent

A professional editor agent for historical timeline data files. This agent reviews, validates, and enhances history JSON files to ensure high-quality, well-researched, and visually rich timeline content.

---

## When to Use This Agent

Use this agent when you need to:
- Edit and enhance a history file from `data/`
- Validate and improve descriptions, titles, and group assignments
- Verify and update image URLs for timeline events
- Ensure consistency and quality across timeline data

---

## Required Inputs

- **Target file**: A specific JSON history file from `data/`
- If no file is specified, prompt the user to select one from the available files

---

## File Structure Reference

History files follow this structure:

```json
{
  "meta": {
    "title": "String - Overall title of the history",
    "version": "String - Semantic version",
    "generated_date": "String - ISO date",
    "overview": "String - Markdown description of the entire history",
    "attribution": "String - Source attribution"
  },
  "groups": [
    {
      "id": "grp_xxx",
      "title": "String - Part/Era title",
      "date_range": "String - Human-readable date range",
      "description": "String - Markdown description of this era"
    }
  ],
  "events": [
    {
      "id": "evt_xxx",
      "title": "String - Short, punchy event title",
      "date_display": "String - Human-readable date",
      "date_start": "String - ISO date",
      "date_end": "String - Optional ISO date",
      "group_ids": ["grp_xxx"],
      "type": "String - Event category",
      "innovator": "String - Who/what is responsible",
      "innovation": "String - What was achieved",
      "image_urls": ["URL1", "URL2"],
      "description": "String - Markdown description",
      "metrics": {},
      "links": [{"title": "String", "url": "URL"}]
    }
  ]
}
```

---

## Process

### Phase 1: Initial Assessment

1. **Read the target history file** completely
2. **List all events** by ID and title for reference
3. **Identify issues** in each category:
   - Meta description quality
   - Group coverage and appropriateness
   - Event titles (length, clarity, interest)
   - Event descriptions (depth, formatting)
   - Image URL validity and coverage

### Phase 2: Validation & Updates (Per Event)

For EACH event, perform these checks and updates:

#### 2.1 Group Assignment
- Verify the event belongs to the correct group(s) based on date and theme
- Add or remove group IDs as appropriate
- Events can belong to multiple groups if they span eras

#### 2.2 Title Quality
**Guidelines:**
- Titles should be SHORT (3-7 words ideal, max 10)
- Titles should be INTERESTING and evocative
- Titles should capture the essence, not explain everything
- Avoid generic titles like "Important Development" or "Major Breakthrough"

**Examples:**
- BAD: "The Introduction of a New Computing Architecture"
- GOOD: "Attention Is All You Need"
- BAD: "First Robot Word Coined"
- GOOD: "Rossum's Universal Robots"

#### 2.3 Description Quality
**Guidelines:**
- Descriptions should use **markdown formatting**
- First 1-2 sentences should be a complete summary (the user should understand the core point immediately)
- Depth varies by importance:
  - Minor events: 2-4 sentences
  - Standard events: 1-2 paragraphs
  - Major events: 3-5 paragraphs
- Include context: What came before? What did this enable?
- Include specific details: dates, numbers, names
- Avoid teasing language—give the information upfront

**Structure for longer descriptions:**
```markdown
Opening statement summarizing the significance.

Context paragraph explaining the background and what problem this solved.

Details paragraph with specifics: who, what, when, technical details.

Impact paragraph explaining what this enabled or changed.
```

#### 2.4 Image URL Validation and Enhancement
**Requirements:**
- Image URLs MUST be PNG or JPEG (`.png`, `.jpg`, `.jpeg`)
- All URLs MUST be valid and return a 200 status
- EVERY event should have at least 1 image if possible
- Maximum of 5 images per event
- First image in the array is the KEY IMAGE (most representative)

**Validation Process:**
Use the image validation script at `data/scripts/validate_image_url.sh`:
```bash
./data/scripts/validate_image_url.sh "https://example.com/image.jpg"
```

Returns:
- `VALID` - URL works and is correct format
- `INVALID` - URL doesn't work
- `WRONG_TYPE` - URL works but not PNG/JPEG

**Finding New Images:**
When images are invalid or missing:
1. Search the web for historical images related to the event
2. Prefer Wikimedia Commons URLs (stable, well-formatted)
3. Verify each candidate URL before adding
4. Ensure images are historically relevant and accurate
5. First image should be the most iconic/representative

#### 2.5 Link Validation and Enhancement

We want valid references to the event. Find at least one reference to the event, more if possible. Most informative or reputable at the top of the list.

### Phase 3: Meta & Group Review

1. **Meta Overview**: Ensure the overview provides a compelling introduction to the entire timeline. Use markdown formatting.

2. **Groups**:
   - Verify all groups have meaningful descriptions
   - Ensure date ranges are accurate
   - Check that group titles are clear and thematic

### Phase 4: Final Validation

1. Re-validate all image URLs one final time
2. Ensure JSON is valid
3. Update the `version` field (increment patch version)
4. Update `generated_date` to current date

---

## Output Location

Update the file in place: `data/{filename}.json`

---

## Working List Management

Because history files contain many events (often 20+), maintain a working checklist:

```markdown
## Working List: {filename}

### Events to Process:
- [ ] evt_001 - Event Title
- [ ] evt_002 - Event Title
...

### Completed:
- [x] evt_001 - Event Title (images validated, description enhanced)
...
```

Track progress explicitly. Do NOT try to process all events in one pass—this leads to errors and omissions.

---

## Image Validation Script

A bash script exists at `data/scripts/validate_image_url.sh` for validating image URLs.

**Usage:**
```bash
# Single URL
./data/scripts/validate_image_url.sh "https://example.com/image.jpg"

# Check if script exists
ls -la data/scripts/validate_image_url.sh
```

The script checks:
1. URL returns HTTP 200
2. Content-Type is image/png or image/jpeg
3. URL ends in appropriate extension

---

## Quality Standards

### Titles
- Short and punchy (3-7 words)
- Evocative, not descriptive
- Specific, not generic

### Descriptions
- Markdown formatted
- Informative opening (no teasing)
- Appropriate depth for significance
- Specific facts and context

### Images
- Valid URLs only
- PNG or JPEG format
- First image is key art
- 1-5 images per event
- Historically relevant

### Groups
- Logical date ranges
- Clear thematic boundaries
- Descriptive titles

---

## Example Workflow

1. User invokes: `/history editor ai_history_data.json`
2. Agent reads `data/ai_history_data.json`
3. Agent creates working list of all events
4. For each event:
   - Check group assignment
   - Evaluate title (shorten if needed)
   - Enhance description (add depth, format as markdown)
   - Validate image URLs (use script)
   - Find new images if needed (web search)
5. Review meta and groups
6. Save updated file
7. Commit changes

---

## Commit Protocol

After making significant changes (every 3-5 events or when done):
```bash
git add data/{filename}.json
git commit -m "Update {history_name}: enhance events evt_xxx through evt_yyy"
```
