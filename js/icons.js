/* Line icon set — stroke-based, inherits currentColor */
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.2 12 3.5l9 6.7V20a1.2 1.2 0 0 1-1.2 1.2H4.2A1.2 1.2 0 0 1 3 20z"/><path d="M9.2 21.2v-6.4h5.6v6.4"/></svg>',

  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.2" y="3.2" width="7.4" height="7.4" rx="2.2"/><rect x="13.4" y="3.2" width="7.4" height="7.4" rx="2.2"/><rect x="3.2" y="13.4" width="7.4" height="7.4" rx="2.2"/><rect x="13.4" y="13.4" width="7.4" height="7.4" rx="2.2"/></svg>',

  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.5" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3h2.6l2.3 11.2a1.6 1.6 0 0 0 1.6 1.3h8.7a1.6 1.6 0 0 0 1.6-1.3L21 7H6"/></svg>',

  receipt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 2.8h13a1 1 0 0 1 1 1v17.4l-3-1.8-2.5 1.8-2.5-1.8-2.5 1.8-3-1.8V3.8a1 1 0 0 1 1-1z"/><path d="M9 8h6M9 12h6"/></svg>',

  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4.2"/><path d="M4.5 21c0-3.9 3.4-6.5 7.5-6.5s7.5 2.6 7.5 6.5"/></svg>',

  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.3-4.3"/></svg>',

  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.3 4.4 13a4.8 4.8 0 0 1 0-6.9 4.9 4.9 0 0 1 7 0L12 7l.6-.9a4.9 4.9 0 0 1 7 0 4.8 4.8 0 0 1 0 6.9z"/></svg>',

  heartFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 20.3 4.4 13a4.8 4.8 0 0 1 0-6.9 4.9 4.9 0 0 1 7 0L12 7l.6-.9a4.9 4.9 0 0 1 7 0 4.8 4.8 0 0 1 0 6.9z"/></svg>',

  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5 7.5 12l7.5 7.5"/></svg>',

  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5.5 12h13"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5.5v13M5.5 12h13"/></svg>',

  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20c0-8 5.5-14 16-14 0 10-5.5 14-11 14a5 5 0 0 1-5-5z"/><path d="M4.5 19.5C8 16 12 13 16.5 10.5"/></svg>',

  blossom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.4"/><path d="M12 9.6c0-3 1-4.6 0-6.4-1 1.8 0 3.4 0 6.4zM14.4 12c3 0 4.6 1 6.4 0-1.8-1-3.4 0-6.4 0zM12 14.4c0 3-1 4.6 0 6.4 1-1.8 0-3.4 0-6.4zM9.6 12c-3 0-4.6-1-6.4 0 1.8 1 3.4 0 6.4 0z"/><path d="M13.9 10.1c2.1-2.1 3.8-2.7 4.4-4.7-2 .6-2.6 2.3-4.4 4.7zM13.9 13.9c2.1 2.1 2.7 3.8 4.7 4.4-.6-2-2.3-2.6-4.7-4.4zM10.1 13.9c-2.1 2.1-3.8 2.7-4.4 4.7 2-.6 2.6-2.3 4.4-4.7zM10.1 10.1C8 8 7.4 6.3 5.4 5.7c.6 2 2.3 2.6 4.7 4.4z"/></svg>',

  bouquet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="6.5" r="2.6"/><circle cx="16" cy="6.5" r="2.6"/><circle cx="12" cy="4.6" r="2.6"/><path d="M8.4 9.1 10.8 14M15.6 9.1 13.2 14M12 7.2V14"/><path d="M8.6 14h6.8l-1.5 6.4a1.3 1.3 0 0 1-1.3 1h-1.2a1.3 1.3 0 0 1-1.3-1z"/></svg>',

  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3.8 6h16.4M9 6V4.2a1.2 1.2 0 0 1 1.2-1.2h3.6A1.2 1.2 0 0 1 15 4.2V6"/><path d="M5.8 6h12.4l-.9 13.1a1.6 1.6 0 0 1-1.6 1.5H8.3a1.6 1.6 0 0 1-1.6-1.5z"/><path d="M10.2 10.5v5.8M13.8 10.5v5.8"/></svg>',

  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19.3 8.7a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16z"/></svg>',

  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>',

  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>',

  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16.5v2.8a1.8 1.8 0 0 1-2 1.8 17.6 17.6 0 0 1-7.7-2.7 17.3 17.3 0 0 1-5.3-5.3A17.6 17.6 0 0 1 3.3 5.3 1.8 1.8 0 0 1 5.1 3.3h2.8a1.8 1.8 0 0 1 1.8 1.6 11.2 11.2 0 0 0 .6 2.5 1.8 1.8 0 0 1-.4 1.9l-1.2 1.2a14 14 0 0 0 5.3 5.3l1.2-1.2a1.8 1.8 0 0 1 1.9-.4 11.2 11.2 0 0 0 2.5.6 1.8 1.8 0 0 1 1.6 1.8z"/></svg>',

  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M12 11v5.5M12 7.8h.01"/></svg>',

  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 8.2v7.6a1.6 1.6 0 0 1-.8 1.4l-6.9 3.9a1.6 1.6 0 0 1-1.6 0l-6.9-3.9a1.6 1.6 0 0 1-.8-1.4V8.2a1.6 1.6 0 0 1 .8-1.4l6.9-3.9a1.6 1.6 0 0 1 1.6 0l6.9 3.9a1.6 1.6 0 0 1 .8 1.4z"/><path d="m3.8 7.4 8.2 4.7 8.2-4.7M12 21v-8.9"/></svg>',

  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4 16.5v2.6a1.4 1.4 0 0 0 1.4 1.4h13.2a1.4 1.4 0 0 0 1.4-1.4v-2.6"/></svg>',

  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.8 4.2v5h-5"/></svg>',

  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.5s7-5.6 7-11.1a7 7 0 1 0-14 0c0 5.5 7 11.1 7 11.1z"/><circle cx="12" cy="10.2" r="2.7"/></svg>',

  /* Saudi emblem — palm over crossed swords */
  saudi: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c.5 1.3.7 2.6.6 3.9.7-.8 1.6-1.4 2.6-1.7-.6.9-1 1.9-1.1 3 .9-.5 1.9-.8 2.9-.8-.9.7-1.6 1.5-2.1 2.5 1-.1 2 0 2.9.4-1.1.3-2 .8-2.8 1.6h-1.7v2.3h-1.8v-2.3H9.8c-.8-.8-1.7-1.3-2.8-1.6.9-.4 1.9-.5 2.9-.4-.5-1-1.2-1.8-2.1-2.5 1 0 2 .3 2.9.8-.1-1.1-.5-2.1-1.1-3 1 .3 1.9.9 2.6 1.7-.1-1.3.1-2.6.6-3.9z"/><path d="M3.4 16.1c.3-.5.9-.7 1.4-.4l13.4 3.6c.6.2 1 .8.8 1.4-.2.6-.8.9-1.4.7L4.1 17.6c-.5-.2-.9-.8-.7-1.5z" opacity=".9"/><path d="M20.6 16.1c-.3-.5-.9-.7-1.4-.4L5.8 19.3c-.6.2-1 .8-.8 1.4.2.6.8.9 1.4.7l13.5-3.8c.5-.2.9-.8.7-1.5z" opacity=".9"/></svg>'
};

function icon(name, cls = '') {
  return `<span class="ic ${cls}" aria-hidden="true">${ICONS[name] || ''}</span>`;
}
