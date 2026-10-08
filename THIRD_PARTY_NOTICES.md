# Third-party notices

This repository includes copies of, or code adapted from, the following MIT-licensed
projects. Each remains under its own license and copyright; see the source repository for
the full license text.

| Component | Where it lives here | Source | License |
| --- | --- | --- | --- |
| Hairline kernel (figure engine) | `src/components/hairline/document-stack/kernel.js` (re-exported by `src/components/hairline/kernel.js`) | [lucasmarkes/hairline](https://github.com/lucasmarkes/hairline) | MIT |
| hairline-create skill | `.claude/skills/hairline-create/` | [lucasmarkes/hairline](https://github.com/lucasmarkes/hairline) | MIT |
| emil-design-eng and mobile-native skills | `.claude/skills/emil-design-eng/`, `.claude/skills/mobile-native/` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT |
| vercel-react-best-practices skill | `.claude/skills/vercel-react-best-practices/` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | MIT (declared in the skill's `SKILL.md`) |
| Orb loader (S1 lattice) | `src/components/ui/spinner.tsx`, `spinner.module.css` | [kvnkld/aicss](https://github.com/kvnkld/aicss) | MIT |

The skills are recorded in `skills-lock.json` and can be reinstalled with `npx skills add`.
