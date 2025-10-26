# Panem Express Web Booking Portal - Design Guidelines

## Design Approach

**Selected Approach**: Design System (Material Design-inspired) with inspiration from modern booking platforms (IRCTC, Trainline, Booking.com)

**Rationale**: Rail booking systems prioritize clarity, efficiency, and trust. Users need to quickly understand availability, make selections, and confirm bookings without confusion. A systematic approach ensures consistency across complex booking flows.

**Core Principles**:
- Information clarity over visual flair
- Predictable, familiar booking patterns
- Strong visual hierarchy for decision-making
- Trust-building through professional presentation

## Typography System

**Font Families** (via Google Fonts):
- Primary: Inter (headers, UI elements, buttons) - weights 400, 500, 600, 700
- Secondary: Roboto (body text, data displays) - weights 400, 500

**Type Scale**:
- Page Titles: text-4xl font-bold (booking confirmation, dashboard)
- Section Headers: text-2xl font-semibold (route selection, seat map)
- Subsections: text-xl font-medium (coach class labels, booking details)
- Body Text: text-base (form labels, instructions, descriptions)
- Small Text: text-sm (helper text, disclaimers, seat numbers)
- Micro Text: text-xs (PNR codes, timestamps, legal text)

**Hierarchy Application**:
- Booking flow headers use text-3xl font-bold for current step
- Fare displays use text-2xl font-bold for emphasis
- PNR codes displayed in text-lg font-mono for readability
- Error messages in text-sm font-medium

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

**Common Patterns**:
- Container padding: px-6 md:px-12 lg:px-16
- Section spacing: py-12 md:py-16
- Card padding: p-6
- Form field spacing: space-y-4
- Button padding: px-6 py-3
- Tight groupings: gap-2
- Standard groupings: gap-4
- Loose groupings: gap-8

**Grid System**:
- Main content: max-w-7xl mx-auto
- Forms/booking flow: max-w-2xl mx-auto
- Dashboard: max-w-6xl mx-auto
- Two-column layouts: grid grid-cols-1 lg:grid-cols-2 gap-8

## Component Library

### Navigation & Header
**Main Navigation Bar**:
- Fixed top navigation with max-w-7xl container
- Logo (left), navigation links (center), user menu (right)
- Height: h-16 md:h-20
- Items: Home, Book Ticket, My Bookings, [User Avatar/Login]
- Responsive: Hamburger menu for mobile

### Authentication Components

**Login/Registration Forms**:
- Centered card layout with max-w-md
- Input fields with labels above, rounded-lg borders
- Height: h-12 for inputs
- Submit buttons full-width with h-12
- "Remember me" checkbox with text-sm label
- Social proof text below form: "Join 10,000+ travelers booking with Panem Express"

### Booking Flow Components

**Step Indicator**:
- Horizontal stepper showing: Route → Date → Seats → Details → Confirm
- Active step highlighted, completed steps with checkmark icons
- Uses flex layout with justify-between
- Each step: flex flex-col items-center gap-2

**Route Selection Card**:
- Each route displayed as card with rounded-lg border
- Layout: grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4
- Station names (text-xl font-semibold), arrow icon, distance display
- Distance badge: text-sm rounded-full px-4 py-1
- Entire card clickable with hover state

**Calendar Widget**:
- Full calendar month view in grid-cols-7
- Date cells: aspect-square rounded-lg
- Disabled dates (past/unavailable) with opacity-40
- Selected date with ring-2 treatment
- Current date with subtle underline

**Coach & Class Selection**:
- 5 coach cards in horizontal scroll or grid (grid-cols-1 md:grid-cols-3 lg:grid-cols-5)
- Each card shows: class name (text-lg font-semibold), rate per km, available seats count
- Card structure: p-6 rounded-xl border-2
- Selected coach has thicker border and subtle shadow

**Seat Map Interface** (Critical Component):
- Grid layout representing 5 rows × 4 columns per coach
- Seat representation: w-12 h-12 rounded-lg border-2 with seat number (text-xs)
- Three states: Available (default), Selected (ring-2 highlighted), Booked (opacity-30 cursor-not-allowed)
- Aisle gap between column 2 and 3: gap-8
- Row headers on left (text-sm)
- Legend below map: flex gap-6 items-center with sample seat blocks
- Responsive: Reduce seat size on mobile (w-10 h-10)

**Passenger Details Form**:
- Two-column grid for fields: grid-cols-1 md:grid-cols-2 gap-4
- Full-width for passenger name field
- Age input with validation message space reserved (min-h-6 below)
- Senior discount badge appears automatically when age ≥ 60 (rounded-full px-3 py-1 text-sm)
- Age restriction notice for < 7 in text-sm

**Fare Summary Panel**:
- Sticky sidebar on desktop (lg:sticky lg:top-24)
- Breakdown list with space-y-2:
  - Base fare (distance × rate)
  - Discount (if applicable) with strikethrough on original
  - Total in text-2xl font-bold
- Book button at bottom with full width
- Shows "Pay at station" notice in text-sm

### Dashboard Components

**My Bookings List**:
- Card-based list with space-y-4
- Each booking card: p-6 rounded-lg border
- Grid layout: grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-6
- Left: Route info (from → to), date, time
- Middle: Seat details (Coach, Row, Seat), PNR in font-mono
- Right: Fare and Cancel button
- Status badges: upcoming (default), cancelled (opacity-60)
- Empty state: Centered illustration with "No bookings yet" message

**Booking Confirmation View**:
- Success checkmark icon at top (w-16 h-16)
- PNR prominently displayed in text-3xl font-mono
- Details table with alternating row treatment
- Download/Print button with icon
- "Book Another Ticket" CTA button
- Important notice box with rounded-lg border-2: "Present this PNR at station for payment"

### Form Elements

**Input Fields**:
- Consistent height: h-12
- Rounded corners: rounded-lg
- Border: border-2
- Label above with text-sm font-medium mb-2
- Placeholder text in text-sm
- Focus state with ring-2
- Error state with border in error tone and message below in text-sm

**Buttons**:
- Primary CTA: px-6 py-3 rounded-lg font-semibold text-base
- Secondary: px-6 py-3 rounded-lg font-medium border-2
- Icon buttons: w-10 h-10 rounded-lg
- Disabled state: opacity-50 cursor-not-allowed

**Select Dropdowns**:
- Same height as inputs (h-12)
- Chevron icon on right
- Options list with max-h-60 overflow-y-auto

### Notification Components

**Toast Messages**:
- Fixed position: top-4 right-4
- Max width: max-w-md
- Padding: p-4 rounded-lg
- Icon (left), message (center), close button (right)
- Auto-dismiss after 5 seconds
- Types: Success (booking confirmed), Error (validation), Info (seat released)

**Alert Boxes**:
- Full-width within container
- Padding: p-4 rounded-lg border-l-4
- Icon left-aligned with message
- Used for: Payment instructions, age restrictions, cancellation policies

### Footer

**Footer Layout**:
- Three-column grid: grid-cols-1 md:grid-cols-3 gap-8
- Column 1: About Panem Express, brief description
- Column 2: Quick links (Terms, Privacy, Contact, Help)
- Column 3: Contact info and social icons
- Bottom bar: Copyright and trust badges ("Secure Booking", "24/7 Support")
- Padding: py-12

## Responsive Behavior

**Breakpoint Strategy**:
- Mobile-first approach
- Key breakpoints: md (768px), lg (1024px)
- Seat map scales from single column to full grid
- Navigation collapses to hamburger menu on mobile
- Dashboard cards stack vertically on mobile
- Booking flow maintains single-column on mobile for clarity

## Animations

**Minimal, Purpose-Driven**:
- Seat selection: Scale animation (scale-95 to scale-100) on click
- Form submission: Loading spinner on button
- Toast notifications: Slide-in from right (translate-x-full to translate-x-0)
- Page transitions: Simple fade-in (opacity-0 to opacity-100, 300ms)
- No decorative or scroll-based animations

## Images

**Hero Section** (Homepage):
- Full-width hero with modern train imagery
- Overlay for text readability (gradient)
- Search/quick booking form overlaid with backdrop-blur-md treatment
- Height: h-[500px] md:h-[600px]
- Buttons on hero use backdrop-blur-sm for glass morphism effect

**Supporting Images**:
- Trust badges/partner logos in footer (h-8 grayscale filter)
- User avatar placeholders in navigation (w-10 h-10 rounded-full)
- Empty state illustrations for "No bookings" (max-w-xs mx-auto)
- Success confirmation icon (checkmark in circle, w-20 h-20)

**Image Placement**:
- Hero: Homepage only with booking CTA overlay
- Illustrations: Empty states, confirmation screens
- Icons: Throughout UI from Heroicons library (via CDN)
- No images in booking flow screens (keeps focus on functionality)

## Accessibility

- All interactive elements have min-height: h-10 (40px touch target)
- Form labels explicitly associated with inputs
- Error messages with aria-live regions
- Seat selection announced to screen readers
- Keyboard navigation for entire booking flow (tab order logical)
- Focus indicators visible on all interactive elements (ring-2)
- Contrast ratios maintained for text on all backgrounds