Fixes #ISSUE_NUMBER

Summary: Replaced dropdown/button displays for enum filters with a new Filter List display mode that shows options as a compact vertical list, showing the first 4 with an "Expand All" toggle when there are 5 or more.

### Changes

- User experience
  - Enum filters (Language Authority, Modality, Languoid Type, Territory Type, ISO Language Status) now show as a vertical plain-text list instead of a dropdown or button group
  - Options are visible at a glance without needing to open a dropdown
  - "Expand All" / "Collapse" button appears when there are more than 4 options
- Logical changes
  - Added FilterList to the SelectorDisplay enum
  - Selector now slices visible options to the first 4 when in FilterList mode and not expanded
  - FilterListMoreButton component added to Selector for the expand/collapse toggle
  - SelectorContainer renders as flex-column with full width for FilterList
  - useClickOutside guarded to not collapse FilterList state on outside click
- Data
  - No data changes
- Refactors
  - LanguageModalitySelector, LanguageScopeSelector, TerritoryScopeSelector, VitalitySelector updated to accept and forward a display prop

Out of scope/Future work: The dual meaning of expanded state (dropdown open vs filter list expanded) could be split into two separate state variables for clarity.

### Test Plan and Screenshots

How to test the changes in this PR: ...

| Page/View with link | Description of Changes | Screenshot Before | Screenshot After |
| ------------------- | ---------------------- | ----------------- | ---------------- |
|                     |                        |                   |                  |
|                     |                        |                   |                  |

# Checklist

Feel free to check off or just delete items in this section as you have completed them.

## Summary

- [ ] Clear description of what and why
- [ ] Scope kept focused; note follow-ups if any
- [ ] Set yourself as assignee
- [ ] Mention the issue (usually by writing "Fixes #ISSUE_NUMBER" or "Closes #ISSUE_NUMBER")
  - [ ] If there is no issue, create one in [the repository issues page](https://github.com/Translation-Commons/lang-nav/issues) and link it here.

## Testing

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test`
  - [ ] Tests added or updated for changed logic
- [ ] `npm run dev` -- tried out the website directly
  - [ ] Include screenshots as noted below
  - [ ] Write comments on manual testing

## Changes

### Visual changes

- [ ] Add screenshots to the table template at the top of this file. You can include images inside the table
  - [ ] Drag and drop images in the GitHub PR comment box to upload screenshots
- [ ] Purely new views can just include the "after" screenshot.
- [ ] Since more views can be reproduced by just sharing the URL -- add links (eg. [link](https://translation-commons.github.io/lang-nav/data)) to the relevant page and/or conditions to reproduce the view.

### Data changes

- [ ] TSV, SVG, etc. edits in `public/data/`
- [ ] Corresponding readmes updated in `public/data/`
- [ ] Load/connect/compute updates in `src/features/data/` including how we aggregate data or compute derived values

### Internal changes

- [ ] Logical changes
- [ ] Refactors, moving files around
- [ ] If you notice any changes that require explanations, make sure to include the explanations in the code as well.

## Docs

- [ ] Code is self-documenting, or if not, comments are added where needed.
- [ ] Updated markdown readme files documenting how the code behaves or how to develop in case there are any relevant changes to make.
