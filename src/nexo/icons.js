/*
 * NEXO system emblems: planet and orbit for Traveller, d20 for D&D, ankh for Vampiro,
 * a sphere holding a gem of Stormlight for El Archivo de las Tormentas,
 * the Elder Sign (a star with a burning eye) for La llamada de Cthulhu,
 * and a wayfinder (a pendant compass with its needle) for Pathfinder.
 * Line art drawn with currentColor so each module tints them with its own palette.
 */
(() => {
  const svg = body => `<svg class="nexo-emblem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  window.NEXO_ICONS = {
    traveller: svg('<circle cx="12" cy="12" r="5.5"/><path d="M7.2 10.4c3 .9 6.6.9 9.6 0"/><ellipse cx="12" cy="12" rx="10.5" ry="3.4" transform="rotate(-24 12 12)"/><circle cx="20.6" cy="7.4" r="1.1" fill="currentColor" stroke="none"/>'),
    dnd: svg('<path d="M12 2 21 7v10l-9 5-9-5V7Z"/><path d="M12 7l5.5 9h-11Z"/><path d="M12 2v5M3 7l9 0M21 7h-9M3 7l3.5 9M21 7l-3.5 9M3 17l3.5-1M21 17l-3.5-1M12 22l-5.5-6M12 22l5.5-6"/>'),
    tormentas: svg('<circle cx="12" cy="12" r="6.5"/><path d="M12 8.3 15 12l-3 3.7L9 12Z" fill="currentColor" fill-opacity=".35"/><path d="M3.6 6.4c1.6.2 2.6 1.1 3 2.6M20.4 17.6c-1.6-.2-2.6-1.1-3-2.6M17.8 3.4l-1 1.9M6.2 20.6l1-1.9M21 9.4l-2.2.5M3 14.6l2.2-.5"/>'),
    cthulhu: svg('<path d="M12 2.2 14.6 9.3H21.9L16 13.7 18.2 21 12 16.6 5.8 21 8 13.7 2.1 9.3H9.4Z"/><path d="M9.3 12.4c1.6-1.7 3.8-1.7 5.4 0-1.6 1.7-3.8 1.7-5.4 0Z"/><circle cx="12" cy="12.4" r=".9" fill="currentColor" stroke="none"/><path d="M12 10.2c-.5-.8-.3-1.6.2-2.2"/>'),
    pathfinder: svg('<circle cx="12" cy="13.4" r="7.6"/><path d="M10.6 5.9a1.6 1.6 0 1 1 2.8 0"/><path d="M15.4 8.4 13 14.4 8.6 18.4 11 12.4Z" fill="currentColor" fill-opacity=".3"/><circle cx="12" cy="13.4" r="1" fill="currentColor" stroke="none"/><path d="M12 6.7v1.2M12 18.9v1.2M4.9 13.4h1.2M17.9 13.4h1.2"/>'),
    vampire: svg('<ellipse cx="11" cy="6.6" rx="3.1" ry="4"/><path d="M11 10.6V22M5 13.2h12"/><path d="M18.4 15.2c1.1 1.5 1.7 2.4 1.7 3.1a1.7 1.7 0 0 1-3.4 0c0-.7.6-1.6 1.7-3.1Z" fill="currentColor"/>')
  };
})();
