# Melato AI Concierge

Zero-cost Melato customer service agent for website chat, website inquiries, email reply drafting, browser voice mode, PWA install, Shopify embed, and Android APK export.

This first version does **not** use a paid AI API. It is a deterministic brand-trained concierge built from Melato's support policies, product language, delivery rules, and premium client-care tone.

## What it does

- Floating website chat widget through `embed/melato-concierge-widget.js`
- Customer inquiry dashboard in `index.html`
- Email reply drafting for order, fit, return, delivery, product, and general inquiries
- Browser voice mode using Web Speech API where supported
- PWA install support through `manifest.webmanifest` and `service-worker.js`
- GitHub Pages deployment workflow
- Android debug APK workflow through Capacitor
- Shopify section install option

## Core support rules

- Complimentary delivery on all orders
- Orders usually prepare within 1 to 3 business days
- Order-specific support requires order number and checkout email
- Returns must follow the posted policy and require unworn, unwashed, tagged items
- The agent never pretends to see live order data
- The agent routes sensitive or account-specific requests to Melato support

## Project structure

```text
index.html                                  Demo/support dashboard
embed/melato-concierge-widget.js            Production Shopify/web widget
assets/app.css                              Dashboard styling
assets/app.js                               Dashboard controller
service-worker.js                           PWA cache
manifest.webmanifest                        PWA manifest
shopify/melato-ai-concierge-section.liquid  Shopify section install option
.github/workflows/pages.yml                 GitHub Pages deployment
.github/workflows/android-debug-apk.yml     Android debug APK build
capacitor.config.json                       Capacitor Android config
scripts/build.js                            Static build script
docs/SHOPIFY_EMBED.md                       Shopify install notes
docs/ROADMAP.md                             Build roadmap
```

## Local test

```bash
npm install
npm run check
npm run build
npm start
```

## Shopify embed

After GitHub Pages deploys, add this before `</body>` in Shopify `layout/theme.liquid`:

```liquid
<script src="https://thehighbrid.github.io/melato-ai-concierge/embed/melato-concierge-widget.js" defer></script>
```

Or use `shopify/melato-ai-concierge-section.liquid` as a Shopify section.

## Android APK

Run the GitHub Action named **Build Android Debug APK**. It builds the PWA through Capacitor and uploads a debug APK artifact.

## Hard truth

A real phone-number agent needs a telephony provider such as Twilio, Telnyx, Vonage, or a helpdesk phone integration. That part is not truly $0. The free MVP uses browser voice mode instead.

## Brand behavior

The concierge should sound composed, premium, direct, helpful, and culturally aware. No fake urgency. No fast-fashion filler. No pretending to access private order data.
