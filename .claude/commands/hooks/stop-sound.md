---
description: Add a stop sound hook for this repository
---

Add a Stop hook to `.claude/settings.json` that plays a sound when Claude returns control to the user.

**Sound file path provided:** `$ARGUMENTS`

## Instructions

1. **Validate the argument**: The user must provide a path to a sound file. If `$ARGUMENTS` is empty, ask the user to provide a path to a sound file and stop.

2. **Check/create `.claude/settings.json`**:
   - If `.claude/settings.json` doesn't exist, create it with an empty object `{}`
   - If it exists, read its current contents

3. **Check for existing Stop hooks**:
   - If there's already a `hooks.Stop` array with entries, tell the user: "There's already a Stop hook configured. Do you want to add another one?" and wait for confirmation before proceeding.
   - If the user declines, stop without making changes.

4. **Add the new Stop hook**:
   - The hook command should be: `afplay -v 0.2 "<sound_file_path>"`
   - The path MUST be wrapped in escaped quotes (`\"`) to handle spaces in paths
   - Add this to the `hooks.Stop` array (create the array if it doesn't exist)

5. **Write the updated settings.json** and confirm success.

## Expected structure

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "afplay -v 0.2 \"<sound_file_path>\""
          }
        ]
      }
    ]
  }
}
```

If there are existing hooks, preserve them and append the new one to the `Stop` array.
