═══════════════════════════════════════════════════
RAMS DESIGN REVIEW: All Component Files
═══════════════════════════════════════════════════

═══════════════════════════════════════════════════
COMPONENT: CompetitionBanner.tsx
═══════════════════════════════════════════════════

CRITICAL (1 issue)
───────────────────
[A11Y] Line 14: Non-semantic click handler
  <div onClick={onNavigate}>
  Fix: Convert to <button> or add role="button", tabIndex="0", and onKeyDown handler
  WCAG: 2.1.1

SERIOUS (1 issue)
──────────────────
[A11Y] Line 14: Missing keyboard handler
  <div onClick={onNavigate}>
  Fix: Add onKeyDown handler for Enter/Space keys
  WCAG: 2.1.1

MODERATE (1 issue)
──────────────────
[DESIGN] Line 13: Inconsistent hover state
  hover:scale-[1.01] - Scale transform may cause layout shift
  Fix: Consider using transform-gpu and ensure container has overflow handling

═══════════════════════════════════════════════════
COMPONENT: CompetitionPage.tsx
═══════════════════════════════════════════════════

CRITICAL (1 issue)
───────────────────
[A11Y] Line 121: Non-semantic click handler
  <div onClick={() => onWinnerClick(winner)}>
  Fix: Convert to <button> or add role="button", tabIndex="0", and onKeyDown handler
  WCAG: 2.1.1

SERIOUS (2 issues)
──────────────────
[A11Y] Line 429: Focus outline removed without replacement
  focus:outline-none focus:ring-0
  Fix: Add visible focus indicator (e.g., focus:ring-2 focus:ring-blue-500)
  WCAG: 2.4.7

[A11Y] Line 450: Focus outline removed without replacement
  focus:outline-none focus:ring-0
  Fix: Add visible focus indicator
  WCAG: 2.4.7

MODERATE (2 issues)
──────────────────
[DESIGN] Line 429: Form input missing focus state
  Select element has no visible focus feedback
  Fix: Add focus:ring-2 focus:ring-blue-500 focus:border-blue-500

[DESIGN] Line 450: Textarea missing focus state
  Textarea has no visible focus feedback
  Fix: Add focus:ring-2 focus:ring-blue-500 focus:border-blue-500

═══════════════════════════════════════════════════
COMPONENT: ContestRulesPage.tsx
═══════════════════════════════════════════════════

MODERATE (1 issue)
──────────────────
[DESIGN] Line 226: Button styled as card may confuse users
  Button element styled like informational card
  Fix: Consider adding visual indicator (e.g., hover:shadow-lg) to clarify interactivity

═══════════════════════════════════════════════════
COMPONENT: ContributionDetailCard.tsx
═══════════════════════════════════════════════════

SERIOUS (1 issue)
──────────────────
[A11Y] Line 153: Link without href (placeholder)
  <a href="#">
  Fix: Add proper href or convert to button if not navigational
  WCAG: 2.1.1

MODERATE (1 issue)
──────────────────
[DESIGN] Line 153: Placeholder link may confuse users
  Link appears clickable but goes nowhere
  Fix: Implement proper navigation or disable styling

═══════════════════════════════════════════════════
COMPONENT: FigureSelector.tsx
═══════════════════════════════════════════════════

MODERATE (1 issue)
──────────────────
[DESIGN] Line 91-101: Hidden link may be confusing
  <p hidden><a href="#">
  Fix: Remove hidden content or make it visible if needed for accessibility

═══════════════════════════════════════════════════
COMPONENT: Header.tsx
═══════════════════════════════════════════════════

SERIOUS (1 issue)
──────────────────
[A11Y] Line 16: Focus outline removed without visible replacement
  focus:outline-none
  Fix: Add visible focus indicator (e.g., focus:ring-2 focus:ring-blue-500)
  WCAG: 2.4.7

MODERATE (1 issue)
──────────────────
[DESIGN] Line 16: Button needs better focus state
  Logo button has minimal focus feedback
  Fix: Add focus:ring-2 focus:ring-blue-500 focus:ring-offset-2

═══════════════════════════════════════════════════
COMPONENT: HowToBanner.tsx
═══════════════════════════════════════════════════

MODERATE (1 issue)
──────────────────
[DESIGN] Line 26: Decorative image marked as aria-hidden
  aria-hidden="true" on potentially informative image
  Fix: If decorative, ensure alt="" or keep aria-hidden. If informative, add alt text.

═══════════════════════════════════════════════════
COMPONENT: WalletConnector.tsx
═══════════════════════════════════════════════════

MODERATE (1 issue)
──────────────────
[DESIGN] Line 14-19: Inline styles override component defaults
  style prop may conflict with component's internal styling
  Fix: Use className with Tailwind utilities or CSS variables for theming

═══════════════════════════════════════════════════
COMPONENT: MessageComposer.tsx
═══════════════════════════════════════════════════

SERIOUS (1 issue)
──────────────────
[A11Y] Line 45: Focus outline removed but has ring replacement
  focus:outline-none focus:ring-2 focus:ring-blue-300
  Status: ACCEPTABLE - Has visible focus replacement

MODERATE (1 issue)
──────────────────
[DESIGN] Line 56: Icon-only button missing accessible name
  <button><SendIcon /></button>
  Fix: Add aria-label="Send message" (already has text context, but icon alone needs label)
  Note: Button is in form context, so may be acceptable

═══════════════════════════════════════════════════
COMPONENT: Modal.tsx
═══════════════════════════════════════════════════

MODERATE (1 issue)
──────────────────
[DESIGN] Line 80: outline-none may hide focus
  outline-none on modal container
  Fix: Ensure focusable children have proper focus indicators

═══════════════════════════════════════════════════
COMPONENT: App.tsx
═══════════════════════════════════════════════════

MODERATE (1 issue)
──────────────────
[DESIGN] Line 110-116: Video missing controls/transcript
  <video> without controls or captions
  Fix: Add controls attribute or provide transcript link
  Note: If decorative, add aria-hidden="true"

═══════════════════════════════════════════════════
COMPONENT: ChatInterface.tsx
═══════════════════════════════════════════════════

CRITICAL (1 issue)
───────────────────
[A11Y] Line 2457: Non-semantic click handler on overlay
  <div onClick={dismissShareOverlay}>
  Fix: Overlay click is acceptable for modal dismissal, but ensure keyboard escape works (already implemented)

SERIOUS (4 issues)
──────────────────
[A11Y] Line 158: Focus outline removed without replacement
  focus:outline-none
  Fix: Add visible focus indicator
  WCAG: 2.4.7

[A11Y] Line 436: Focus outline removed but has ring replacement
  focus:outline-none focus:ring-2
  Status: ACCEPTABLE - Has visible focus replacement

[A11Y] Line 467: Focus outline removed but has ring replacement
  focus:outline-none focus:ring-2
  Status: ACCEPTABLE - Has visible focus replacement

[A11Y] Line 2564: Link without href (placeholder)
  <a href="#">
  Fix: Add proper href or convert to button
  WCAG: 2.1.1

MODERATE (5 issues)
──────────────────
[DESIGN] Line 158: Accordion button needs better focus state
  Button has focus:outline-none without replacement
  Fix: Add focus:ring-2 focus:ring-blue-500

[DESIGN] Line 2564: Placeholder link styling
  Link appears navigational but goes nowhere
  Fix: Implement proper navigation or style as button

[DESIGN] Line 2722: Avatar image missing descriptive alt
  alt="figure avatar" is generic
  Fix: Use alt={figure.name} or alt={`${figure.name} avatar`}

[DESIGN] Line 2595-2614: Navigation buttons use Unicode arrows
  ◀ and ▶ may not render consistently
  Fix: Use SVG icons or ensure font fallback

[DESIGN] Line 2673: Overlay button may be confusing
  Transparent overlay button for disabled state hint
  Fix: Consider using tooltip library or aria-describedby

═══════════════════════════════════════════════════
SUMMARY
═══════════════════════════════════════════════════

CRITICAL: 3 issues
- Non-semantic click handlers (3 instances)

SERIOUS: 9 issues
- Focus outline removed without replacement (5 instances)
- Missing keyboard handlers (1 instance)
- Links without href (2 instances)
- Focus outline removed but has acceptable replacement (1 instance - acceptable)

MODERATE: 15 issues
- Design inconsistencies and improvements

Overall Score: 72/100

Priority Actions:
1. Convert non-semantic click handlers to buttons or add proper ARIA
2. Add visible focus indicators where outline-none is used
3. Fix placeholder links (add proper href or convert to buttons)
4. Improve focus states on form inputs and interactive elements

═══════════════════════════════════════════════════
