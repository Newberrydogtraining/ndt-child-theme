# Hero 7-Section Implementation Guide

## ✅ What's Complete

Your new luxury hero experience is ready to use! Here's what's included:

### Files Created/Updated:
1. ✅ **CSS**: `/assets/css/ndt-hero.css` (924 lines) - Complete styling for all 7 sections
2. ✅ **JS**: `/assets/js/ndt-hero.js` (709 lines) - Scroll animations, tabs, video management
3. ✅ **HTML**: `hero-7-section-complete.html` - Complete markup ready to paste

### Functional Features:
- ✅ 7 full-height sections with Apple MacBook Pro-inspired design
- ✅ Scroll-triggered IntersectionObserver animations
- ✅ Staggered child element reveals (100ms delay between items)
- ✅ Tab switching functionality ("What to Expect" / "Why Trust Us")
- ✅ Video autoplay/pause on viewport visibility
- ✅ Scroll hint indicator with bounce animation
- ✅ Fully responsive down to mobile
- ✅ Accessibility features (ARIA, reduced motion support)
- ✅ Uses your new 10-token minimal color system

---

## 🎬 Media Placeholders to Add

You currently have **2 video placeholder areas** in the HTML:

### Video Placeholder #1: Section 2 (Promise)
**Location**: `.ndt-hero-promise__media` (lines ~93-107 in HTML)
**Current State**: Shows placeholder text "📹 Add your intro video here"
**What to Add**: Introduction/overview video showing your facility, team, or training in action
**Recommended Specs**:
- Aspect ratio: 16:9
- Format: MP4 (H.264 codec)
- Resolution: 1920x1080 minimum
- Should autoplay, loop, be muted

**Implementation**:
```html
<video
  class="ndt-hero-promise__video"
  src="YOUR_VIDEO_URL_HERE.mp4"
  autoplay
  loop
  muted
  playsinline
></video>
```

---

### Video Placeholder #2: Section 6 (Transformation)
**Location**: `.ndt-hero-transformation__video-container` (lines ~394-407 in HTML)
**Current State**: Already has your tilt video (`board-train-tilt.mp4`)
**What to Consider**:
- ✅ **Already implemented** with your existing tilt video
- You can replace this with a different transformation showcase video if desired
- Consider: before/after training footage, success stories, testimonials

---

## 📋 Optional Enhancements (Future)

These are **NOT required** but could enhance the experience:

### Section 4 Service Cards - Image Spots
Each service card has a commented-out image placeholder area:
- **Class**: `.ndt-hero-service-card__media-spot`
- **Purpose**: Add photos of each training type in action
- **Current**: Not visible (commented out in CSS)
- **To Activate**: Uncomment lines 412-430 in `ndt-hero.css`

If you want to add service images:
1. Uncomment the media-spot CSS rules
2. Add `<div class="ndt-hero-service-card__media-spot"></div>` before the icon in each card
3. Replace with actual `<img>` tags

---

## 🚀 How to Implement

### Step 1: Paste HTML into Elementor
1. Open your homepage in Elementor
2. Find your current hero section
3. Replace the entire hero HTML with contents from `hero-7-section-complete.html`
4. Save and preview

### Step 2: Add Your Videos
1. Upload videos to WordPress Media Library
2. Copy the video URLs
3. Replace the placeholder comments in Section 2 with actual `<video>` tags
4. Section 6 already has your tilt video - replace if desired

### Step 3: Test Functionality
- [ ] Scroll through all 7 sections smoothly
- [ ] Animations trigger as you scroll into each section
- [ ] Challenge items stagger-reveal (Section 3)
- [ ] Service cards stagger-reveal (Section 4)
- [ ] Tabs switch between "What to Expect" / "Why Trust Us" (Section 5)
- [ ] Videos play when in viewport, pause when out
- [ ] CTA button opens evaluation modal
- [ ] Mobile responsive (test on phone)

### Step 4: Adjust Dog Parallax Timing
As you mentioned, you'll need to adjust your dog parallax background to trigger **after** these 7 sections complete.

Current hero takes approximately:
- **7 viewport heights** of scroll distance
- Adjust your parallax `ScrollTrigger` to start at `"top -700%"` or similar

---

## 📝 Content Customization

All text content is placeholder-ready. Feel free to adjust:

### Section 1 (Hero Statement):
- **Headline**: "The Last Dog Trainer You'll Ever Need"
- **Subheadline**: "Professional, science-based training..."

### Section 2 (Promise):
- **Title**: "Trusted professional dog training in the Upstate"
- **Location**: "Serving Newberry, SC and surrounding communities"

### Section 3 (Challenge):
- 4 pain points listed (pulling, aggression, separation anxiety, tried everything)
- Edit text as needed

### Section 4 (Services):
- 4 service cards (Private, Board & Train, Consulting, Group Classes)
- Icons are simple SVG paths (easy to swap)

### Section 5 (Proof):
- Tab 1: "What to Expect" (4 values)
- Tab 2: "Why Trust Us" (4 values)
- Edit titles and descriptions as needed

### Section 6 (Transformation):
- Title: "From Chaos to Calm"
- 4 outcome highlights (off-leash control, calm around distractions, etc.)

### Section 7 (CTA):
- **Headline**: "Transform Your Dog's Behavior Today"
- **Subtitle**: "Book a free evaluation..."
- **Button**: "Book Free Evaluation" (already wired to your modal)

---

## 🎨 Design Tokens Used

Your new minimal color system (10 tokens):

**Neutrals**:
- `--surface` (#0B0C0E) - Deep black backgrounds
- `--surface-raised` (#1A1B1E) - Card backgrounds
- `--text` (#F5F5F4) - White text
- `--text-muted` (#A8ABA6) - Gray text
- `--border` (#2E3138) - Borders

**Accent Purple** (Brand):
- `--accent` (#8B6FC9) - Tab active, dots, icons
- `--accent-hover` (#9D7FDB) - Hover states
- `--accent-active` (#7A5EB8) - Active/pressed

**CTA Green** (Conversion):
- `--cta` (#00692A) - Primary CTA button
- `--cta-hover` (#2F694C) - CTA hover state

---

## ✨ Animation Details

### Scroll-Triggered Reveals:
- **Threshold**: 15% of element visible triggers animation
- **Duration**: 0.6s - 1.2s (varies by section)
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (Apple-style smooth ease)
- **One-time**: Animations fire once, don't repeat on scroll up

### Staggered Children:
- **Challenge items** (Section 3): 100ms stagger
- **Service cards** (Section 4): 100ms stagger
- **Transformation outcomes** (Section 6): 100ms stagger

### Tab Switching:
- **Fade-in duration**: 0.6s
- **No page reload** - pure CSS/JS

### Video Management:
- **Autoplay** when 25% visible
- **Pause** when out of viewport
- **Performance**: Saves bandwidth and CPU

---

## 🐛 Troubleshooting

### Animations not triggering?
- Check browser console for errors
- Verify `ndt-hero.js` is loaded (check Network tab)
- IntersectionObserver requires modern browser (IE not supported)

### Videos not autoplaying?
- Ensure `muted` attribute is present (required for autoplay)
- Check `playsinline` is set (required for iOS)
- Verify video URL is correct and accessible

### Tabs not switching?
- Check console for JS errors
- Verify `data-tab` and `data-panel` attributes match
- Ensure only one tab has `is-active` class initially

### Mobile layout broken?
- Media queries kick in at 768px
- Grids stack to single column on mobile
- Test in Chrome DevTools mobile emulator

---

## 📊 Performance Notes

### CSS Size:
- **ndt-hero.css**: 924 lines (~28KB minified)
- Uses CSS custom properties (minimal overhead)

### JS Size:
- **ndt-hero.js**: 709 lines (~22KB minified)
- No external dependencies (uses native IntersectionObserver)
- Legacy dog parallax code preserved (lines 262-709)

### Video Optimization:
- Videos load lazily via IntersectionObserver
- Only play when visible (battery-friendly)
- Consider compressing videos to <5MB each

---

## 🎯 Next Steps

1. **Copy HTML** from `hero-7-section-complete.html` into Elementor
2. **Upload videos** to WordPress Media Library
3. **Replace video placeholders** with actual `<video>` tags
4. **Test on staging** site before going live
5. **Adjust dog parallax** timing to start after Section 7
6. **Mobile test** on real device
7. **Ship it** 🚀

---

## 📞 Need Help?

If anything isn't working:
1. Check browser console for errors
2. Verify all CSS/JS files are enqueued (check `functions.php`)
3. Test with browser DevTools to inspect elements
4. Ensure no conflicting Elementor styles

---

**Summary**: You have 2 video placeholders to fill. Section 6 already has your tilt video. Section 2 needs an intro/overview video. Everything else is ready to go!
