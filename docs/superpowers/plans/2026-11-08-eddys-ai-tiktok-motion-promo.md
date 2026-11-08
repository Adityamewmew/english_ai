# EDDY'S AI TikTok Motion Promo Implementation Plan

**Goal:** Produce one 60-second, 9:16 promotional MP4 for TikTok: problem → solution → EDDY'S AI introduction → learning output.

**Execution update:** User selected Script 2, “Satu Pertanyaan, Satu Perjalanan,” after this plan was written. Delivered implementation uses eight scenes at 0–5, 5–12, 12–20, 20–28, 28–36, 36–44, 44–53, and 53–60 seconds. Current production details and rebuild commands are in `media/eddys-ai-promo/README.md`; the earlier nine-beat tasks below remain the planning draft.

**Architecture:** Keep video production isolated in `media/eddys-ai-promo/`; do not change the web or API application. Remotion renders frame-driven scenes. One cue file controls visual events, narration, music, and sound effects. Reuse authentic brand assets from `apps/web/public/`.

**Tech stack:** Remotion, React, TypeScript, Bun, FFmpeg/FFprobe, Python for audio and inspection. Use the same pinned Remotion version for all Remotion packages; verify installation before production.

## Sources and visual direction

- Motion reference: `ssstik.io_1794074486021.mp4` (27.008 seconds, 576×1024, 30 fps). Sampled frames show a mostly white field, large black prompt text, floating product/UI crops, quick push-ins and lateral slides, a thin colored connector path linking examples, motion blur during handoffs, and a clean logo end card. Recreate the visual grammar with EDDY'S AI content and authentic assets; do not copy the Runable logo, screens, or sample businesses.
- Story: the 60-second draft in the conversation, with nine beats at 0–5, 5–11, 11–17, 17–23, 23–30, 30–39, 39–48, 48–55, and 55–60 seconds. Merge or split beats only after checking narration timing.
- Product truth: `apps/api/src/server.ts`, curriculum, placement, voice, chat, and certificate handlers/usecases. Show placement, four skills, voice conversation, and saved progress. Do not imply one conversation automatically raises CEFR level.
- Skeuomorphism: `C:/project/smartlogy-laravel-starter-kit/skeumorphism.md`. Use familiar physical cues where they explain an action: a card that stacks, a microphone that depresses, a page that turns, and an achievement medallion. Avoid realistic texture on every element.
- Brand: `C:/project/smartlogy-laravel-starter-kit/design.md`. Background `#FFFFFF`; primary `#10375C`; secondary `#EB8317`; achievement accent `#F3C623`; card surface `#F4F6FF`. Headings: Plus Jakarta Sans. Body and labels: DM Sans. Card radius 20 px; button radius 16 px; achievement radius 28 px. Navy for primary text. Gold only for achievement.
- Existing implementation reference: `apps/web/src/app/globals.css` contains tactile button and badge styles. Reproduce their visual intent in video components, but do not import app CSS into Remotion.
- Reference adaptation: replace the teal connector with a restrained navy path that turns orange at user-action moments. Keep white negative space. Let EDDY'S AI cards and dashboard crops float with light physical depth; reserve stronger skeuomorphic pressing/stacking for the microphone and problem cards. Use the reference's camera rhythm without stretching its 27-second footage to 60 seconds.
- Brand assets: `apps/web/public/images/logo.webp`, `apps/web/public/images/logo-icon.webp`, and relevant `apps/web/public/illustrations/tutor/khoirul-*.webp`. Inspect each visually before choosing. Do not redraw or approximate logo or tutor character.

## Project file map

Create these files under `media/eddys-ai-promo/` during implementation:

| File | Responsibility |
|---|---|
| `package.json`, `tsconfig.json` | Standalone Remotion project; no root workspace changes. |
| `src/index.ts`, `src/root.tsx` | Register and define one 1080×1920, 30 fps, 1800-frame composition. |
| `src/tokens.ts` | Brand colors, typography roles, radii, shadow/elevation values, portrait safe area. |
| `src/scene-plan.ts` | Typed nine-beat storyboard and display copy. |
| `scripts/make-cues.py`, `src/cues.json` | Single source of scene boundaries, visual events, SFX hits, and narration timings. |
| `src/components/` | Small reusable card, button, microphone, waveform, dashboard, caption, and transition components. Each file below 600 lines. |
| `src/scenes/` | One scene file per narrative beat; scenes share the waveform/path motif. |
| `src/main.tsx` | Compose scenes, transitions, captions, narration, music, and SFX. |
| `scripts/make-audio.py` | Produce original music and event-linked SFX from `cues.json`. |
| `scripts/inspect-output.py` | Generate contact sheet from final MP4 and report frame/duration/audio checks. |
| `public/brand/`, `public/audio/` | Local copies of selected brand assets and final audio tracks. |
| `out/` | Preview stills, review MP4, final MP4, and QA report. |

## Production tasks

### 1. Lock message and claims

- [ ] Freeze the nine-beat story: study card → difficulty speaking → practice path → EDDY'S AI → placement → four skills → voice practice → saved progress → CTA.
- [ ] Edit the narration to fit 60 seconds at a natural Indonesian speaking pace; read it aloud and record measured duration. Reserve the last 4–5 seconds for logo and CTA.
- [ ] Keep screen text short: one main statement per beat, with subtitles following spoken phrases.
- [ ] Audit each visual claim against the running code. Use a clearly marked example for any fabricated conversation, score, name, or level. Exclude accreditation and guaranteed-fluency claims.
- [ ] Decide final CTA text as `Mulai latihan di EDDY'S AI`; use `https://eddys.ai` only after confirming it is the intended public destination.

### 2. Build visual style frames

- [ ] Inspect authentic logo and tutor assets; choose only assets that remain crisp and recognizable at 1080×1920.
- [ ] Install/bundle Plus Jakarta Sans and DM Sans locally. Confirm rendered fonts are present in stills; do not rely on a CDN.
- [ ] Create three approved style frames: problem card stack, voice-call hero, and learning dashboard/output. All use white background and brand palette.
- [ ] Compare these frames with the supplied reference for whitespace, scale, connector continuity, and clean typography; compare with `design.md` for brand identity.
- [ ] Give physical depth to selected hero objects: light top highlight, 1–2 layered shadows, pressed state, and restrained paper/card thickness. Keep everyday learning cards mostly flat, as `design.md` specifies.
- [ ] Check text and controls against TikTok overlay safe areas; reserve top and bottom margins and never place essential copy under platform UI.

### 3. Scaffold video and timing

- [ ] Create standalone Remotion project in `media/eddys-ai-promo/`. Pin all Remotion packages to one compatible version and install dependencies.
- [ ] Generate `src/cues.json` from `scripts/make-cues.py`. Encode exact boundaries, narration in/out, impact, card, microphone, dashboard, and CTA events there.
- [ ] Use `useCurrentFrame()` and frame-derived values for all rendered motion. Avoid autoplay, CSS animations, `setTimeout`, and unseeded randomness.
- [ ] Render frame 0 and one frame from each beat before building all scenes; verify composition size, fonts, and assets.

### 4. Animate scene sequence

- [ ] **0–5 s / Hook:** sentence fragments arrange on a physical study card; an approaching microphone reveals hesitation. Hook appears in frame 0.
- [ ] **5–11 s / Problem:** three cards for fear of mistakes, lack of speaking practice, and uncertain starting point stack with 50–100 ms stagger. Waveform breaks; audio rhythm briefly drops.
- [ ] **11–17 s / Bridge:** one moving waveform pushes the cards into a single learning path. Card edges become the next scene's interface rails.
- [ ] **17–23 s / Introduction:** path forms a clean reveal of the original EDDY'S AI logo, then moves into product UI. Keep logo readable before transition.
- [ ] **23–30 s / Placement:** answer selection depresses a tactile control; a level card emerges and connects to curriculum. Example result is labeled as illustration.
- [ ] **30–39 s / Four skills:** Reading highlight, Listening waveform, Writing sentence assembly, and Speaking microphone each perform one distinct action; cards transform into dashboard modules.
- [ ] **39–48 s / Voice:** microphone button depresses, student waveform moves to tutor, response waveform returns. Use an illustrative exchange with no promise of immediate mastery.
- [ ] **48–55 s / Output:** conversation bubble becomes a dashboard progress point; completed module gains status and next module opens. Gold appears only at an achievement moment.
- [ ] **55–60 s / CTA:** path resolves into microphone and authentic logo. Show CTA and destination after verification, held legibly through final frame.
- [ ] Connect scenes through an existing object, position, or action. Avoid repeated headline-card-caption layouts and repeated generic wipes.
- [ ] Include one wide overview where placement, skill cards, call UI, and output dashboard sit along the connected path, echoing the reference's portfolio overview while showing only EDDY'S AI UI.

### 5. Apply motion design consistently

- [ ] Set one energetic motion identity: ease-out entrances, ease-in exits, quick 150–250 ms control responses, 200–350 ms card moves, and 600–900 ms hero reveals.
- [ ] Use anticipation and short follow-through on the physical card and microphone; keep dashboard movement more restrained.
- [ ] Let one primary action lead attention. Stagger secondary elements within 500 ms; do not move all cards, labels, and background at once.
- [ ] Keep background white. Add secondary motion only where it clarifies state or provides physical weight. Test a still from each scene for readable hierarchy.
- [ ] Test random-access frames in nonsequential order; same frame must render identically each time.

### 6. Narration, music, and SFX

- [ ] Produce/obtain an Indonesian voiceover for the locked script, with clear usage rights. Save final recording as `public/audio/narration.wav`. Do not imitate a real person's voice without authorization.
- [ ] Generate original instrumental music and SFX from `src/cues.json`; use changes in music intensity for tension, solution, feature reveal, and CTA.
- [ ] Tie meaningful actions to sound: card stack, microphone press, answer selection, progress fill, and CTA. Leave space around narration so SFX do not mask words.
- [ ] Mix narration above music; normalize final audio and verify integrated loudness near −14 LUFS and true peak no higher than −1.2 dBFS.

### 7. Render and QA

- [ ] Render stills at frame 0, each beat midpoint, each transition midpoint, and final frame. Assemble contact sheet and inspect it.
- [ ] Render a short test spanning problem → solution and a second spanning voice → output. Fix pacing, clipping, and continuity before full render.
- [ ] Render complete 60-second H.264 MP4 at 1080×1920, 30 fps with AAC audio. Render in foreground; cap concurrency to available CPU.
- [ ] Extract frames from the **final MP4**, not just Remotion stills. Inspect typography, white background, logo, visual continuity, safe areas, and example-data labels.
- [ ] Run `ffprobe` for video/audio streams, 60-second duration within 0.1 second, 1080×1920 resolution, and 30 fps. Measure final loudness; listen through headphones for narration and SFX balance.
- [ ] Review product claims one last time and remove any claim the code or supplied evidence does not support.

## Acceptance criteria

- One playable TikTok MP4 in `media/eddys-ai-promo/out/` with 60 s ±0.1 s, 1080×1920, 30 fps, H.264 video, AAC audio.
- White background; brand colors and fonts match `design.md`; recognizable skeuomorphic depth on selected physical metaphors.
- All four story stages clear without reading the narration: problem, solution, EDDY'S AI, output.
- Motion is continuous across scenes, with meaningful card/dashboard transformations and no static slideshow sequence.
- Narration, music, and SFX audible and synchronized; final MP4 visually inspected.
- No application code changed; no invented user results or unsupported certification claims.

## Execution notes

- Environment check already found Bun, Node, npm, Python, FFmpeg, and FFprobe on this Windows host. Replace Linux-only commands from `PANDUAN-VIDEO-MOTION-FULL-NEW.md` with PowerShell/Windows equivalents.
- Existing uncommitted changes in `packages/shared/src/utils/speech-match.test.ts` and `PANDUAN-VIDEO-MOTION-FULL-NEW.md` belong to current workspace state; leave them untouched.
- Implementation should start with the three style frames and a short motion proof before rendering the full minute.
