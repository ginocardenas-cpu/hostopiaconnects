# Hostopia Website Design System Reference

> **Purpose:** This document defines the canonical design system extracted from the Hostopia homepage. ALL other pages on the site must conform to these specifications to ensure visual consistency. Use this as the single source of truth when building or editing any page.

---

## 1. CSS Custom Properties (Root Variables)

```css
:root {
  --charcoal: #24282b;    /* rgb(36, 40, 43) */
  --teal: #2cadb2;        /* rgb(44, 173, 178) */
  --teal-dark: #1d8f93;   /* hover state for teal */
  --gold: #f8cf41;        /* rgb(248, 207, 65) */
  --gold-dark: #e0b82a;   /* hover state for gold */
  --cream: #f7f6f2;       /* rgb(247, 246, 242) */
}
```

These variables MUST be used everywhere. Never hard-code hex values outside of this palette.

---

## 2. Color Palette & Usage Rules

### Primary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Charcoal | `#24282b` | `rgb(36, 40, 43)` | Primary text, dark section backgrounds, footer background |
| Teal | `#2cadb2` | `rgb(44, 173, 178)` | Accent color for highlighted words in headings, stat numbers, eyebrow labels, links, CTA hover states |
| Teal Dark | `#1d8f93` | — | Hover state for teal buttons/links |
| Gold | `#f8cf41` | `rgb(248, 207, 65)` | CTA banner section background, accent decorative elements |
| Gold Dark | `#e0b82a` | — | Hover state for gold elements |
| Cream | `#f7f6f2` | `rgb(247, 246, 242)` | Alternating section background (light sections) |

### Neutral Colors

| Color | Hex / Value | Usage |
|-------|-------------|-------|
| White | `#ffffff` | Alternating section background, card backgrounds, stat box backgrounds |
| Gray 50 | `rgb(249, 250, 251)` | FAQ/light section background variant |
| Gray 200 | `rgb(229, 231, 235)` | Stat grid gap/divider color (`bg-gray-200`) |
| Gray text | `rgb(136, 136, 136)` | Stat box labels |
| Sub-copy gray | `rgb(107, 114, 128)` | Body/paragraph text (`text-gray-500`) |
| Dark sub-copy | `rgb(74, 78, 82)` | Paragraph text on gold backgrounds |

### Section Background Alternation Pattern

The homepage alternates section backgrounds in this repeating rhythm. Follow this for all pages:

1. **Cream** (`bg-cream` / `#f7f6f2`) — Hero section
2. **White** (`bg-white`) — "Why Partners Choose Hostopia"
3. **Cream** (default, no bg class needed) — "Built For" rotating section
4. **White** (`bg-white`) — Product/services grid
5. **Charcoal** (`#24282b`) — Migration / dark accent section
6. **White** (`bg-white`) — Support section
7. **Cream** — Testimonials / social proof
8. **White** (`bg-white`) — Integration partners
9. **Gold** (`#f8cf41`) — Final CTA banner
10. **Gray 50** (`bg-gray-50`) — FAQ

**Rule:** Never place two consecutive sections with the same background color.

---

## 3. Typography System

### Font Families

| Font | Usage | Import |
|------|-------|--------|
| **Montserrat** | Headings (H1, H2, H3), stat numbers, feature card numbers | Google Fonts |
| **Raleway** | Navigation, body text, buttons, paragraphs, all non-heading text | Google Fonts |

**Rule:** Headings always use Montserrat. Body and UI text always use Raleway. Never mix these assignments.

### Heading Styles

| Element | Font Size | Font Weight | Line Height | Letter Spacing | Font Family | Color |
|---------|-----------|-------------|-------------|----------------|-------------|-------|
| **H1** (Hero) | `72px` (`text-7xl`) | `900` (font-black) | `1.02` (`leading-[1.02]`) | `-1.8px` (`tracking-tight`) | Montserrat | Charcoal `#24282b` |
| **H2** (Section) | `72px` (`text-7xl`) | `900` (font-black) | `1.25` (`leading-tight`) | `normal` | Montserrat | Charcoal `#24282b` |
| **H2** (Gold banner) | `88px` | `900` (font-black) | tight | normal | Montserrat | Charcoal `#24282b` |
| **H3** (Card title — product features & lifecycle steps) | `20px` (`text-xl`) | `900` (font-black) | default | normal | Montserrat | Charcoal `#24282b` |
| **H3** (Service card) | `20px` (`text-xl`) | `900` (font-black) | default | normal | Montserrat | Charcoal `#24282b` |

### Heading Color Accent Pattern

Headings frequently contain **one or two words highlighted in teal** to draw attention. This is achieved by wrapping key words in a `<span>` with the teal color class:

```html
<!-- Pattern: Key concept words in teal within charcoal headings -->
<h1 class="font-black leading-[1.02] tracking-tight">
  Behind the<br/>
  <span class="text-teal">Brands</span> That<br/>
  <span class="text-teal">Power</span> Small<br/>
  Business<sup>TM</sup>
</h1>
```

**Rule:** Every H1 and H2 should have 1-2 strategically chosen words in `text-teal` (`#2cadb2`). The highlighted words should represent the key value concept of that section.

### Body Text Styles

| Context | Font Size | Font Weight | Line Height | Color | Max Width | Classes |
|---------|-----------|-------------|-------------|-------|-----------|---------|
| Hero sub-copy | `20px` (`text-xl`) | `400` | `28px` | `rgb(107, 114, 128)` (`text-gray-500`) | `36rem` (`max-w-xl`) | `text-xl text-gray-500 max-w-xl` |
| Section description | `18px` (`text-lg`) | `400` | `28px` | `rgb(107, 114, 128)` (`text-gray-500`) | — | `text-lg text-gray-500` |
| Feature card body | `14px` (`text-sm`) | `400` | relaxed | `rgb(107, 114, 128)` (`text-gray-500`) | — | `text-sm text-gray-500 leading-relaxed` (matches `ProductPageFromJson` feature cards) |
| Stat box label | `12px` (`text-xs`) | `600` (font-semibold) | normal | `rgb(136, 136, 136)` | — | `text-xs font-semibold uppercase tracking-wider` |
| Gold section body | `18px` (`text-lg`) | `400` | `28px` | `rgb(74, 78, 82)` | — | — |

### Eyebrow / Section Label

The homepage uses a consistent `.section-label` pattern above every section heading:

| Property | Value |
|----------|-------|
| Font Size | `11.2px` (~`text-xs` scaled, or use `0.7rem`) |
| Font Weight | `700` (bold) |
| Letter Spacing | `2.24px` (~`tracking-[0.14em]`) |
| Text Transform | `uppercase` |
| Color | Teal `#2cadb2` |
| Font Family | Raleway |
| Margin Bottom | `16px` (`mb-4`) below the label, before the heading |

```html
<!-- Standard section label pattern -->
<span class="section-label">Why Partners Choose Hostopia</span>
```

```css
.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--teal);
}
```

**Rule:** Every section MUST have an eyebrow label above its H2 heading. The label uses teal color and uppercase tracking.

---

## 4. Layout & Spacing

### Container

| Property | Value | Class |
|----------|-------|-------|
| Max width | `80rem` (1280px) | `max-w-7xl` |
| Horizontal padding | `24px` | `px-6` |
| Centering | auto margins | `mx-auto` |

Standard container pattern: `max-w-7xl mx-auto px-6`

### Section Padding

| Property | Value | Class |
|----------|-------|-------|
| Vertical padding (standard) | `112px` top and bottom | `py-28` |
| Hero section | `80px` top only (accounts for fixed nav) | `pt-20` + `min-h-screen` |

**Rule:** All content sections use `py-28` (112px vertical padding). This is non-negotiable for consistency.

### Content Max Widths

| Context | Max Width | Class |
|---------|-----------|-------|
| Main container | `80rem` / 1280px | `max-w-7xl` |
| Hero sub-copy | `36rem` / 576px | `max-w-xl` |
| Section descriptions | `48rem` / 768px | `max-w-4xl` (centered) |
| Narrow content blocks | `32rem` / 512px | `max-w-lg` |

---

## 5. Component Patterns

### 5a. Stat / Proof Point Boxes

The stats bar shows key metrics in a 4-column grid with 1px dividers.

**Container:**
```html
<div class="mt-24 grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
  <!-- 4 stat items -->
</div>
```

| Property | Value |
|----------|-------|
| Grid | `grid-cols-2 md:grid-cols-4` |
| Gap | `1px` (`gap-px`) — creates thin divider lines |
| Container background | `bg-gray-200` (the divider color) |
| Border radius | `16px` (`rounded-2xl`) |
| Overflow | `hidden` (clips children to rounded corners) |
| Shadow | `shadow-sm` |

**Individual Stat Item:**
```html
<div class="flex flex-col items-center justify-center p-8 bg-white hover:bg-gray-50 transition-colors duration-200">
  <div class="text-4xl font-black text-teal font-montserrat">500+</div>
  <span class="text-xs font-semibold uppercase tracking-wider text-center" style="color: #888">
    Service Provider Partners
  </span>
</div>
```

| Property | Value |
|----------|-------|
| Padding | `32px` (`p-8`) |
| Background | White, hover: `bg-gray-50` |
| Number font size | `36px` (`text-4xl`) |
| Number font weight | `900` (font-black) |
| Number color | Teal `#2cadb2` |
| Number font | Montserrat |
| Label font size | `12px` (`text-xs`) |
| Label font weight | `600` (font-semibold) |
| Label transform | `uppercase` |
| Label tracking | `tracking-wider` (0.6px) |
| Label color | `#888888` |
| Transition | `transition-colors duration-200` |

### 5b. Numbered Feature Cards ("Why Hostopia" Section)

Four-column grid with large decorative numbers, a teal accent bar, and text content.

**Container:**
```html
<div class="grid md:grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
  <!-- 4 feature cards -->
</div>
```

**Individual Card:**
```html
<div class="group bg-white p-10 hover:bg-gray-50 transition-colors duration-300 relative overflow-hidden">
  <!-- Large decorative number -->
  <span class="text-8xl font-black text-gray-100 mb-6 block" style="font-family: Montserrat">01</span>
  <!-- Teal accent bar -->
  <div class="w-12 h-1 bg-teal mb-6"></div>
  <!-- Title -->
  <h3 class="font-black mb-4 text-2xl">New Revenue Streams</h3>
  <!-- Description -->
  <p class="text-gray-500 leading-relaxed">Description text...</p>
</div>
```

| Element | Property | Value |
|---------|----------|-------|
| Card padding | padding | `40px` (`p-10`) |
| Card background | bg | White, hover: `bg-gray-50` |
| Card transition | transition | `transition-colors duration-300` |
| Decorative number | font-size | `96px` (`text-8xl`) |
| Decorative number | font-weight | `900` (font-black) |
| Decorative number | color | `rgb(243, 244, 246)` (`text-gray-100`) — very faint |
| Decorative number | margin-bottom | `24px` (`mb-6`) |
| Decorative number | font | Montserrat |
| Teal accent bar | width | `48px` (`w-12`) |
| Teal accent bar | height | `4px` (`h-1`) |
| Teal accent bar | color | Teal `#2cadb2` (`bg-teal`) |
| Teal accent bar | margin-bottom | `24px` (`mb-6`) |
| Card title (H3) | font-size | `24px` (`text-2xl`) |
| Card title (H3) | font-weight | `900` (font-black) |
| Card title (H3) | margin-bottom | `16px` (`mb-4`) |
| Card body (P) | color | `text-gray-500` |
| Card body (P) | line-height | `leading-relaxed` (1.625) |

### 5c. Service/Product Cards ("Everything Your Customers Need")

Full-width horizontal cards using a 12-column grid layout.

```html
<div class="group grid md:grid-cols-12 bg-white hover:bg-gray-50 transition-colors duration-300 cursor-pointer">
  <!-- Content spans columns, image spans remaining -->
  <div class="md:col-span-5 p-8">
    <h3 class="font-black text-xl mb-3">Business Email</h3>
    <p class="text-gray-500 text-sm leading-relaxed">Description...</p>
  </div>
  <div class="md:col-span-7">
    <!-- Image/visual area -->
  </div>
</div>
```

| Property | Value |
|----------|-------|
| Layout | `grid md:grid-cols-12` |
| Background | White, hover: `bg-gray-50` |
| Transition | `transition-colors duration-300` |
| Title font size | `20px` (`text-xl`) |
| Title font weight | `900` (font-black) |
| Body font size | `14px` (`text-sm`) |
| Body line-height | `leading-relaxed` |

### 5d. Dark Section (Charcoal Background)

Used for high-impact sections like Migrations.

```html
<section class="py-28 relative overflow-hidden" style="background-color: #24282b">
  <div class="max-w-7xl mx-auto px-6">
    <span class="section-label" style="color: #2cadb2">Migration Capabilities</span>
    <h2 class="font-black text-7xl leading-tight text-white">
      Large-Scale<br/><span class="text-teal">Migrations.</span> Zero Disruption.
    </h2>
    <p class="text-lg" style="color: rgba(255,255,255,0.7)">Description text...</p>
  </div>
</section>
```

| Element | Property | Value |
|---------|----------|-------|
| Section background | bg | Charcoal `#24282b` |
| Heading color | color | White `#ffffff` |
| Teal accent words | color | Teal `#2cadb2` |
| Body text | color | `rgba(255, 255, 255, 0.7)` — 70% white |
| Eyebrow label | color | Teal `#2cadb2` (same as light sections) |

### 5e. Gold CTA Banner Section

The high-visibility call-to-action section near the bottom.

```html
<section class="py-28 relative overflow-hidden" style="background-color: #f8cf41">
  <div class="max-w-7xl mx-auto px-6">
    <h2 class="font-black text-[88px] leading-tight text-charcoal">
      Launch Your<br/>
      <span class="text-white">White-Label</span><br/>
      Digital Services<br/>
      Portfolio.
    </h2>
    <p class="text-lg" style="color: #4a4e52">Sub-copy text...</p>
    <a href="mailto:partners@hostopia.com" class="text-teal">partners@hostopia.com</a>
  </div>
</section>
```

| Element | Value |
|---------|-------|
| Background | Gold `#f8cf41` |
| H2 font size | `88px` (larger than standard H2) |
| H2 color | Charcoal `#24282b` |
| Accent words | White `#ffffff` (inverted from the usual teal) |
| Body text | `#4a4e52` |
| CTA link | Teal `#2cadb2` |

### 5f. Navigation Bar

```html
<header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95">
  <!-- Backdrop blur implied -->
</header>
```

| Property | Value |
|----------|-------|
| Position | Fixed, top: 0 |
| Z-index | 50 |
| Background | `rgba(255, 255, 255, 0.95)` — 95% white |
| Transition | `transition-all duration-300` |
| Nav link font | Raleway, 14px, weight 500 |
| Nav link color | Charcoal `#24282b`, hover: Teal |

### 5g. Footer

| Property | Value |
|----------|-------|
| Background | Charcoal `#24282b` |
| Text color | White / light gray variants |

---

## 6. Buttons & CTAs

### Primary Button (Teal)

```html
<a class="bg-teal hover:bg-teal-dark text-white px-8 py-4 rounded-full font-semibold
         text-sm tracking-wide uppercase transition-colors duration-200">
  Get Started
</a>
```

| Property | Value |
|----------|-------|
| Background | Teal `#2cadb2` |
| Hover background | Teal Dark `#1d8f93` |
| Text color | White |
| Padding | `16px 32px` (`py-4 px-8`) |
| Border radius | `9999px` (`rounded-full`) — pill shape |
| Font weight | `600` (font-semibold) |
| Font size | `14px` (`text-sm`) |
| Letter spacing | `0.6px` (`tracking-wide`) |
| Text transform | `uppercase` |
| Transition | `transition-colors duration-200` |

### Secondary Button (Charcoal)

```html
<a class="bg-charcoal hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold
         text-sm tracking-wide uppercase transition-colors duration-200">
  Learn More
</a>
```

| Property | Value |
|----------|-------|
| Background | Charcoal `#24282b` |
| Text color | White |
| All other properties | Same as primary |

### Ghost / Outline Button

```html
<a class="border-2 border-white text-white hover:bg-white hover:text-charcoal px-8 py-4
         rounded-full font-semibold text-sm tracking-wide uppercase transition-colors duration-200">
  Contact Us
</a>
```

**Rule:** All buttons use `rounded-full` (pill shape). Never use squared or slightly-rounded buttons.

---

## 7. Animations & Transitions

### Standard Transitions

| Context | Duration | Easing | Classes |
|---------|----------|--------|---------|
| Navigation | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `transition-all duration-300` |
| Button hover | 200ms | default ease | `transition-colors duration-200` |
| Card hover | 300ms | default ease | `transition-colors duration-300` |
| Stat box hover | 200ms | default ease | `transition-colors duration-200` |

### Scroll / Reveal Animations

The homepage uses scroll-triggered fade-in animations (likely Framer Motion or Intersection Observer). Elements enter with:

| Property | From | To |
|----------|------|----|
| Opacity | `0` | `1` |
| Transform | `translateY(20px)` | `translateY(0)` |
| Duration | — | `600ms` |
| Easing | — | `ease-out` |

**Rule:** All sections should animate in on scroll using this fade-up pattern. Stagger child elements by 100-150ms for visual flow.

### Hover Effects

| Component | Hover Effect |
|-----------|-------------|
| Feature cards | Background: white -> `gray-50` |
| Stat boxes | Background: white -> `gray-50` |
| Service cards | Background: white -> `gray-50` |
| Buttons | Background color shift (teal -> teal-dark) |
| Nav links | Text color: charcoal -> teal |

---

## 8. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Stat boxes container |

The homepage uses shadows very sparingly. Most elevation is communicated through background color differences and the `gap-px` divider technique rather than box shadows.

---

## 9. Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-2xl` | `16px` | Stat box container, card containers |
| `rounded-full` | `9999px` | All buttons (pill shape) |
| `rounded` | `4px` | Nav items |

---

## 10. "Built For" Rotating Section Pattern

This section showcases different partner types (ISPs, Telcos, Cablecos, etc.) with a rotating headline.

```html
<section class="py-28" style="background-color: #f7f6f2">
  <div class="max-w-7xl mx-auto px-6">
    <span class="section-label">Built for Service Providers Who Sell to Small Business</span>
    <h2 class="font-black text-7xl leading-tight">
      Built for <span class="text-teal">ISPs</span>
    </h2>
    <p class="text-xl text-gray-500 max-w-xl">
      If you have an established base of SMB customers and want to deliver more value — Hostopia was built for you.
    </p>
  </div>
</section>
```

The teal-colored word rotates between: ISPs, Telcos, Cablecos, Distributors, Resellers, MSPs.

---

## 11. Consistency Checklist for New Pages

When building or auditing any page, verify the following:

1. **Fonts:** Headings use Montserrat (weight 900). Body uses Raleway (weight 400-500).
2. **Colors:** Only use the 6 defined palette colors + neutral grays. No rogue hex values.
3. **Section padding:** All sections use `py-28` (112px).
4. **Container:** All content wrapped in `max-w-7xl mx-auto px-6`.
5. **Background alternation:** Sections alternate cream/white. Never two same-color sections in a row.
6. **Eyebrow labels:** Every section has a teal uppercase label above its heading.
7. **Heading accents:** H1 and H2 headings include 1-2 words in teal.
8. **Buttons:** Always pill-shaped (`rounded-full`), uppercase, `text-sm`, `tracking-wide`.
9. **Hover states:** Cards use `hover:bg-gray-50`. Buttons shift color. Links go teal.
10. **Animations:** Sections fade-up on scroll. Transitions use 200-300ms durations.
11. **Stat boxes:** Use the `gap-px bg-gray-200 rounded-2xl` divider grid pattern.
12. **Feature cards:** Include decorative large faint numbers + teal accent bar.
13. **Dark sections:** White text, teal accents, 70% opacity body text.
14. **Shadows:** Minimal — only `shadow-sm` on containers, not individual cards.

---

## 11b. Vimeo video blocks (homepage + products)

- **Homepage:** `content/home-vimeo.json` (loaded by `loadHomeVimeo()`). Set `"enabled": false` to hide the block without deleting config.
- **Product pages:** optional `media.vimeoOverview` in `content/products/*.json` — same fields as below. Renders **immediately after the hero** when `vimeoId` is valid.
- **Fields:** `vimeoId` (numeric id or full `vimeo.com/...` URL), optional `eyebrow`, `title`, `description`, optional `posterSrc` / `posterAlt` (Unsplash or `public/`; falls back to teal/gold gradient if no poster), optional `playLabel`.
- **UX:** 16:9 **poster** with gradient overlay + **teal play** control; opens **Radix Dialog** with `player.vimeo.com` iframe (**autoplay on open**, `dnt=1`). Iframe mounts only while the dialog is open.
- **Implementation:** `components/VimeoVideoSection.tsx`, `components/ui/dialog.tsx`, `lib/vimeo-id.ts`, `lib/vimeo-video-types.ts`.

---

## 12. Product detail pages (JSON / `ProductPageFromJson`)

Product pages share typography with the **“What you deliver”** features block for secondary content patterns.

### Features section (canonical reference)

| Element | Classes (Tailwind) |
|---------|-------------------|
| Section eyebrow | `.section-label` above heading |
| Section H2 | `font-montserrat text-4xl font-black leading-tight text-charcoal md:text-5xl lg:text-6xl` — use `splitHeadline()` for charcoal + teal line break where applicable |
| Intro paragraph | `font-raleway text-lg leading-relaxed text-gray-500 max-w-3xl` |
| Feature card title | `font-montserrat text-xl font-black text-charcoal` |
| Feature card body | `font-raleway text-sm leading-relaxed text-gray-500` |
| Card chrome | Teal Lucide icon, `h-1 w-12 bg-teal` accent bar under icon |

### Vertical tabs (hero sidebar — selected slugs)

Used for: `logo-design`, `ssl`, `website-builder`, `directories`, `ecommerce`, `digital-fax`.

| Element | Must match |
|---------|------------|
| Block section title (e.g. “Your SMB customers get”) | Same scale as features **section H2**: `text-4xl md:text-5xl lg:text-6xl font-black` |
| Row title (e.g. “Launch a store fast”) | Same as feature **card title**: `text-xl font-black` |
| Row description | Same as feature **card body**: `text-sm text-gray-500 leading-relaxed` |

Implementation: `components/ui/vertical-tabs.tsx`.

### Hero accordion (hero sidebar — all other products with `hero.sidebar`)

| Element | Must match |
|---------|------------|
| Block section title | Same as features **section H2** |
| Accordion row title | Same as feature **card title**: `text-xl font-black` |
| Accordion row body | Same as feature **card body**: `text-sm text-gray-500 leading-relaxed` |

Implementation: `components/ui/product-hero-accordion.tsx` (Radix accordion in `components/ui/accordion.tsx`).

### Hosting — feature carousel (exception)

**Only** `/products/hosting` uses the **feature carousel** instead of the hero accordion for `hero.sidebar`: teal left column with stacked pill “chips” (labels = item titles, Lucide icons), right column with stacked image cards and gradient caption (description = item body). Data comes from the same JSON shape as other sidebars (`title`, `body`, optional `image`). Section title = `hero.sidebar.heading` (e.g. “Your customers get”). Auto-advance with pause on hover. Implementation: `components/ui/feature-carousel.tsx`.

### Business Email — interactive image accordion (exception)

**Only** `/products/business-email` uses the **interactive image accordion** instead of the hero accordion: section heading (`hero.sidebar.heading`, e.g. “Your SMB customers get”) stays at the top; **left column** shows the active item’s **title** + **body** (updates on hover/click); **right column** is a horizontal strip of image panels that expand/collapse (inactive columns show a vertical title label). JSON: same `hero.sidebar.items` (`title`, `body`, `image`). Implementation: `components/ui/interactive-image-accordion.tsx`.

### 3D template marquee (optional `media.templateMarquee`)

Any product JSON may include `media.templateMarquee` with `images` (array of `{ src, alt }`), plus optional `eyebrow`, `heading`, and `intro`. When `images` is non-empty, a **3D marquee** section renders **after** the “What you deliver” / `features` block and **before** optional `media.beforeAfter` and other media sections. Implementation: `components/ui/three-d-marquee.tsx` (`ThreeDMarquee`). Currently used on **Website Builder** (`/products/website-builder`).

### Customer logo showcase (optional `media.logoShowcase`)

Any product JSON may include `media.logoShowcase` with `images` (`src`, `alt`, optional `height` in px), plus optional `eyebrow`, `heading`, `intro`, and optional **`ctaLabel`** / **`ctaHref`** (defaults: “Meet our customers” → `/customers/telcos`). Renders **after** `features` and **before** `templateMarquee`, `beforeAfter`, `contentImage`, and **partner advantage**.

| `layout` | Behavior |
|----------|----------|
| **`ticker`** (default if omitted) | **Infinite horizontal strip**: duplicated row, CSS `logoTicker` animation (~**50s** full loop by default, set **`tickerDurationSec`** 25–120). **Pause on hover**. **Edge fades** (white gradient). **`prefers-reduced-motion`**: static wrapped row, no scroll. CTA link **below** the strip. Implementation: `components/ui/logo-ticker.tsx`. |
| **`grid`** | Four-column **staggered blur-in** (Framer Motion); **hover** blurs grid + centers CTA. `components/ui/customers-section.tsx` + `components/ui/animated-group.tsx`. |

Logos use plain `<img>` (SVG/PNG from JSON). **Logo Design** (`/products/logo-design`) uses **`layout`: `ticker`** and **`tickerDurationSec`: 50** by default.

### Before / after image comparison (optional `media.beforeAfter`)

Any product JSON may include `media.beforeAfter` with `before` and `after` images (each `src` + `alt`), plus optional `eyebrow`, `heading`, and `intro`. When present, a **comparison slider** section renders **after** the `features` block (and **after** `templateMarquee`, if present) and **before** `contentImage` / partner sections. Left side of the slider = **before** (weaker/dated); right = **after** (improved). Implementation: `components/ui/image-comparison-slider.tsx` (`ImageComparison`). Currently used on **Website Design** (`/products/website-design`).

### Section rhythm after hero

When the hero sidebar is moved into vertical tabs, accordion, hosting feature carousel, or business-email interactive accordion, the next **features** section uses a cream band for separation: `bg-cream border-t border-gray-200/80` and a subtle inset top shadow (see `ProductPageFromJson`).

### Portfolio fit — lifecycle grid (`ProductLifecycleGrid`)

Four **separate cards** in a flex row/column with **chevrons** between steps (down on small screens, right on `lg+`). Implementation: `components/products/ProductLifecycleGrid.tsx` (accent list: `STEP_ACCENTS`). **Section label** “Portfolio fit” comes from `lifecycleFit.eyebrow` above the grid; the **portfolio-fit** step also gets a **floating charcoal tab** (gold star + “Portfolio Fit”) on the top edge of that card only.

| Rule | Detail |
|------|--------|
| **Portfolio fit column** | `highlight: true` in JSON **or** `step.productName` normalized-match to page `productName` |
| **Highlight styling** | Slight **scale** and **lift** on large screens (`lg:scale-[1.04] lg:-translate-y-1`), **teal-tinted border/ring**, **shadow** — **no gold/yellow fill** on the card body (star uses brand gold). Stronger step-number opacity than non-highlight steps. **Floating tab** on top center: charcoal pill, gold star, “Portfolio Fit” in white. Subtle **cream panel** + **teal left rail** inside the card. |
| **Per-card chrome** | Rounded card (`rounded-2xl`), light border, **bottom accent bar** full width in that column’s color. **Chevron** between steps: down on small screens, right on `lg+`. |
| **Lifecycle step title** | `text-xl font-black text-charcoal` (aligned with feature card titles) |
| **Lifecycle step body** | `text-sm text-gray-500 leading-relaxed` (aligned with feature card body) |

#### Lifecycle grid — color & shading specification (marketing & Hostopia Connects)

Use this table when reproducing the UI in **slides, PDFs, one-pagers**, or when **grouping or tagging content by lifecycle lane** in other systems (e.g. Hostopia Connects document libraries). The **four accents are fixed in order** for positions 1–4; a fifth step **cycles** back to orange.

| Position | Role (semantic) | Accent name | HEX | RGB | Brand guide note |
|----------|-----------------|-------------|-----|-----|------------------|
| **01** | Build a Brand | **Tertiary orange** | `#ff8400` | `255, 132, 0` | Tertiary accent — warmth / brand spark |
| **02** | Get Online | **Tertiary green** | `#66bc29` | `102, 188, 41` | Tertiary accent — growth / “go” |
| **03** | Get Found | **Medium gray** | `#97999b` | `151, 153, 155` | Secondary palette — neutral / discoverability |
| **04** | Grow | **Secondary teal** | `#2cadb2` | `44, 173, 178` | Secondary palette — digital energy / scale |

**Default card (all steps):**

| Element | Value |
|---------|--------|
| Card fill | **White** `#ffffff` |
| Card border | **Gray** at ~90% opacity on white → `border-gray-200/90` (Tailwind gray-200 ≈ `#e5e7eb`, used as soft edge) |
| Hover border | `border-gray-300` |
| Default shadow | `shadow-sm` |
| Hover shadow | `shadow-md` |
| Large step numeral | Accent color at **18% opacity** (`opacity: 0.18`) |
| Title | **Charcoal** `#24282b` |
| Body | **Gray-500** (Tailwind default ≈ `#6b7280`) |
| Bottom accent bar | Solid **accent** for that position, height **6px** (`h-1.5`) |
| Short underline under numeral | Solid **accent**, animates width on hover/expand |

**Portfolio Fit (highlighted) card — extra treatments:**

| Element | Value |
|---------|--------|
| Outer border | **Teal** at 35% opacity (`border-teal/35`) |
| Ring | **Teal** at 25% (`ring-1 ring-teal/25`) |
| Drop shadow | `shadow-lg` + `shadow-charcoal/10` |
| Large screens | **Scale** `1.04`, **translate up** `-translate-y-1` |
| Inner content area | **Cream** at 80% (`bg-cream/80`) — cream = `#f7f6f2` |
| Left rail | **Teal** at 80% (`border-l-teal/80`), **4px** wide |
| Large step numeral | Same accent hue at **50% opacity** |
| Floating tab | **Charcoal** `#24282b` background; **Gold** star `#f8cf41`; label **white** |

**Interaction (non–portfolio-fit step, expanded):**

| Element | Value |
|---------|--------|
| Inset focus | **2px** inset ring in the **step accent** at ~60% opacity (implementation: accent HEX + `99` alpha suffix) |

**Progression arrows (between cards):**

| Element | Value |
|---------|--------|
| Icon color | **Teal** at **45%** (`text-teal/45`) |
| Mobile | `ChevronDown`; **desktop** `lg+`: `ChevronRight` |

**Positioning content in Hostopia Connects (and similar):**

- Treat **position 01–04** as **stable lifecycle lanes**, not product names: reuse the same four HEX values for **folder colors, tags, or section headers** so materials align with the website’s portfolio story.
- A given **product** “sits” in **one** lane on a page (the Portfolio Fit step); **all four colors** still appear in every lifecycle section to show the full journey.
- For **print**, prefer **solid accents** for bars and numerals; use **cream 80% + teal rail** only when showing the highlighted step, to match the digital treatment.

---

## 13. Tailwind Custom Config Requirements

Ensure `tailwind.config.js` includes these custom extensions:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        charcoal: '#24282b',
        teal: '#2cadb2',
        'teal-dark': '#1d8f93',
        gold: '#f8cf41',
        'gold-dark': '#e0b82a',
        cream: '#f7f6f2',
        brand: {
          green: '#66bc29',
          orange: '#ff8400',
          'gray-medium': '#97999b',
        },
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
      },
    },
  },
}
```

---

*Document updated: March 26, 2026 — includes Vimeo blocks (`home-vimeo.json`, `media.vimeoOverview`), `media.logoShowcase`, lifecycle grid spec, and `media.templateMarquee`. Homepage reference: hostopia-website-cxets2acj-ginocardenas-8299s-projects.vercel.app*
