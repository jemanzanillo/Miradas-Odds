

# Miradas! Lac Banquet — Prediction App

## Visual Identity
- **Color palette**: Warm beige/cream backgrounds with deep burgundy/maroon text and accents — matching the event posters
- **Typography**: Elegant script font for headings ("Miradas!" style), clean serif for body text
- **Card theme**: Playing card motifs throughout — suits (♠♥♦♣), card borders, gold foil accents

---

## Page 1: Mobile Voting Screen (guests' phones)

**Header**: "Miradas! Lac Banquet" title with the date (02 | 15 | 2026) and a subtle Queen card illustration

**Guest Name Entry**: Simple input asking "What's your name?" before voting (no login needed — just a name to personalize the experience)

**King Selection Grid**: 8 playing card-styled tiles arranged in a 2×4 grid, each showing:
- A King card design with the suit icon (2 Kings per suit: ♠♥♦♣)
- The King's name displayed on the card
- Tap to select — selected card flips/glows with a gold border animation

**Submit Button**: "Place Your Bet" — styled like a poker chip. Shows a fun confirmation animation (card flip) after submitting

**After Voting**: A "Your pick: King [Name] ♥" confirmation with an option to change their prediction

---

## Page 2: Big Screen / Projector Display

**Header**: Large "Miradas! Lac Banquet" branding with the Queen card prominently displayed

**Live Prediction Board**: 8 King cards displayed in a row, each showing:
- The King's name on a stylized playing card
- A vote count bar that fills up in real-time beneath each card
- The number of votes displayed
- Animated entrance — cards deal onto the screen one by one

**Visual flair**:
- The leading King's card glows or subtly pulses
- Decorative card suit patterns scattered in the background
- Warm, romantic color scheme matching the posters

---

## Implementation Details
- **Mobile-first voting page** at the root URL `/`
- **Display screen** at `/display` route (for the projector)
- **Local state only** (no backend) — votes stored in-memory with simulated real-time updates for demo purposes
- **Responsive**: voting page optimized for phones, display page optimized for landscape/large screens
- Playing card CSS designs (no images needed — built with styled components)

