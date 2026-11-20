# InnoSkill AI Frontend Design System

Status: Frozen for frontend work on 2026-09-23.

## Design Direction

InnoSkill AI uses a Pearl Blue + White visual system: calm, accessible, professional, and information-dense. New UI must use the existing semantic tokens and shared primitives instead of introducing a parallel visual language.

## Colors

| Token | Value | Use |
| --- | --- | --- |
| `--primary` | `#2F6FED` | Primary actions, links, active states |
| `--primary-hover` | `#245ED0` | Hover state |
| `--primary-active` | `#1D4FB5` | Pressed state |
| `--primary-soft` | `#EAF2FF` | Selected and informational surfaces |
| `--deep` | `#163B73` | Deep brand emphasis |
| `--background` | `#F7F9FC` | Application background |
| `--surface` | `#FFFFFF` | Cards, panels, dialogs, inputs |
| `--surface-secondary` | `#F1F5FA` | Secondary surfaces and disabled controls |
| `--border` | `#DCE5F0` | Standard borders and separators |
| `--border-strong` | `#C8D5E5` | Emphasized borders |
| `--border-soft` | `#EAF0F6` | Subtle borders |
| `--text-primary` | `#172033` | Headings and primary content |
| `--text-secondary` | `#4B5870` | Supporting content |
| `--text-muted` | `#718096` | Metadata and captions |
| `--text-disabled` | `#A0A9B8` | Disabled and placeholder content |
| `--status-success` | `#16A36A` | Successful states |
| `--status-warning` | `#D98A00` | Warning states |
| `--status-error` | `#D64545` | Error and danger states |
| `--status-info` | `#2F6FED` | Informational states |

Semantic status must not rely on color alone. Pair badges and state colors with text or an icon.

## Typography

Use the existing Geist Sans font configuration from the root layout. Keep headings tight and readable, body text comfortable, and avoid introducing a second font family. Preserve the existing page title, description, and eyebrow helpers in `app/globals.css`.

## Spacing, Radius, and Shadows

- Use Tailwind spacing utilities and existing component padding patterns.
- Standard controls have a minimum height of `44px`.
- Shared inputs and controls use `12px` radius.
- Surface cards use the existing `16px` radius, Pearl border, white surface, and restrained shadow.
- Avoid nested cards unless the inner region is a genuinely framed tool or repeated item.

## Shared Components

- `SurfaceCard`: canonical white surface, border, radius, and shadow.
- `ActionCard`: navigable action surface with Pearl Blue icon treatment.
- `StatCard`: label, value, optional detail, and icon.
- `ProgressBar`: accessible `progressbar` with Pearl Blue indicator and soft Pearl track.
- `StatusBadge`: semantic success, info, warning, danger, and neutral states.
- `PageHeader`: consistent title, description, icon, actions, and breadcrumb region.
- `InnoSkillLogo`: canonical full, compact, header, and icon branding component.

Do not add unused visual variants or duplicate logo JSX. Prefer the shared component APIs for new screens.

## Buttons and Inputs

Use the existing `.button-primary`, `.button-secondary`, `.button-ghost`, `.button-danger`, and `.input-pearl` classes where applicable. Every interactive control needs hover, pressed, disabled, and visible keyboard focus states. Inputs need an associated label and useful error or helper text when the workflow requires it.

## Focus and Accessibility

The global `:focus-visible` rule provides a `2px` Pearl Blue outline with offset. Do not add `focus:outline-none`, `focus:ring-0`, or equivalent rules that suppress focus without replacing it. Preserve high contrast, large text, reduced motion, keyboard navigation, and voice-first accessibility features.

Accessibility toggles use explicit switch semantics with `role="switch"` and `aria-checked` where appropriate. Touch targets should remain at least `44px`.

## Navigation and Responsive Behavior

The dashboard uses a desktop sidebar and mobile drawer pattern. Page headers and action groups wrap at narrow widths. Use safe horizontal scrolling for wide data rather than allowing page-level overflow.

The responsive verification matrix is:

- Mobile: `320px`, `375px`, `390px`, `430px`
- Tablet: `768px`, `820px`, `1024px`
- Desktop: `1280px`, `1440px`, `1920px`

Tailwind breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`) and the existing CSS media queries are the source of truth. New breakpoint-specific behavior should be justified by a real layout need.

## Branding and Metadata

- Full and compact visible branding uses `components/brand/InnoSkillLogo.tsx`.
- Metadata in `app/layout.tsx` uses the canonical `public/branding/` favicon, icon, and logo assets.
- `app/icon.svg` and `public/favicon.svg` use Pearl Blue, Deep Pearl Blue, and White only.
- Do not introduce cyan, emerald, neon, or unrelated dark legacy branding.

## Motion

Keep motion purposeful and lightweight. Respect `prefers-reduced-motion`; the global reduced-motion rule disables transitions and animations for users who request it.

## Freeze Rules

Future frontend changes may extend this system only for a functional requirement, accessibility requirement, responsive bug, or a genuinely new component need. Do not introduce a new primary color, typography system, card system, button system, navigation pattern, or competing branding asset without updating this document and reviewing the freeze.
