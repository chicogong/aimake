# aimake.cc Landing Page Design Document

## 🎯 Design Goals

1. **Immediate Clarity**: Communicate core value within 3 seconds
2. **Trust Building**: Showcase technology superiority (SGLang, pronunciation accuracy)
3. **Low Friction**: Enable instant testing without signup
4. **Conversion**: Drive users to sign up for free trial
5. **Differentiation**: Highlight unique features vs competitors

---

## 📐 Page Structure

### Section 1: Hero (Above the Fold)

**Purpose**: Hook users instantly with clear value proposition

**Elements**:
- **Headline**: "Create Perfect Audio in Seconds"
  - Subheadline: "AI-powered TTS with pronunciation you can trust. From brand names to technical terms, every word sounds right."
- **Primary CTA**: "Try It Free" (leads to interactive demo)
- **Secondary CTA**: "See How It Works" (scroll to demo)
- **Hero Visual**: Animated Infinity Canvas showing real-time audio generation
- **Trust Indicators**: "Powered by SGLang • 29% faster than competitors"

**Key Message**: Fast + Accurate + Easy

---

### Section 2: Interactive Demo (Live TTS Playground)

**Purpose**: Let users experience the product immediately (highest conversion driver)

**Elements**:
- **Text Input Box**: Pre-filled with sample text containing:
  - Brand names: "Tesla", "Kubernetes"
  - Technical terms: "API", "PostgreSQL"
  - Multi-language: Chinese + English mixed
- **Pronunciation Dictionary Panel**: Show real-time pronunciation corrections
- **Audio Waveform Visualization**: Display as audio generates (streaming)
- **Download Button**: Allow users to download generated audio
- **API Code Snippet**: Show 3-line API call example
  ```python
  from aimake import TTS
  audio = TTS.synthesize("Hello world", dict="custom")
  audio.save("output.mp3")
  ```

**Why This Works**:
- Per research, "AI chatbot pages convert better when users can test responses"
- Removes friction - no signup required for first test
- Showcases pronunciation dictionary (unique selling point)

---

### Section 3: Problem/Solution

**Purpose**: Establish pain points and position aimake.cc as the solution

**Layout**: Split-screen comparison

| ❌ Old Way | ✅ With aimake.cc |
|------------|------------------|
| Generic TTS mispronounces brand names | Custom pronunciation dictionary |
| Slow inference (3-5 seconds) | SGLang = 29% faster (< 800ms) |
| Complex multi-tool workflows | Infinity Canvas = All-in-one |
| Expensive APIs ($0.30/1K chars) | Pay-as-you-go ($0.10/1K chars) |

**Visual**: Side-by-side audio waveforms showing quality difference

---

### Section 4: Key Features (The "How")

**Purpose**: Deep-dive into 3 core differentiators

#### Feature 1: Pronunciation Dictionary
- **Icon**: 📖
- **Title**: "Never Mispronounce Again"
- **Description**: "Upload your brand glossary. Fix multi-language terms. Hear corrections in real-time."
- **Visual**: Animated GIF showing:
  1. User types "特斯拉" (Tesla in Chinese)
  2. System auto-corrects pronunciation
  3. Audio plays with perfect accent
- **CTA**: "See Example"

#### Feature 2: Infinity Canvas
- **Icon**: 🎨
- **Title**: "Create Like You Design"
- **Description**: "Drag, compare, iterate. Your audio workflow, visualized."
- **Visual**: Interactive canvas mockup with draggable cards
- **CTA**: "Try Canvas" (open in modal)

#### Feature 3: Lightning Fast Inference
- **Icon**: ⚡
- **Title**: "29% Faster Than The Rest"
- **Description**: "Powered by SGLang on L40 GPUs. Stream audio as you type."
- **Visual**: Performance comparison chart:
  - aimake.cc: 542ms
  - Competitor A: 780ms
  - Competitor B: 1,200ms
- **CTA**: "Read Benchmark"

---

### Section 5: Use Cases

**Purpose**: Help users visualize how they'll use the product

**Layout**: 3-column grid

| 🎓 Education | 🛍️ E-commerce | 🎥 Content Creation |
|--------------|---------------|---------------------|
| Multi-language course narration | Product demo videos | Podcast automation |
| Pronunciation training | Brand-accurate ads | YouTube voiceovers |
| Accessible learning materials | Localized marketing | Social media clips |

**CTA per column**: "See [Use Case] Example"

---

### Section 6: Social Proof

**Purpose**: Build trust through testimonials and metrics

**Elements**:
- **Usage Stats** (counter animation):
  - "2.5M+ Hours Generated"
  - "1,200+ Pronunciation Dictionaries"
  - "43 Languages Supported"
- **Testimonials** (carousel):
  ```
  "Finally, a TTS that pronounces our product names correctly!"
  — Sarah Chen, CMO @ TechCorp
  ```
- **Logos**: "Trusted by" (placeholder companies)
- **Product Hunt Badge**: "#1 Product of the Day"

---

### Section 7: Pricing Teaser

**Purpose**: Show value without overwhelming (full pricing on separate page)

**Layout**: 3 cards (simplified)

| Free | Starter | Pro |
|------|---------|-----|
| $0/mo | $49/mo | $199/mo |
| 10 hours TTS | 50 hours | Unlimited |
| Basic voices | Custom dict | API access |
| | | Priority support |

**CTA**: "See All Plans" (link to /pricing)

---

### Section 8: API-First Approach

**Purpose**: Appeal to developers (based on user comment "TTS 调用API 就行")

**Elements**:
- **Headline**: "3 Lines. That's It."
- **Code Snippet** (syntax highlighted):
  ```bash
  curl -X POST https://api.aimake.cc/v1/tts \
    -H "Authorization: Bearer YOUR_KEY" \
    -d '{"text": "Hello world", "voice": "en-US-neural"}'
  ```
- **Language Tabs**: Python, JavaScript, cURL, Go
- **Features List**:
  - ✅ RESTful API
  - ✅ WebSocket streaming
  - ✅ 99.9% uptime SLA
  - ✅ Comprehensive docs
- **CTA**: "Get API Key"

---

### Section 9: Comparison Table

**Purpose**: Direct competitive comparison (build on "we're better" narrative)

| Feature | aimake.cc | ElevenLabs | Azure TTS | Google TTS |
|---------|-----------|------------|-----------|------------|
| **Custom Pronunciation** | ✅ Full dictionary | ⚠️ Limited | ❌ No | ❌ No |
| **Inference Speed (P95)** | **542ms** | 780ms | 1,200ms | 650ms |
| **Streaming** | ✅ WebSocket | ✅ | ❌ | ⚠️ Limited |
| **Infinity Canvas** | ✅ Unique | ❌ | ❌ | ❌ |
| **Pricing (1K chars)** | **$0.10** | $0.30 | $0.16 | $0.16 |

**Note**: Use checkmarks, warnings, and crosses for visual scanning

---

### Section 10: FAQ

**Purpose**: Address objections preemptively

**Format**: Accordion (collapsed by default)

**Questions**:
1. **How accurate is the pronunciation?**
   - "Our custom dictionary achieves 99.5% accuracy on brand names vs 87% industry average."
2. **Can I use my own voice?**
   - "Yes! Voice cloning available on Pro plan (6-second sample required)."
3. **What languages do you support?**
   - "43 languages including Chinese, English, Japanese, Korean, Spanish, and more."
4. **Is there a free trial?**
   - "Yes! 10 hours free every month. No credit card required."
5. **How do I integrate the API?**
   - "Check our [API docs](link). Most developers integrate in under 15 minutes."

---

### Section 11: Final CTA (Above Footer)

**Purpose**: Last chance to convert before exit

**Elements**:
- **Headline**: "Ready to Create Perfect Audio?"
- **Subheadline**: "Join 1,200+ teams using aimake.cc"
- **Primary CTA**: "Start Free Trial" (large button)
- **Secondary CTA**: "Talk to Sales" (for enterprise)
- **Trust Badge**: "No credit card required • Cancel anytime"

---

### Footer

**Columns**:
- **Product**: Features, Pricing, API Docs, Changelog
- **Resources**: Blog, Tutorials, Pronunciation Guide, Support
- **Company**: About, Careers, Contact, Privacy Policy
- **Social**: Twitter, Discord, GitHub, Product Hunt

---

## 🎨 Design System

### Color Palette

**Primary Colors**:
- **Brand Purple**: `#8B5CF6` (vibrant, modern)
- **Accent Blue**: `#3B82F6` (trust, technology)
- **Success Green**: `#10B981` (checkmarks, positive states)

**Neutrals**:
- **Dark**: `#0F172A` (text, headers)
- **Gray**: `#64748B` (body text)
- **Light Gray**: `#F1F5F9` (backgrounds)
- **White**: `#FFFFFF`

**Semantic Colors**:
- **Error**: `#EF4444`
- **Warning**: `#F59E0B`
- **Info**: `#06B6D4`

### Typography

**Headings**: Inter (Google Fonts)
- H1: 56px / Bold / -2% tracking
- H2: 40px / Bold / -1% tracking
- H3: 32px / SemiBold / 0% tracking

**Body**: Inter (Google Fonts)
- Large: 18px / Regular / 150% line-height
- Normal: 16px / Regular / 160% line-height
- Small: 14px / Regular / 140% line-height

**Code**: JetBrains Mono
- Inline: 14px / Medium
- Block: 13px / Regular

### Spacing

**Scale**: 4px base unit (Tailwind default)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

### Components

#### Buttons

**Primary**:
```css
bg-purple-600 hover:bg-purple-700 text-white
rounded-lg px-6 py-3 font-semibold
shadow-lg hover:shadow-xl transition-all
```

**Secondary**:
```css
bg-white hover:bg-gray-50 text-purple-600
border-2 border-purple-600 rounded-lg px-6 py-3
```

**Ghost**:
```css
bg-transparent hover:bg-purple-50 text-purple-600
rounded-lg px-4 py-2
```

#### Cards

```css
bg-white rounded-xl shadow-md hover:shadow-lg
border border-gray-200 p-6 transition-all
```

#### Input Fields

```css
border border-gray-300 rounded-lg px-4 py-3
focus:border-purple-500 focus:ring-2 focus:ring-purple-200
```

---

## 🎬 Animations & Interactions

### Micro-interactions

1. **Waveform Visualization**: Canvas API animation synced with audio
2. **Typing Effect**: Hero headline types out on load
3. **Counter Animation**: Stats count up on scroll into view
4. **Card Hover**: Subtle lift + shadow increase
5. **Button Ripple**: Material Design ripple on click

### Scroll Animations

- **Fade In Up**: Sections fade in as user scrolls
- **Parallax**: Hero background moves slower than foreground
- **Sticky Nav**: Navigation bar becomes sticky after hero

### Loading States

- **Skeleton Screens**: While fetching audio
- **Progress Bar**: During audio generation
- **Shimmer Effect**: On cards/images loading

---

## 📱 Responsive Design

### Breakpoints (Tailwind)

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations

- **Hero**: Stack headline above visual
- **Features**: 1-column grid
- **Code Snippets**: Horizontal scroll
- **Comparison Table**: Scroll horizontally
- **CTA Buttons**: Full-width on mobile

---

## 🚀 Performance Targets

- **Lighthouse Score**: > 95
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 3s
- **Total Bundle Size**: < 300KB (before images)

### Optimization Strategies

1. **Images**: WebP format + lazy loading
2. **CSS**: Inline critical CSS, defer rest
3. **JS**: Code splitting, load demo on interaction
4. **Fonts**: Subset fonts, preload critical fonts
5. **CDN**: Serve static assets from Cloudflare

---

## 🧪 A/B Testing Ideas

### Test 1: Headline Variations
- **A**: "Create Perfect Audio in Seconds"
- **B**: "AI Text-to-Speech That Actually Sounds Right"
- **Hypothesis**: B is more specific about pain point

### Test 2: CTA Copy
- **A**: "Try It Free"
- **B**: "Generate Your First Audio"
- **Hypothesis**: B is more action-oriented

### Test 3: Hero Visual
- **A**: Animated canvas
- **B**: Product screenshot + metrics
- **Hypothesis**: B provides more immediate clarity

### Test 4: Pricing Display
- **A**: Show pricing teaser on homepage
- **B**: Hide pricing, focus on demo
- **Hypothesis**: A reduces sticker shock early

---

## 📊 Conversion Funnel

### Tracking Events (Google Analytics 4)

1. **Page View**: Landing page loaded
2. **Demo Started**: User clicked interactive demo
3. **Audio Generated**: User successfully created audio
4. **Audio Downloaded**: User downloaded sample
5. **Signup Clicked**: User clicked "Start Free Trial"
6. **Signup Completed**: User created account
7. **API Key Generated**: User created API key

### Key Metrics

- **Bounce Rate**: Target < 40%
- **Time on Page**: Target > 2 minutes
- **Demo Engagement**: Target > 30% of visitors
- **Signup Conversion**: Target 8-12% (industry standard: 5-7%)

---

## 🔗 CTAs Hierarchy

### Primary CTAs (purple buttons)
1. Hero: "Try It Free"
2. After Demo: "Create Free Account"
3. Final CTA: "Start Free Trial"

### Secondary CTAs (ghost/text links)
1. Hero: "See How It Works" (anchor scroll)
2. Features: "Read Benchmark"
3. Pricing: "See All Plans"
4. API: "View Documentation"

### Tertiary CTAs
1. Footer: "Talk to Sales"
2. Nav: "Sign In" (existing users)

---

## 🌐 SEO Optimization

### Meta Tags

```html
<title>aimake.cc - AI Text-to-Speech with Perfect Pronunciation</title>
<meta name="description" content="Create professional audio with AI-powered TTS. Custom pronunciation dictionary ensures brand names and technical terms sound perfect. 29% faster than competitors.">
<meta name="keywords" content="TTS, text to speech, AI voice, pronunciation, audio generation, SGLang">
```

### Open Graph

```html
<meta property="og:title" content="aimake.cc - AI Text-to-Speech with Perfect Pronunciation">
<meta property="og:description" content="Create professional audio in seconds. Try our interactive demo.">
<meta property="og:image" content="https://aimake.cc/og-image.png">
<meta property="og:url" content="https://aimake.cc">
```

### Structured Data (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "aimake.cc",
  "applicationCategory": "MultimediaApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

---

## ✅ Pre-Launch Checklist

### Design
- [ ] All sections designed and approved
- [ ] Mobile responsive tested on real devices
- [ ] Cross-browser tested (Chrome, Safari, Firefox)
- [ ] Accessibility audit (WCAG 2.1 AA)

### Content
- [ ] Copy reviewed and edited
- [ ] Legal disclaimers added
- [ ] Privacy Policy linked
- [ ] Terms of Service linked

### Technical
- [ ] Lighthouse score > 95
- [ ] Analytics tracking implemented
- [ ] Error tracking (Sentry) configured
- [ ] Demo API connected and tested

### Marketing
- [ ] Product Hunt launch scheduled
- [ ] Social share images created
- [ ] Email capture form working
- [ ] Referral tracking parameters set

---

## 📚 References & Inspiration

Based on research, the following patterns work best:

1. **Immediate Demo**: Per research, letting users test the product immediately is the #1 conversion driver
2. **Clear Differentiation**: Show comparison table early (avoid vague claims)
3. **Trust Building**: Display metrics, testimonials, and technology indicators
4. **Low Friction**: No signup required for first test
5. **Developer-Friendly**: Prominent API documentation and code examples

**Key Sources**:
- [Best AI SaaS Landing Pages 2026](https://grooic.com/blog/best-ai-saas-landing-page-examples)
- [SaaS Landing Page Best Practices](https://fibr.ai/landing-page/saas-landing-pages)
- [High-Converting AI Landing Pages](https://www.devolfs.com/resources/20-high-converting-ai-saas-landing-pages)

---

**Next Steps**: Build HTML prototype using TailwindCSS based on this design
