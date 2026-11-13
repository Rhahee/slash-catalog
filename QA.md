# QA — image prompt catalog

## Scheduled update — 13 November 2026

- Reviewed Arjav Jain's author-published list at https://arjavjain.org/posts/chatgpt-image-prompt-codes-slash-commands. Added /birdseye (overhead tabletop composition) and /blueprint (white-line technical-style illustration); these concepts are distinct from the six existing entries. This run selected two additions, not an exhaustive import of the source list. The six prior entry objects are unchanged.
- Catalog now has eight entries, with original full Indonesian/English prompts, localized input/steps/result/example metadata, community attribution, and checkedAt 2026-11-13. Blueprint is explicitly a decorative concept illustration without validated scale or manufacturing dimensions.
- Created assets/examples/birdseye.png and assets/examples/blueprint.png through built-in image_gen without input images. Inspected both returned images: overhead coffee arrangement and three mug line views on blue paper; no unwanted text or logos. The blueprint upper-left view contains a slightly elliptical rim, so it should not be treated as strict orthographic geometry. Actual tool prompts and output/source file paths are in artifacts/image-generation-prompts.json; copied bytes match the source PNGs.
- npm test: 9 passed. Server syntax and git diff --check passed. New bilingual searches with category filters passed. All ten public page/data/image routes on http://127.0.0.1:4177/ returned HTTP 200, with image/png for all eight images.
- In-app browser was unavailable. Browser verification succeeded through connected Brave: eight entries listed, both new detail dialogs open, language switching ID/EN works, birdseye search returns one result, and both new example images decode at 1254 x 1254. Desktop screenshot inspection showed readable modal layout and vertical scrolling. Mobile layout and clipboard were not retested for this content-only addition.
- Updated the server's explicit asset allowlist. A separate local preview uses port 4177; earlier servers were not stopped or restarted. No commit, push, or deploy.

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
