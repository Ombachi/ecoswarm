# Clean typography, routing, and PWA update plan

## Goal
Make EcoSwarm load reliably from installed and deep-linked sessions, remove rainbow text styling, restore broken landing sections, and return every route to the top.

## Changes
1. **Solid typography**
   - Replace every `eco-gradient-text` and gradient-clipped text span across landing, About, marketplace, and signed-in pages with semantic solid colors.
   - Use restrained forest green for emphasis and normal foreground color where stronger readability is appropriate.
   - Remove the obsolete gradient-text helper after confirming no references remain.

2. **Repair recent landing-page edits**
   - Fix the malformed icon elements currently breaking the FAQ, Live the Change, and About sections.
   - Preserve the intended icons and existing page structure.

3. **Installed-app start and updates**
   - Change the installed app start path from `/login` to `/`.
   - Switch generated service-worker updates to `autoUpdate`, enable immediate activation and client claiming, and retain outdated-cache cleanup.
   - Keep service workers disabled and cleaned up in development and Lovable preview contexts.

4. **Deep-link support on Vercel**
   - Add a root `vercel.json` rewrite so `/courses`, `/ecomarket`, `/about`, and other direct links serve the React app instead of a Vercel 404.

5. **Route scroll behavior**
   - Add one global listener inside the router that resets the page to the top whenever the pathname changes.

6. **Validation**
   - Confirm no gradient-text or malformed icon markup remains.
   - Check the generated app manifest and service-worker output.
   - Verify the homepage, About, Courses, and EcoMarket routes on desktop and phone-sized screens.
   - Confirm the current preview reports no build or runtime errors.

## Technical details
- Use semantic theme classes rather than hardcoded text colors.
- Keep Vite's existing dynamic-import recovery and the guarded service-worker update flow.
- The Vercel rewrite affects only Vercel hosting; Lovable hosting already provides client-side route fallback.
- Existing installed copies may need one launch after publishing for the browser to receive the new worker and manifest.
