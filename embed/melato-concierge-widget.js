(() => {
  'use strict';

  const CONFIG = {
    brand: 'Melato',
    site: 'https://melato.ca',
    supportEmail: 'support@melato.ca',
    orderEmail: 'orders@melato.ca',
    greeting: 'Welcome to Melato. I can help with sizing, delivery, returns, product guidance, order support, and drop questions.',
    quickReplies: ['Track my order', 'Help me choose a size', 'Delivery policy', 'Return policy', 'Recommend a product', 'Care instructions']
  };

  const PRODUCTS = [
    'Divididos Velour Track Jacket', 'Divididos Velour Track Pant', 'CHŪ Velour Track Jacket', 'CHŪ Velour Track Pant',
    'Conquista Velour Track Jacket', 'Conquista Velour Track Pant', 'Reliance Velour Track Jacket', 'Reliance Velour Track Pants',
    'OJOS Velour Track Jacket', 'Midas Runner Velour Track Jacket', 'OVUM Satin Track Jacket', 'OVUM Satin Track Pant',
    'Vision Moto Jacket', 'Vision Motion Flare Track Pants', 'Atlas Woven Duffle', 'Atlas Dopp Kit',
    'Noir Traffic Zip Wide Jean', 'Barolo Tweed Zip Overshirt', 'CasaNegra Leather Flare Zip Pants', 'Kech Leather Flare Zip Pants'
  ];

  const KNOWLEDGE = {
    delivery: 'Complimentary delivery is included on all Melato orders. Orders usually prepare within 1 to 3 business days before dispatch.',
    returns: 'Unworn, unwashed, tagged items may be eligible under the posted return policy. For any return request, include the order number, checkout email, item name, and reason so client care can review it cleanly.',
    order: 'I cannot access live Shopify order data from this browser widget. For order-specific help, email orders@melato.ca with your order number and checkout email, or reply to your confirmation email.',
    fit: 'Melato pieces are silhouette-led. Track jackets usually read best true to size for a clean designer fit, or one size up for a relaxed styling effect. Flare and wide-leg pants should be chosen by waist first, then desired drape and stack.',
    care: 'Wash cold inside out, close zippers before washing, avoid bleach, hang dry when possible, and avoid direct heat over embroidery, appliqué, zipper areas, or printed artwork.',
    brand: 'Melato is a design-led apparel brand built around premium silhouettes, cultural tension, limited-run energy, and pieces that feel intentional rather than disposable.',
    products: 'Melato focuses on tracksuits, denim, outerwear, womenswear, bags, ties, suspenders, and accessories. Strong starting points are a full velour set, a signature track jacket, an Atlas bag, or a wide-leg denim piece.'
  };

  const INTENTS = [
    { key: 'order', words: ['order','tracking','track','where is','shipped','shipment','confirmation','package','delivered','lost'] },
    { key: 'delivery', words: ['delivery','shipping','ship','deliver','free shipping','complimentary','arrival','dispatch'] },
    { key: 'returns', words: ['return','refund','exchange','wrong size','cancel','damaged','policy'] },
    { key: 'fit', words: ['size','fit','sizing','measure','measurement','small','large','medium','true to size','oversized'] },
    { key: 'care', words: ['wash','care','clean','laundry','dry','iron','maintain'] },
    { key: 'products', words: ['recommend','suggest','product','jacket','pants','tracksuit','denim','bag','accessory','set','complete'] },
    { key: 'brand', words: ['melato','brand','about','story','special','premium','designer'] }
  ];

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9@.\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function detectIntent(message) {
    const text = normalize(message);
    for (const intent of INTENTS) {
      if (intent.words.some(word => text.includes(word))) return intent.key;
    }
    return 'general';
  }

  function productMatch(message) {
    const text = normalize(message);
    return PRODUCTS.filter(name => normalize(name).split(' ').some(part => part.length > 3 && text.includes(part))).slice(0, 4);
  }

  function answer(message, options = {}) {
    const intent = detectIntent(message);
    const matches = productMatch(message);
    let response = '';
    let cta = null;

    if (intent === 'order') {
      response = `${KNOWLEDGE.order}\n\nSend: order number, checkout email, and what changed. That keeps support fast and clean.`;
      cta = { label: 'Email order support', href: `mailto:${CONFIG.orderEmail}` };
    } else if (intent === 'delivery') {
      response = `${KNOWLEDGE.delivery}\n\nFor location-specific timing, use your tracking link once the order is dispatched.`;
    } else if (intent === 'returns') {
      response = `${KNOWLEDGE.returns}\n\nBest move: keep the item unworn and tagged until support confirms the next step.`;
      cta = { label: 'Email support', href: `mailto:${CONFIG.supportEmail}` };
    } else if (intent === 'fit') {
      response = `${KNOWLEDGE.fit}\n\nIf you are between sizes, tell me your height, usual size, and whether you want a clean fit or relaxed drape.`;
    } else if (intent === 'care') {
      response = KNOWLEDGE.care;
    } else if (intent === 'products') {
      response = `${KNOWLEDGE.products}\n\nFor a premium Melato uniform, start with a full velour set. For a sharper statement, pair a track jacket with wide denim or flare pants. For a quieter luxury move, add an Atlas bag or accessory.`;
      if (matches.length) response += `\n\nPieces I heard in your question: ${matches.join(', ')}.`;
      cta = { label: 'Shop Melato', href: CONFIG.site };
    } else if (intent === 'brand') {
      response = KNOWLEDGE.brand;
      cta = { label: 'Visit Melato', href: CONFIG.site };
    } else {
      response = `I can help with Melato delivery, sizing, returns, order support, product guidance, care instructions, and drop questions.\n\nAsk me naturally, like: “what size should I get?” or “how do I return an item?”`;
    }

    return { intent, answer: response, cta, quickReplies: CONFIG.quickReplies };
  }

  function draftEmail(inquiry, name = '') {
    const result = answer(inquiry, { channel: 'email' });
    const customer = name ? `Hi ${name},` : 'Hi,';
    const subjectMap = {
      order: 'Melato order support',
      delivery: 'Melato delivery information',
      returns: 'Melato return request',
      fit: 'Melato sizing guidance',
      care: 'Melato care instructions',
      products: 'Melato product guidance',
      brand: 'About Melato',
      general: 'Melato client care'
    };
    return {
      subject: subjectMap[result.intent] || 'Melato client care',
      body: `${customer}\n\nThank you for reaching out to Melato.\n\n${result.answer}\n\nIf this is about a specific order, please send the order number and checkout email so we can review it properly.\n\nMelato Client Care`
    };
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return false;
    const utterance = new SpeechSynthesisUtterance(String(text || '').replace(/\s+/g, ' '));
    utterance.lang = 'en-CA';
    utterance.rate = 0.96;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function createWidget() {
    if (document.getElementById('melato-ai-concierge')) return;

    const style = document.createElement('style');
    style.textContent = `
      #melato-ai-concierge{position:fixed;right:18px;bottom:18px;z-index:2147483000;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f7f2ef}
      .melato-ai-toggle{border:1px solid rgba(255,255,255,.16);background:#080808;color:#f7f2ef;border-radius:999px;padding:13px 16px;font-weight:900;letter-spacing:-.02em;box-shadow:0 18px 50px rgba(0,0,0,.32);cursor:pointer}
      .melato-ai-panel{display:none;width:min(390px,calc(100vw - 28px));height:min(620px,calc(100vh - 92px));margin-bottom:12px;border:1px solid rgba(255,255,255,.14);border-radius:26px;background:rgba(9,9,9,.96);box-shadow:0 24px 80px rgba(0,0,0,.45);overflow:hidden;backdrop-filter:blur(18px)}
      .melato-ai-panel.is-open{display:flex;flex-direction:column}.melato-ai-head{padding:18px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.melato-ai-head strong{font-size:16px}.melato-ai-head span{display:block;margin-top:4px;color:rgba(247,242,239,.64);font-size:12px;line-height:1.35}.melato-ai-close{background:transparent;color:#f7f2ef;border:0;font-size:22px;cursor:pointer}.melato-ai-log{flex:1;overflow:auto;padding:16px;background:radial-gradient(circle at 20% 0,rgba(255,177,153,.11),transparent 32%)}.melato-ai-msg{max-width:86%;white-space:pre-wrap;border-radius:17px;margin:0 0 10px;padding:11px 12px;font-size:13.5px;line-height:1.45}.melato-ai-msg.bot{background:#171717;border:1px solid rgba(255,255,255,.1);border-bottom-left-radius:5px}.melato-ai-msg.user{margin-left:auto;background:#f7f2ef;color:#080808;border-bottom-right-radius:5px}.melato-ai-msg a{color:#ffb199}.melato-ai-quick{display:flex;gap:7px;flex-wrap:wrap;padding:0 14px 12px}.melato-ai-chip{border:1px solid rgba(255,255,255,.12);background:#151515;color:#f7f2ef;border-radius:999px;padding:8px 10px;font-size:11.5px;cursor:pointer}.melato-ai-form{display:grid;grid-template-columns:1fr auto auto;gap:8px;padding:13px;border-top:1px solid rgba(255,255,255,.1)}.melato-ai-form input{min-width:0;border:1px solid rgba(255,255,255,.12);background:#070707;color:#f7f2ef;border-radius:999px;padding:12px 13px;outline:none}.melato-ai-form button{border:0;background:#f7f2ef;color:#080808;border-radius:999px;padding:0 12px;font-weight:900;cursor:pointer}@media(max-width:520px){#melato-ai-concierge{right:10px;bottom:10px}.melato-ai-panel{width:calc(100vw - 20px);height:calc(100vh - 86px)}}`;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = 'melato-ai-concierge';
    root.innerHTML = `
      <section class="melato-ai-panel" aria-label="Melato AI Concierge">
        <div class="melato-ai-head"><div><strong>Melato Concierge</strong><span>Fit, delivery, returns, products, and client care.</span></div><button class="melato-ai-close" aria-label="Close">×</button></div>
        <div class="melato-ai-log" aria-live="polite"></div>
        <div class="melato-ai-quick"></div>
        <form class="melato-ai-form"><input placeholder="Ask Melato..." autocomplete="off" /><button type="button" class="melato-ai-voice" aria-label="Voice input">🎙</button><button type="submit">Ask</button></form>
      </section>
      <button class="melato-ai-toggle">Ask Melato</button>`;
    document.body.appendChild(root);

    const panel = root.querySelector('.melato-ai-panel');
    const toggle = root.querySelector('.melato-ai-toggle');
    const close = root.querySelector('.melato-ai-close');
    const log = root.querySelector('.melato-ai-log');
    const form = root.querySelector('.melato-ai-form');
    const input = root.querySelector('input');
    const voice = root.querySelector('.melato-ai-voice');
    const quick = root.querySelector('.melato-ai-quick');

    function add(text, role, cta) {
      const bubble = document.createElement('div');
      bubble.className = `melato-ai-msg ${role}`;
      bubble.textContent = text;
      if (cta && cta.href) {
        const link = document.createElement('a');
        link.href = cta.href;
        link.textContent = cta.label || 'Open';
        link.target = '_blank';
        link.rel = 'noopener';
        bubble.appendChild(document.createElement('br'));
        bubble.appendChild(link);
      }
      log.appendChild(bubble);
      log.scrollTop = log.scrollHeight;
    }

    function submit(text) {
      const value = String(text || input.value || '').trim();
      if (!value) return;
      add(value, 'user');
      input.value = '';
      const result = answer(value, { channel: 'widget' });
      add(result.answer, 'bot', result.cta);
      return result;
    }

    CONFIG.quickReplies.forEach(label => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'melato-ai-chip';
      chip.textContent = label;
      chip.addEventListener('click', () => submit(label));
      quick.appendChild(chip);
    });

    toggle.addEventListener('click', () => panel.classList.toggle('is-open'));
    close.addEventListener('click', () => panel.classList.remove('is-open'));
    form.addEventListener('submit', event => { event.preventDefault(); submit(); });
    voice.addEventListener('click', () => {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) { add('Voice recognition is not available in this browser. Type the question instead.', 'bot'); return; }
      const recog = new Recognition();
      recog.lang = 'en-CA';
      recog.interimResults = false;
      recog.onresult = event => { const text = event.results[0][0].transcript; const result = submit(text); if (result) speak(result.answer); };
      recog.onerror = () => add('I could not catch that clearly. Try again or type it in.', 'bot');
      recog.start();
    });

    add(CONFIG.greeting, 'bot');
  }

  window.MelatoAI = { config: CONFIG, ask: answer, draftEmail, speak, createWidget };

  const current = document.currentScript;
  const auto = !current || current.dataset.auto !== 'false';
  if (auto) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createWidget);
    else createWidget();
  }
})();
