# Route.dog Design System
## "The Driver's Sketchbook" Aesthetic

Last updated: 2026-01-19

## Design Concept

Route.dog uses a **hand-drawn, sketch notebook aesthetic** that transforms a delivery route mapping tool into something that feels personal, warm, and approachable - like a delivery driver's well-loved route planner.

### Core Design Principles

1. **Warmth over Corporate**: Friendly, hand-drawn elements instead of sterile UI
2. **Personality through Imperfection**: Wobbly lines, sketch effects, organic animations
3. **Monochrome Elegance**: Paper/charcoal color palette with subtle warmth
4. **Playful Functionality**: Dog mascot and paw prints add character without sacrificing usability

## Visual Elements

### Typography

**Display Font**: `Caveat` (handwritten, casual)
- Used for: Headers, titles, emphasis
- Weight: 700 (bold) for maximum personality
- Example: "Route.dog" title, section headers

**Body Font**: `Patrick Hand` (friendly handwritten)
- Used for: Body text, UI labels, descriptions
- More legible than display font while maintaining sketch aesthetic
- Example: Address entries, button text, descriptions

### Color Palette

#### Light Theme (Default)
- **Background**: `#FAF8F3` (cream/paper)
- **Foreground**: `#1A1A1A` (charcoal/ink)
- **Card**: `#FFFFFF` (clean white)
- **Border**: `#D4CFC0` (soft taupe)
- **Muted**: `#EDE9DC` (warm gray)

#### Dark Theme
- **Background**: `#2C2622` (dark charcoal)
- **Foreground**: `#F5F2E8` (cream)
- **Card**: `#3A3530` (warm dark brown)
- **Border**: `#524D48` (medium brown)
- **Accent**: Warm earth tones

### Key Visual Features

#### 1. Paper Texture Overlay
- Subtle grid pattern overlays entire background
- Creates authentic notebook paper feel
- Animated grain effect for depth

#### 2. Sketch Borders & Lines
- Dashed, wobbly borders on cards and panels
- Hand-drawn underlines on hover
- Imperfect circles and shapes using SVG

#### 3. Dog Mascot
- Custom SVG illustration with multiple states:
  - **Happy**: Default friendly state
  - **Excited**: When addresses are loaded
  - **Sleeping**: Idle state (future)
- Animated ears and tail wag
- Appears in header and empty states

#### 4. Paw Print Decorations
- Scattered throughout UI as subtle accents
- Animated fade/rotate effect
- Used as decorative elements, never obstructive

## Component Design

### Header
- Semi-transparent card with backdrop blur
- Torn paper edge effect at bottom
- Dog mascot next to Route.dog title
- Sketch-style underline on title (appears on hover)
- Buttons with border-2 and hover wobble animation

### Upload Area
- Large, welcoming empty state
- Friendly mascot and handwritten instructions
- Hand-drawn border decoration around upload button
- Sketch-style arrow pointing to button
- Tips in dashed-border note card

### Address List Panel
- Bottom sheet with notebook ring binding decoration
- Decorative wavy line under header
- Each address entry styled as notebook entry:
  - Hand-drawn circle number badge
  - Start/End emoji indicators (🏁/🎯)
  - Sketch-style underline at bottom
  - Map pin icon with handwritten address
  - Dashed border edit button

### Address Items
- Stop numbers in hand-drawn circles
- Large, readable handwritten text for addresses
- Coordinate display with monospace font for contrast
- Error states with friendly language ("Couldn't find this address on the map 🤔")
- Hover effects: shadow and border color change

## Animations & Interactions

### Button Interactions
- **Hover**: Subtle wobble animation (`sketch-wobble`)
- **Click**: Scale transform
- Duration: 0.5s ease-in-out

### Dog Mascot
- **Periodic**: Ears wiggle and tail wag every 4 seconds
- **State-based**: Excited state when addresses loaded
- Duration: 600ms for animations

### Paw Prints
- **Fade-in-out**: Opacity pulses 0 → 0.15 → 0
- **Rotation**: Slight rotation during animation
- **Placement**: Random rotation angles for organic feel

### Loading States
- Friendly messages: "Sniffing out addresses..."
- Spinning loader with handwritten text
- Maintains playful tone throughout

## Accessibility

- Semantic HTML maintained
- ARIA labels on icon buttons
- Screen reader text for decorative elements
- Sufficient color contrast (WCAG AA compliant)
- Focus indicators preserved

## Dark Mode

- Warm dark theme (not pure black)
- Paper texture inverted but subtle
- All animations and effects work in both modes
- Dog mascot and paw prints adapt to theme colors

## Design Tokens

### Border Radius
- Small: `2px` (crisp, sketchy)
- Medium: `4px`
- Large: `6px`
- Extra Large: `8px`

### Spacing Scale
- Uses Tailwind's default spacing
- Generous padding in cards for breathing room
- Tighter gaps for compact list items

### Effects
- Drop shadows: `2px 2px 3px rgba(0,0,0,0.15)` (subtle sketch shadow)
- Backdrop blur: `backdrop-blur-sm` for semi-transparent cards
- Borders: Primarily `border-2` or `border-dashed` for sketch feel

## Implementation Notes

### CSS Architecture
- Uses Tailwind CSS v4 with custom theme
- Handwritten font classes: `.handwritten`, `.handwritten-alt`
- Utility classes for sketch effects: `.sketch-border`, `.sketch-underline`, `.torn-edge`
- Custom animations defined in index.css

### Performance Considerations
- Fonts loaded via Google Fonts CDN
- SVG illustrations inline for zero network requests
- Paper texture uses CSS gradients (no images)
- Animations use CSS transform/opacity for GPU acceleration

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback fonts for handwritten typefaces
- Progressive enhancement for animations

## Future Enhancements

- Additional dog mascot states (sleeping, running)
- More paw print animation variations
- Sketch-style map markers
- Hand-drawn route lines on map
- Notebook spiral binding decoration
- Sticky note style for notifications
- Eraser tool animation for deletions
- Pencil sketch drawing effect for new addresses

---

**Design Philosophy**: Every pixel should feel crafted by hand, every interaction should delight, and every user should feel like they're working with a friendly companion, not a cold tool.
