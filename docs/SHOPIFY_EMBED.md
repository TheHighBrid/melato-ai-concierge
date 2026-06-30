# Shopify embed

The production widget is:

```text
embed/melato-concierge-widget.js
```

## Theme script install

Add before `</body>` in `layout/theme.liquid`:

```liquid
<script src="https://thehighbrid.github.io/melato-ai-concierge/embed/melato-concierge-widget.js" defer></script>
```

## Shopify section install

Create this Shopify theme section:

```text
sections/melato-ai-concierge-section.liquid
```

Paste the file from:

```text
shopify/melato-ai-concierge-section.liquid
```

Then set the GitHub Pages script URL in the theme editor.

## Notes

- The widget does not use paid APIs.
- It does not read Shopify order data.
- Order-specific questions are routed to Melato order support with order number + checkout email.
- For live order lookup later, connect a secure backend to Shopify Admin API.
- Never expose Shopify Admin API tokens in browser JavaScript.
