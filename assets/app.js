(() => {
  'use strict';

  if (!window.MelatoAI) throw new Error('MelatoAI widget engine was not loaded.');

  const log = document.getElementById('demo-log');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const quick = document.getElementById('quick-replies');
  const voiceButton = document.getElementById('voice-button');
  const emailName = document.getElementById('email-name');
  const emailInquiry = document.getElementById('email-inquiry');
  const emailSubject = document.getElementById('email-subject');
  const emailBody = document.getElementById('email-body');
  const draftButton = document.getElementById('draft-email');
  const copyButton = document.getElementById('copy-email');

  function addMessage(text, role, cta) {
    const bubble = document.createElement('div');
    bubble.className = `msg ${role}`;
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

  function submit(message) {
    const text = String(message || input.value || '').trim();
    if (!text) return null;
    addMessage(text, 'user');
    input.value = '';
    const result = window.MelatoAI.ask(text, { channel: 'dashboard' });
    addMessage(result.answer, 'bot', result.cta);
    return result;
  }

  window.MelatoAI.ask('').quickReplies.forEach(label => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.textContent = label;
    chip.addEventListener('click', () => submit(label));
    quick.appendChild(chip);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    submit();
  });

  draftButton.addEventListener('click', () => {
    const draft = window.MelatoAI.draftEmail(emailInquiry.value, emailName.value.trim());
    emailSubject.value = draft.subject;
    emailBody.value = draft.body;
  });

  copyButton.addEventListener('click', async () => {
    const text = `Subject: ${emailSubject.value}\n\n${emailBody.value}`;
    await navigator.clipboard.writeText(text);
    copyButton.textContent = 'Copied';
    setTimeout(() => { copyButton.textContent = 'Copy email'; }, 1200);
  });

  voiceButton.addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage('Voice recognition is not available in this browser. Type the inquiry instead.', 'bot');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-CA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      const result = submit(transcript);
      if (result) window.MelatoAI.speak(result.answer);
    };
    recognition.onerror = () => addMessage('I could not catch that clearly. Try again or type it in.', 'bot');
    recognition.start();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }

  addMessage(window.MelatoAI.config.greeting, 'bot');
})();
