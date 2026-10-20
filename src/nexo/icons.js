/*
 * NEXO system emblems: planet and orbit for Traveller, d20 for D&D, ankh for Vampiro.
 * Line art drawn with currentColor so each module tints them with its own palette.
 */
(() => {
  const svg = body => `<svg class="nexo-emblem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  window.NEXO_ICONS = {
    traveller: svg('<circle cx="12" cy="12" r="5.5"/><path d="M7.2 10.4c3 .9 6.6.9 9.6 0"/><ellipse cx="12" cy="12" rx="10.5" ry="3.4" transform="rotate(-24 12 12)"/><circle cx="20.6" cy="7.4" r="1.1" fill="currentColor" stroke="none"/>'),
    dnd: svg('<path d="M12 2 21 7v10l-9 5-9-5V7Z"/><path d="M12 7l5.5 9h-11Z"/><path d="M12 2v5M3 7l9 0M21 7h-9M3 7l3.5 9M21 7l-3.5 9M3 17l3.5-1M21 17l-3.5-1M12 22l-5.5-6M12 22l5.5-6"/>'),
    vampire: svg('<ellipse cx="11" cy="6.6" rx="3.1" ry="4"/><path d="M11 10.6V22M5 13.2h12"/><path d="M18.4 15.2c1.1 1.5 1.7 2.4 1.7 3.1a1.7 1.7 0 0 1-3.4 0c0-.7.6-1.6 1.7-3.1Z" fill="currentColor"/>')
  };
})();
