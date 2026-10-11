# Build my portfolio website: complete specification

You are building my personal portfolio website as a production **Next.js** app.

**Me:** Arslan Mahtab, software engineer and senior Shopify developer, based in Pakistan.
**Goal:** win Shopify clients (store owners) *and* software clients (SaaS founders, businesses needing web apps and AI). The site has two home pages, a Shopify portfolio and a software engineering portfolio, with an animated switch between them.

A complete working prototype is in `reference/arslan-portfolio.html`. **Open and study it before writing any code.** It is the design source of truth for copy, colours, fonts, layout, section order, interactions, character drawings and animation timing. Rebuild it faithfully as a Next.js app. Where this document and the prototype disagree, follow this document.

Work in the phases listed in section 16. After each phase, run the dev server, fix all errors and warnings, check the page at desktop (1440px) and mobile (390px) widths, and commit with a clear message. Do not move on until the phase works.

---

## 1. Tech stack

Use the latest stable versions.

| Purpose | Package | Notes |
|---|---|---|
| Framework | `next` (App Router), `react`, `react-dom` | Server components by default; mark animated components `"use client"` |
| Language | `typescript` | Strict mode |
| Styling | `tailwindcss` | Design tokens as CSS variables (section 3); custom CSS allowed for complex effects |
| UI animation | `motion` (import from `motion/react`) | Motion for React, formerly Framer Motion. The same engine Framer uses |
| Scroll animation | `gsap` with `ScrollTrigger` and `Flip`, plus `@gsap/react` | Use the `useGSAP()` hook for every GSAP animation so it cleans up automatically |
| Smooth scroll | `lenis` | Synced with ScrollTrigger |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` | For the three 3D characters |
| Utilities | `clsx` | Class names |
| Fonts | `next/font/google` | Syne, Manrope, Instrument Serif |
| Hosting | Vercel | |

No UI component kits, so no shadcn, MUI or Chakra. Build every component by hand.

### Which animation tool is used for what

Follow this split strictly so animations stay consistent and maintainable.

| Use | Tool |
|---|---|
| Section entrances, staggered reveals, spring pop-ins, hover and tap states, the mode toggle thumb, the page-switch overlay, the service-detail panel expanding from its card, the services filter reshuffle, count-up numbers | **Motion** (`motion/react`): `motion.div`, `AnimatePresence`, `layout` / `layoutId`, `useInView`, `useScroll`, `useTransform`, `useSpring`, `animate()` for numbers |
| Anything tied to scroll position: pinned sections, horizontal scroll, scrubbed text, the hero leaving on scroll, the footer signature fill, marquee skew from scroll speed | **GSAP + ScrollTrigger** via `useGSAP()` |
| Long scripted sequences with exact timing: the reception lobby story, the "code to checkout" build sequence, the loader | **GSAP timelines** (`gsap.timeline()`) |
| Smooth scrolling for the whole page | **Lenis** |
| All 3D characters and the hero 3D scene | **React Three Fiber + Drei**, animated in `useFrame` |
| 2D characters (Bago, desk scene, lobby people) | **Inline SVG React components**. Idle loops in CSS `@keyframes`; scripted moves with GSAP |
| Endless decorative loops (floating, blinking, pulsing, marquees, spinning rings, grain) | **CSS `@keyframes`** (cheapest, runs off the main thread) |

---

## 2. Folder structure

```
app/
  layout.tsx            fonts, metadata base, providers, navbar, footer, global overlays
  page.tsx              Shopify home  (/)
  software/page.tsx     Software home (/software)
  api/assistant/route.ts  voice assistant answers
  sitemap.ts  robots.ts  opengraph-image.tsx
components/
  providers/            SmoothScroll (Lenis + ScrollTrigger), ModeTransition
  layout/               Navbar, ModeToggle, Footer, ScrollProgress, Cursor, Grain, AmbientBackground
  ui/                   AnimatedButton, GlassCard, Highlight, SectionReveal, SplitText, Pill, Marquee
  characters/           HeroRobot3D, FooterRobot3D, DevAndroid3D, Bago, DeskScene, LobbyPeople
  sections/shopify/     one file per section
  sections/software/    one file per section
  sections/shared/      ReceptionLobby, ServiceDialog, Contact
data/                   projects.ts, services.ts, lobbyServices.ts, faq.ts, pricing.ts, voiceAnswers.ts, stack.ts
config/site.ts          name, email, WhatsApp, LinkedIn, timezone
lib/                    gsap.ts (registers plugins once), hooks (useReducedMotionSoft, useInViewOnce, usePointer)
public/llms.txt
reference/arslan-portfolio.html
```

All text content lives in `data/` and `config/`, so I can edit words without touching components.

---

## 3. Design system

### Colour tokens

Dark theme is the default; add a light theme with `prefers-color-scheme: light`.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0C0A1A` | `#F4F2FB` | page background |
| `--bg-2` | `#15122B` | `#E9E5F7` | panels |
| `--card` | `#1B1734` | `#FFFFFF` | cards |
| `--fg` | `#F2EEFF` | `#141029` | text |
| `--fg-2` | `#ABA5C9` | `#565174` | secondary text |
| `--line` | `#2C2748` | `#D8D2EE` | borders |
| `--violet` | `#8A7CFF` | `#5440EE` | secondary accent |
| `--lime` | `#C6F24E` | `#C6F24E` | **primary buttons, highlights, badges** |
| `--on-lime` | `#0A0D00` | `#0A0D00` | text on lime |
| `--lime-text` | `#C6F24E` | `#4A6B00` | lime used as text or icon colour |
| `--glass` | card colour at 48% opacity | white at 55% | glass fill |
| `--glass-border` | `rgba(255,255,255,.12)` | `rgba(20,16,41,.09)` | glass border |

### Typography

- **Syne** 600/700/800 for headings and big numbers, with tight letter-spacing (−0.03em to −0.055em).
- **Manrope** 400–700 for body text and UI.
- **Instrument Serif italic** for one accent word or phrase per heading, e.g. "From code to *checkout*." Render the accent at about 1.08em.
- Headline sizes use `clamp()`. The hero h1 goes up to about 8.4rem on desktop.

### Glass style (`GlassCard`)

- **Fill:** translucent `--glass`, with `backdrop-filter: blur(18px) saturate(150%)`.
- **Edges:** 1px `--glass-border`, plus an inset top highlight and a soft drop shadow.
- **Hover:** a diagonal light sheen sweeps across the card (a `::after` gradient moving from translateX(−120%) to 120% over 1s).

Used for the navbar pill, cards, panels, chips, dialogs and the voice panel.

### Signature elements

- **Lime highlight box:** a lime background with black bold text that wipes in from the left (scaleX 0 → 1, origin left, about 0.9s), then the text springs in.
- **Ambient background:** three huge radial-gradient blobs (violet, lime, pink) fixed behind everything at low opacity, drifting slowly (24–36s alternate loop).
- **Film grain:** a fixed SVG `feTurbulence` noise layer at about 5.5% opacity (3.5% in light mode), shifting position in 4 steps per 1.2s.
- **Scroll progress line:** a 2px violet-to-lime gradient bar fixed to the top, scaleX tied to page scroll.

---

## 4. Global layout (both pages)

### Navbar

- A floating glass pill, 64px tall, 12px from the top.
- **Contents:** my name, the page's section links, the **mode toggle**, and a lime "Start a project" button.
- Section links hide below 1120px; the button hides below 620px. The toggle is always visible.
- The navbar hides when scrolling down and reappears when scrolling up (GSAP ScrollTrigger direction).

**Shopify links:** Reception, Work, AI ranking, Shopify Plus, Services, Pricing.
**Software links:** Reception, About, Stack, Build, AI, SaaS, Projects.

### Mode toggle and page switch

- **The toggle:** a pill with two options, `[🛍 Shopify | </> Software]`.
  - The active option sits on a lime thumb that springs between options using Motion `layoutId` (spring, slight overshoot).
  - Clicking navigates between `/` and `/software`.
- **The page-switch overlay**, built in a `ModeTransition` provider with `AnimatePresence`:
  1. A full-screen panel slides up from the bottom (0.65s, ease `[.76,0,.24,1]`). It's lime for Software and violet for Shopify.
  2. "Switching to" and a huge "Software engineering" or "Shopify portfolio" spring in.
  3. The route changes and the page scrolls to the top instantly.
  4. After about 0.65s the panel slides out through the top (0.7s).
- **Cross-links in each hero:** a glass pill button links to the other home. On Shopify: "Hiring a software engineer? **See my full stack work** →". On Software: "Need a Shopify store? **See my Shopify portfolio** →". Its arrow nudges right on hover.

### Custom cursor (fine pointers only)

- **Small dot:** follows the mouse instantly with `mix-blend-mode: difference`, and grows over links and buttons.
- **Ring:** a 38px outline ring follows with a soft lag (GSAP `quickTo`, 0.6s).
- **Labels:** over elements with `data-cursor="..."`, the ring grows to 88px, fills lime, shows the word in black, and the dot hides. Labels:
  - "Drag" on the store slider
  - "Open" on reception service cards
  - "Visit" on featured work previews
  - "Say hi" on the developer android
  - "Talk" on the voice orb
  - "Wave" on the desk scene
- Hide both on touch devices.

### Smooth scroll provider

- Lenis with `lerp: 0.09`, driven from the GSAP ticker, calling `ScrollTrigger.update` on scroll, with lag smoothing off.
- Anchor links scroll through Lenis.
- Expose `lenis.stop()` and `start()` so dialogs can lock scroll.

### Loader (first visit only)

A full-screen violet panel with a huge counter counting 0 to 100 over 1.5s (GSAP). The panel then wipes up (yPercent −100, `expo.inOut`) and the hero intro starts.

---

## 5. AnimatedButton (used everywhere)

One reusable component that renders as either a link or a button.

- **Primary:** lime fill, black text, a lime glow shadow. **Secondary:** transparent with a 1.5px border.
- **Hover:**
  - **Fill circle:** a circle grows from the exact point where the cursor entered (store the entry x/y as CSS variables; the circle is scaled 0 → 1 over 0.65s, sized to about 2.2× the button's diagonal). Leaving shrinks it toward the exit point. Primary buttons fill with `--fg`; secondary ones fill lime.
  - **Rolling text:** the label is split into letters. Each letter slides up and out while a duplicate slides in from below, staggered 14ms per letter (0.55s, ease `cubic-bezier(.7,0,.2,1)`).
  - **Arrow swap:** a ↗ arrow icon flies out to the top-right while a second one slides in from the bottom-left.
- **Click:** a ripple circle expands from the click point and fades. The button presses down to scale 0.95.
- **Idle (primary only):** a white shimmer sweeps across every 4.5s.
- **Magnetic (desktop):** the button pulls toward the cursor (30–35% of the offset) and springs back with an elastic ease when the cursor leaves.
- Screen readers hear the label once (`aria-label` on the button, duplicates `aria-hidden`).

---

## 6. Characters

All 3D characters are built from three.js primitives in code (spheres, cylinders, tori, boxes); **there are no external model files.**

- Load every 3D canvas with `next/dynamic` and `ssr: false`, inside a container with a fixed height so nothing shifts.
- Cap `dpr` at `[1, 2]`.
- Pause rendering with `frameloop="demand"`, or skip work in `useFrame`, when the canvas is offscreen (IntersectionObserver), the tab is hidden, or the character's page isn't active.
- If WebGL fails, show nothing and keep the layout stable.

### 6.1 Hero robot (Shopify home, 3D, R3F)

- **Look:** a cute glossy robot.
  - White body (roughness .22) with a black glossy visor (partial sphere).
  - Glowing lime emissive eyes (flattened spheres) and a smile (half torus).
  - Dark ear discs with lime rings, and an antenna with a glowing bulb.
  - A dark chest plate with a pulsing lime "heart" light, and cylinder arms with dark sphere hands.
  - It hovers on a glowing lime jet ring instead of legs.
- **Scene:** the robot sits inside a slowly rotating wireframe icosahedron "AI sphere" with glowing vertex points. Six coloured cubes orbit it, 600 star particles drift around it, and violet and white lighting surrounds it.
- **Motion:**
  - It floats up and down, and its body and head turn toward the mouse (smooth lerp).
  - It blinks at random intervals of 2–5s.
  - It waves its right arm for about 2s every 8s.
  - The heart light pulses, the jet ring pulses, and the camera drifts with the mouse.
  - On scroll, the whole group rotates and the hero text moves up and fades (GSAP ScrollTrigger scrub).
- **Placement:** on desktop it sits to the right of the headline; on mobile it's below the text, scaled to about 0.62.

### 6.2 Footer robot (both pages, 3D, R3F)

- **Look:** the same robot design, in a strip about 240px tall in the contact section, with a dashed "floor" line.
- **Story,** each time the strip scrolls into view:
  1. It glides in from off-screen left (2.8s ease-out) with a bouncy hover-walk, turned toward its direction of travel and leaning slightly.
  2. It stops in the centre, faces the viewer, and waves for about 3s while a glass speech bubble ("Thanks for visiting! Let's talk.") pops above its head. The bubble position is projected from 3D to screen each frame.
  3. It glides off to the right (2.4s ease-in) and disappears.
- **After it leaves:** a "Bring the robot back" button fades in. The Bago mascot hides while the robot is on screen.

### 6.3 Developer android (Software home, "Clean code. Calm delivery." section, 3D, R3F)

Classy and premium, not cute.

- **Look:**
  - A matte black metallic body (metalness .55) with white accent joints, collar and ear discs.
  - A glossy black visor, a single lime LED eye band that blinks, and a lime chest LED line.
- **Pose:** sitting cross-legged on a floating glass platform with a pulsing lime LED ring and a thin violet outer ring. It types on a **holographic laptop**: a metal base plus a see-through glowing screen showing code (CanvasTexture).
- **Holographic panels:** three translucent code panels (`Hero.tsx`, `OrderController.php`, `agent.ts`) orbit slowly. They always face the camera (billboard), and their code scrolls one line per second (redrawn `CanvasTexture`).
- **Lighting:** a violet rim light behind, a lime fill light, ACES filmic tone mapping, sRGB output, and about 160 lime dust particles drifting.
- **Motion:**
  - Its forearms alternate typing.
  - Its head follows the mouse, it glances at the viewer every few seconds, and it blinks.
  - The platform floats, and the whole scene tilts slightly with the mouse.
- **Interaction:** when the section enters view, and on each click or Enter key, it raises its right arm and waves while a speech bubble shows a rotating line:
  - "Hi! Let's build something great."
  - "Clean code, every time."
  - "Shipping your SaaS this sprint?"
  - "React, Laravel or Next.js?"
  - "AI agents? I've got you."
  - "Tests passed. Deploying."

### 6.4 Bago mascot (Shopify home only, SVG)

- **Look:** a cartoon amber shopping bag with eyes, cheeks, a smile, little arms and feet, fixed in the bottom-right corner.
- **Idle:** it bobs up and down, its shadow breathes, it blinks, and its pupils follow the cursor.
- **Entrance:** it bounces in after the loader and waves.
- **Click:** it jumps, its mouth opens, and it says a fun line.
- **Speech bubble:** it changes for each section as you scroll (GSAP ScrollTrigger per section) and hides after about 6.5s.
- **Hidden:** it hides on the software page and while the footer robot is visible.
- **Lines:** reuse the prototype's copy.

### 6.5 Developer desk scene (Shopify home, before the footer, SVG)

- A cartoon developer with glasses and a violet hoodie, typing at a laptop with the head nodding.
- Code tokens (`{% %}`, `</>`, "+1 order", "Liquid", "$$$") float up from the laptop.
- Coffee steams, a plant sways, and a mini Bago hops on the desk.
- A "Let's build it!" bubble pops in on scroll.
- On hover or tap, the developer waves.

### 6.6 Reception lobby people (both pages, SVG): see section 7

---

## 7. Reception lobby (both pages, right after the hero)

This is a short animated story where the visitor "enters the studio" and picks a service. It's built as one shared `ReceptionLobby` component that takes a `set` prop (`"shop"` or `"software"`).

### Scene

An inline SVG with viewBox 1000×460, inside a rounded glass frame. Each instance needs unique SVG ids.

- **Room:**
  - A back wall with a subtle vertical panel grid and a polished floor with perspective lines.
  - Two hanging pendant lamps with soft lime light cones, and the lamp bulbs pulse.
  - A framed abstract artwork whose violet and lime design slowly rotates.
  - Two potted plants with swaying leaves.
  - A large italic serif "Reception" sign with a lime dot.
- **Gate:**
  - A frame with a lime top beam and a "WELCOME" sign, plus two sliding glass doors with lime edges and handles.
  - A white light reflection sweeps across the glass every 5.5s.
  - A lime glow fills the doorway when it opens.
- **Guard:** standing just inside the gate, facing left. Navy uniform, cap with a lime badge, and a lime chest badge.
- **Receptionist:** behind the desk, facing the visitor. White blouse with a violet collar, hair bun, and a lime headset with a mic.
- **Desk:** a glass top, a dark front panel with a lime top strip and "ARSLAN STUDIO", and a small monitor.
- **Customer:** violet jacket, walks in from the left.
- **Floor reflections:** the customer and guard are mirrored on the floor (`<use>` flipped vertically) at 22% opacity with a fade-out mask.
- **People:** built from simple shapes (legs, arms, torso, head) as reusable SVG `Person` components. Arms and legs rotate from the hip and shoulder (`transform-box: fill-box`, origin top centre).
  - **Walk cycle (CSS):** legs swing ±24°, arms ±18° opposite, and the body bobs 4px.
  - **Greeting (CSS):** the right arm raises and waves.
  - **Idle (CSS):** the head nods gently.

### Story

One GSAP timeline that plays when the scene is 35% in view. A "Replay the visit" button restarts it.

1. The customer walks in from x −60 to the gate (2.3s, linear) with the walk cycle on.
2. The customer stops. The guard waves: *"Welcome! Let me open the gate."*
3. The doorway glows and the doors slide apart (0.9s, `power2.inOut`).
4. The guard says *"Reception is straight ahead."* The customer walks through to the desk (3.3s), and the doors close behind them.
5. The receptionist waves: *"Hi! Which service can I help you with?"* The customer replies: *"Let me take a look."*
6. A lime beam drops from the desk, and the **glass service menu** springs in below the scene (cards staggered 0.08s, `back.out`).

Speech bubbles are glass HTML elements positioned over the SVG using percentages. They pop in with a scale spring and have a small tail.

### Service menu and detail panel

- **Cards:** six glass cards, each with a lime icon tile, a title, a one-line summary and an arrow that nudges on hover. On hover the card lifts and gets a lime border and glow. The content lives in `data/lobbyServices.ts`.
  - **Shopify set:** New Shopify store, Custom theme, Speed and conversion, Rank in ChatGPT and Claude, Shopify Plus, Store migration.
  - **Software set:** Next.js SaaS product, Full stack web app, AI app or agent, APIs and integrations, WordPress website, Website migration.
- **Clicking a card:**
  - The receptionist says *"Great choice! Here are the details."* and waves, and the customer hops.
  - The card **expands into a large glass dialog** (Motion `layoutId` shared between the card and the dialog, or a manual FLIP).
  - **Dialog contents:** a big lime icon, title, description, an "included" list with lime checks, and two buttons: **"Start this project"** (goes to contact) and **"Back to reception"**.
  - The dialog's contents stagger in, and the backdrop blurs.
- **Closing:** the close button, Esc, or a backdrop click shrinks the dialog back into its card. Lenis is locked while it's open. Focus moves into the dialog and returns to the card when it closes.

---

## 8. Shopify home (`/`): sections in order

Copy for every section is in the prototype.

1. **Hero**
   - Kicker: "Arslan Mahtab, software engineer and senior Shopify developer".
   - h1: "Shopify stores built for **[rotating word]**". It's split into letters that rise in with a stagger (GSAP, `expo.out`). The last line cycles every 2.6s through "the AI era." → "SaaS brands." → "mobile shoppers." → "fast checkout." → "more sales." in Instrument Serif italic violet; letters flip out up and in from below.
   - A lime highlight: "**Rank your website in ChatGPT, Claude & AI tools**".
   - Subtitle, two AnimatedButtons, and the software cross-link.
   - **Background:**
     - A perspective grid floor scrolling toward the viewer (CSS) and two pulsing glows.
     - The hero robot (6.1).
     - Five floating glass notification chips: "Added to cart", "New order", "AI search", "5-star review", "Checkout complete". They pop in with a stagger, float (CSS), and move with the mouse at different depths (parallax, GSAP `quickTo`). Show three on mobile.
   - A scroll hint with a dripping line.
2. **Reception lobby** (section 7, Shopify set).
3. **Skills marquee:** two rows of large text moving in opposite directions (one filled, one outlined), with lime dots between items. Rows skew in proportion to scroll speed (ScrollTrigger velocity).
4. **AI ranking:** a giant heading, "Rank your website in **[ChatGPT, Claude]** & AI tools." The lime box wipes in and the lines spring up.
   - AI tool chips (ChatGPT, Claude, Gemini, Perplexity, Google AI Overviews) spring in and float.
   - Three numbered steps.
   - **Animated AI chat:** a shopper's question types out, then thinking dots, then four results appear. After about 2s, **yourstore.com springs from #4 to #1** (Motion `layout` reorder), gets a lime glow, and a "Recommended by AI" badge pops. Include a Replay button and the note "Illustration of how an optimized store can appear in AI answers."
5. **"From code to checkout"** (GSAP ScrollTrigger, pinned for about 2600px, scrubbed). Steps on the left highlight in turn while the right-hand browser mockup goes through:
   - Liquid code lines appearing
   - the code fading
   - wireframe blocks popping in
   - the blocks filling with a real store (banner, three products)
   - Add to cart presses and the bag count rising
   - an order toast
6. **Featured work** (GSAP ScrollTrigger horizontal scroll, pinned on desktop; stacked with reveals on mobile). Glass panels for Wisecoms and Xinix World, plus a violet "Your store could be next" panel. Browser mockups scroll their page on hover.
7. **All stores:**
   - "**[count]+ stores** *designed and built.*" with a count-up (Motion `animate`).
   - Two rows of store names moving in opposite directions, pausing on hover.
   - **A 3D coverflow slider** of all stores from `data/projects.ts`:
     - The centre card is bright with a lime glow. The others angle back (rotateY ±30° per step, translateZ −150px per step, scale −7%), dimmed, and are hidden beyond ±3.
     - Autoplay every 2.8s, pausing on hover and focus. Drag or swipe, prev/next buttons, and arrow keys all work.
     - Clicking a side card brings it to the front; clicking the front card opens the live site.
     - A lime progress bar and a "07 / 32" counter.
   - Each card: a browser mockup (gradient hero with the store name, real domain in the URL bar, an optional `image` field for screenshots), the name, the domain, and a lime arrow.
8. **Shopify Plus bento:** glass tiles, each with a mini CSS animation.
   - Checkout Extensibility: an upsell row slides in.
   - Shopify Functions: a code chip with a blinking caret.
   - B2B and wholesale.
   - Markets: a currency ticker flips.
   - Flow: nodes with flowing dashed lines.
   - Launchpad: chips light up in sequence.
9. **AI shopping assistant:** a phone mockup chat. The question types out, thinking dots show, and three product picks spring in.
10. **AI voice assistant:**
    - **Orb:** a conic-gradient orb (rotating via CSS `@property` angle) with three pulse rings and a 30-bar waveform. The orb scales with the audio level.
    - **States:** idle, listening (fast mint rings), and speaking.
    - **Input and output:** voice input uses the Web Speech API (`SpeechRecognition`), with preset question chips as a fallback. Answers are spoken with `speechSynthesis` and typed into a transcript.
    - **Answers:** come from `POST /api/assistant`, which calls an LLM API if `AI_API_KEY` is set and otherwise falls back to the keyword answers in `data/voiceAnswers.ts`.
    - Clear messages appear when the microphone isn't available.
11. **Web, SaaS and WordPress** ("More than Shopify"):
    - Three glass cards (SaaS websites, web apps, WordPress).
    - **Migration demo:** a "From" box flips through WordPress, WooCommerce, Wix, Squarespace and Magento. Data packets flow down a pipe to a glowing lime Shopify box. A progress bar fills to 100% while Products, Customers, Orders, Pages and blog, and SEO redirects tick off with spring checks. Then it loops.
12. **Services:**
    - Filter tabs: All, Build, Grow, Web and SaaS, AI and tech. Cards reshuffle with Motion `layout` and `AnimatePresence`.
    - Glass cards with 3D tilt toward the cursor and a radial spotlight that follows it.
13. **Pricing:** three glass cards (Starter, Growth, Shopify Plus). The middle card is raised with a spinning conic-gradient border (CSS `@property` angle) and a "Most popular" tag. Prices are placeholders.
14. **FAQ:** glass accordion items that open smoothly (`grid-template-rows` 0fr → 1fr) while the + icon rotates into an ×.
15. **Developer desk scene** (6.5) beside "Behind every store, a real *developer*."

## 9. Software home (`/software`): sections in order

1. **Hero:**
   - Kicker: "Arslan Mahtab, full stack software engineer".
   - h1: "Full stack & AI apps for **[rotating word]**", cycling through "SaaS products.", "AI startups.", "dashboards." and "web apps." with Motion spring swaps.
   - A lime highlight: "**React · Laravel · Next.js · AI full stack**".
   - Subtitle, buttons, and the Shopify cross-link.
   - **Code editor:** a glass editor with tabs (`app/page.tsx`, `routes/api.php`, `ai/agent.ts`) that types each snippet with syntax colours (keywords violet, strings lime, functions pink) and a blinking caret. A toast then pops: "Build passed. Deployed." / "API tests passed. 200 OK." / "Agent ready. Streaming answers." Then the next tab.
   - Floating glass tech badges around the editor: React, Next.js, Laravel, Node.js, TypeScript, and a lime "AI agents".
2. **Reception lobby** (section 7, software set).
3. **"Clean code. Calm delivery."** Three value points with lime check tiles next to the developer android (6.3).
4. **"One engineer, the whole stack":**
   - Four glass stack groups: Front end, Back end, Data, AI.
   - **Orbit:** a lime core labelled "Arslan / full stack" with two dashed rings rotating in opposite directions (32s and 48s). Tech pills sit on the rings and counter-rotate so they stay upright.
5. **"What I build":** four glass cards, each with a live mini animation.
   - **Full stack web apps:** data packets flow React → Laravel API → MySQL.
   - **AI full stack apps:** an AI answer streams in word by word.
   - **Next.js SaaS products:** an MRR line chart draws itself (SVG `stroke-dashoffset`).
   - **APIs and integrations:** endpoints light up with 200/201 status.
6. **"AI apps, end to end":**
   - A pipeline of glass nodes (Your data → Embeddings → Vector DB → LLM → Answer) that light up in sequence with connecting lines filling. It goes vertical on mobile.
   - An `agent.log` terminal prints an agent's steps line by line.
7. **"Next.js SaaS, idea to launch":**
   - A five-step timeline (Plan, Design, Build, Launch, Scale) whose line draws on scroll.
   - A glass dashboard mockup: a sidebar, three KPI tiles counting up (Motion `animate`), and seven bars growing with a stagger. Label it "Example dashboard design".
8. **Software projects:** three glass placeholder cards with gradient previews, names, descriptions and tech tags. Keep the `[placeholders]` visible.

## 10. Contact and footer (both pages)

- **Closing line:** a big scrubbed line, "Let's build your *store*." on `/` and "Let's build your *product*." on `/software`. Letters rise in as you scroll (GSAP scrub).
- **Buttons:** Email, WhatsApp and LinkedIn AnimatedButtons. Email and WhatsApp come from `config/site.ts`; LinkedIn is https://pk.linkedin.com/in/arslan-mahtab.
- **Footer robot** (6.2).
- **"Available for new projects" glass badge:** a pulsing green dot and **my live local time in Pakistan** (`Intl.DateTimeFormat` with `timeZone: "Asia/Karachi"`, updating every 30s).
- **Spinning "Back to top" badge:** circular "BACK TO TOP ·" text on an SVG `textPath`, spinning (14s, 4s on hover) around a lime arrow button that bounces on hover. It scrolls to the top through Lenis.
- **Giant signature:** "Arslan Mahtab" in outlined Syne letters that **fill with lime from left to right as you scroll** (a background-clip text gradient whose width is tied to scroll with GSAP ScrollTrigger scrub).
- Footer line with my name and role.

## 11. Data files

- `data/projects.ts`: all store links from the prototype, with `name`, `url` and optional `image`, `role` and `result`. The two `.myshopify.com` entries are flagged for me to check.
- `data/services.ts`: services with a category (`build | grow | web | ai`), icon, title, description and tags.
- `data/lobbyServices.ts`: the two lobby sets, with title, summary, description and an included list.
- `data/faq.ts`, `data/pricing.ts`, `data/voiceAnswers.ts`, `data/stack.ts`.
- `config/site.ts`: email, WhatsApp number, LinkedIn and timezone.

## 12. SEO and AI-search readiness

This matters because I sell this service, so my own site must prove it.

- Per-page `metadata`: title, description, canonical and Open Graph. Generate the OG image with `opengraph-image.tsx` in the site's style.
- JSON-LD on both pages: `Person` (name, jobTitle, sameAs LinkedIn, knowsAbout) and `ProfessionalService` (services offered, areaServed worldwide).
- `app/sitemap.ts`, `app/robots.ts`, and `public/llms.txt` describing who I am, both portfolios, my services and how to contact me.
- Semantic HTML: one `h1` per page, logical heading order, real links and buttons, and meaningful link text.
- All content must be rendered on the server so crawlers and AI tools can read it. Animations enhance content; they must never hide it from crawlers.

## 13. Performance

- Mobile Lighthouse targets: **Performance 90+, Accessibility 95+, Best Practices 95+, SEO 100**.
- Lazy-load every 3D canvas and heavy section below the fold. Reserve their space to avoid layout shift.
- Pause off-screen animation loops (3D, typing loops, terminal loops, voice waveform) with IntersectionObserver and the page visibility state.
- Animate only `transform` and `opacity` wherever possible.
- Load fonts with `next/font` (`display: swap`) and don't load unused weights.
- Register GSAP plugins once in `lib/gsap.ts`. Kill and revert all GSAP contexts on unmount (`useGSAP` handles this). Call `ScrollTrigger.refresh()` after fonts load and when content height changes.

## 14. Accessibility and reduced motion

- Every interactive element is keyboard reachable with a visible lime focus ring. This includes the slider (arrow keys), the lobby cards, the dialog (focus trap and Esc), the voice orb, the android (Enter), and the toggle.
- Use `aria-live="polite"` for changing text: speech bubbles, the voice transcript, the slider position and the ranking demo.
- Give `role="img"` and an `aria-label` to visual demos and characters, and mark decorative layers `aria-hidden`.
- **`prefers-reduced-motion`: soften motion, don't remove it.**
  - Disable Lenis smooth scroll, parallax, mouse tilt and the marquee skew.
  - Shorten durations and keep entrances as simple fades.
  - Characters keep their gentle idle loops.
  - The loader is skipped.
- Colour contrast meets WCAG AA in both themes (lime text in light mode uses `--lime-text`).

## 15. Placeholders I will fill in

Mark each one clearly in the UI and list them all in the README:

- Email, WhatsApp number, prices
- Case-study details and real results for Wisecoms and Xinix World
- Software project names, links and descriptions
- Store screenshots (`image` in `data/projects.ts`)
- Final voice assistant and FAQ wording
- Whether the "Available for new projects" badge should show

## 16. Build phases

Commit after each phase.

1. **Setup:** Next.js, TypeScript, Tailwind, fonts, design tokens, ambient background, grain, `lib/gsap.ts`, Lenis provider, scroll progress line.
2. **Layout:** navbar, mode toggle, page-switch transition, custom cursor with labels, contact footer (without the robot), back-to-top badge, availability badge with Pakistan time, signature fill.
3. **UI kit:** AnimatedButton (every effect in section 5), GlassCard, Highlight, Pill, SplitText, SectionReveal, Marquee.
4. **Shopify home, part 1:** loader, hero (without the 3D robot), AI ranking, code-to-checkout pinned section, featured work horizontal scroll, all-stores coverflow slider.
5. **Shopify home, part 2:** Shopify Plus, AI chat, voice assistant with its API route, Web/SaaS migration demo, services filter, pricing, FAQ.
6. **Reception lobby:** SVG scene, people, GSAP story timeline, service menu, expanding glass dialog, on both pages.
7. **Software home:** every section in section 9 (without the 3D android).
8. **3D characters:** hero robot, footer robot, developer android, built with R3F and Drei.
9. **2D characters:** Bago (including the section-aware bubbles) and the developer desk scene.
10. **SEO:** metadata, JSON-LD, sitemap, robots, `llms.txt`, OG image.
11. **Polish pass:** test performance, accessibility, reduced motion, light theme, and touch on phones. Run Lighthouse and fix everything below the targets.
12. **README:** how to run, how to edit content in `data/`, the placeholder list, and how to deploy to Vercel with a custom domain.

**Acceptance check for every phase:** no console errors, no layout shift, works at 390px and 1440px, keyboard usable, and it matches the prototype's look and motion.
