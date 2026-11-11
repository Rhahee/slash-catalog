# QA — image prompt catalog

## Update — 11 November 2026

- Added /storybook after reviewing https://www.wishyani.com/commands/storybook and the source index. This is the only additional image shorthand in that index; /eli5 and /tldr are text prompts and remain outside catalog scope.
- Catalog now has six entries. Added the bilingual Illustration category, original Indonesian/English prompts, attribution, actual review date, and localized example descriptions.
- Generated assets/examples/storybook.png with built-in image_gen, without input images. Visually inspected the returned image: a fictional rabbit waters a seedling in a blue mug; warm painted texture, visible handle, no unwanted lettering. Actual prompt and source/output paths are recorded in artifacts/image-generation-prompts.json. Source and copied PNG bytes match.
- npm test: all 9 passed. Server syntax check passed. New-entry searches in both languages with the Illustration category passed.
- On http://127.0.0.1:4176/, the page, catalog JSON, and all six PNG routes return HTTP 200; PNG routes return image/png. This separate preview serves the updated allowlist without interrupting existing servers.
- Browser preview could not be opened: two computer-use attempts timed out. Browser rendering and interaction for this addition were not verified. Earlier browser observations below apply only to the 10 November version.

## Previous verification — 10 November 2026

Date: 10 November 2026.

## Current scope

All 10 prior general-command, feature, and editor entries were removed from the active catalog. Five replacement community shorthand entries are published: /metaads, /3dbillboard, /showcase, /ugcmodel, and /miniature.

The schema requires version 2, image-prompts scope, community-shorthand type, chatgpt-images platform, full bilingual content, and a local image example. Old application-entry shapes are rejected. Source review establishes community usage of the code names, not official command registration. The copy button copies full instructions.

## Visual assets

Five independent images were generated with built-in image_gen from complete English descriptions. No input images. The common subject is a fictional unbranded blue ceramic mug. The UGC person and billboard installation are fictional.

Inspected every output: recognizable mug, distinct intended style, no unwanted readable text or brand, and usable composition. Product details are not claimed to be identical between independent images. Files were copied into assets/examples; source originals retained. Actual tool prompts are recorded in artifacts/image-generation-prompts.json.

## Automated checks

- `npm test`: 9 passed.
- `node --check app.js` and `node --check scripts/serve.mjs`: passed.
- Tests cover legacy-scope rejection, metadata, both languages, category/query combination, access-label search, hash parsing, HTTPS source URLs, and existing square PNGs for every public entry.

## Preview environment

Automatic review rejected the command to stop and restart the existing 4173 process (reported reason: blocked by policy). It was not retried. A separate server on 4174 serves the updated allowlist and images, without stopping the original process. Use the 4174 preview for this revision; manually restart 4173 later if desired.

## HTTP and browser checks

- Website, data JSON, and all five PNG routes on 4174 return HTTP 200. Image responses use image/png.
- In-app browser loads exactly five new shorthand entries; no general app entries remain in the data, UI labels, or source notes.
- Search for diorama returns one entry. Combining it with Advertising shows no results; reset restores all five.
- Copy Indonesian and English /showcase prompts: clipboard begins with complete instructions, not shorthand; feedback succeeds.
- Detail example PNG is decoded (1254 px natural width), with localized alt text and an honest AI provenance caption.
- Reload preserves /showcase and English; Escape closes the modal. Back closes /metaads and Forward reopens it.
- Mobile modal at 320 × 740 fits without horizontal document overflow; content scrolls vertically.
- No warning/error console entries observed on the new preview origin.

Final screenshots are saved in artifacts/catalog-image-prompts-desktop.png and artifacts/catalog-image-prompts-mobile.png.
