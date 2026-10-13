/* Shared simple outline icons for Greenhouse IoT. */
(function () {
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    chart: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 16v-4M12 16V7M17 16v-7"/>',
    droplet: '<path d="M12 3s-6.5 7-6.5 11a6.5 6.5 0 0 0 13 0C18.5 10 12 3 12 3Z"/><path d="M9 15.5a3.4 3.4 0 0 0 3.2 2.3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    history: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    chip: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    leaf: '<path d="M20 4c-8 0-14 3.5-14 10a6 6 0 0 0 6 6c6.5 0 8-8 8-16Z"/><path d="M4 21c3-5 6-8 12-12"/>',
    link: '<path d="m10 13 4-4"/><path d="M8.5 15.5 6 18a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M15.5 8.5 18 6a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0" transform="translate(1 0) scale(.95)"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 3.1-.2-.1a1.7 1.7 0 0 0-1.9.3 1.7 1.7 0 0 0-.7 1.4v.3H8.8v-.3a1.7 1.7 0 0 0-2.6-1.4l-.2.1-1.8-3.1.1-.1A1.7 1.7 0 0 0 4 15l-.2-.1v-3.8L4 11a1.7 1.7 0 0 0 .3-1.9l-.1-.2L6 5.8l.2.1a1.7 1.7 0 0 0 1.9-.3 1.7 1.7 0 0 0 .7-1.4v-.3h3.6v.3a1.7 1.7 0 0 0 2.6 1.4l.2-.1 1.8 3.1-.1.2a1.7 1.7 0 0 0-.3 1.9l.2.1v3.8Z" transform="translate(0 -1) scale(1 .98)"/>',
    water: '<path d="M3 5h10a5 5 0 0 1 5 5v2h-4v-2a1 1 0 0 0-1-1H3Z"/><path d="M14 12h7v4h-7zM17 19v1M20 19v1"/>',
    valve: '<path d="M4 6h16v12H4z"/><path d="M4 6l8 6 8-6M4 18l8-6 8 6M12 2v4M12 18v4"/>',
    pipe: '<path d="M4 4h8a5 5 0 0 1 5 5v3h3v5h-8v-8a1 1 0 0 0-1-1H4Z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    cloud: '<path d="M6 18h11a4 4 0 0 0 .4-8A6 6 0 0 0 6 11.5 3.3 3.3 0 0 0 6 18Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    'cloud-sun': '<circle cx="8" cy="7" r="3"/><path d="M8 2v1M2.5 7H4M4.1 3.1l1 1M9.8 4.2l1-1"/><path d="M7 19h10a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.5A2.8 2.8 0 0 0 7 19Z"/>',
    'cloud-fog': '<path d="M6 15h11a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.5A2.8 2.8 0 0 0 6 15Z"/><path d="M4 18h13M7 21h11"/>',
    'cloud-drizzle': '<path d="M6 14h11a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.5A2.8 2.8 0 0 0 6 14Z"/><path d="m9 17-1 2M14 17l-1 2M19 17l-1 2"/>',
    'cloud-rain': '<path d="M6 13h11a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.5A2.8 2.8 0 0 0 6 13Z"/><path d="m8 16-1 3M13 16l-1 3M18 16l-1 3"/>',
    'cloud-lightning': '<path d="M6 13h11a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.5A2.8 2.8 0 0 0 6 13Z"/><path d="m13 14-3 5h3l-1 3 5-6h-3l1-2"/>',
    hand: '<path d="M8 12V6a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-5a1.5 1.5 0 0 1 3 0v7-3a1.5 1.5 0 0 1 3 0v5c0 4-2.5 7-6.5 7h-1.5c-2 0-3.2-.9-4.5-2.3L5 16a1.8 1.8 0 0 1 2.5-2.5L8 14"/>',
    waterdrop: '<path d="M12 3s-6 6.5-6 10.5a6 6 0 0 0 12 0C18 9.5 12 3 12 3Z"/><path d="M9 15a3 3 0 0 0 3 2.5"/>'
  };
  function svg(name, size) {
    const path = paths[name] || paths.droplet;
    const n = Number(size) || 22;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
  }
  function weatherName(code) {
    if (code === 0) return 'sun';
    if (code === 1 || code === 2) return 'cloud-sun';
    if (code === 3) return 'cloud';
    if (code === 45 || code === 48) return 'cloud-fog';
    if ([51,53,55].includes(code)) return 'cloud-drizzle';
    if ([61,63,65,80,81].includes(code)) return 'cloud-rain';
    if ([82,95,96,99].includes(code)) return 'cloud-lightning';
    return 'cloud-sun';
  }
  function setWeatherIcon(id, code) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) el.innerHTML = svg(weatherName(Number(code)), 42);
  }
  function init() {
    document.querySelectorAll('[data-icon]').forEach(el => {
      const name = el.getAttribute('data-icon');
      const size = el.getAttribute('data-icon-size') || (el.classList.contains('nav-icon') ? 22 : 20);
      el.innerHTML = svg(name, size);
    });
    document.querySelectorAll('[data-weather-icon]').forEach(el => {
      if (!el.firstElementChild) el.innerHTML = svg('cloud-sun', 42);
    });
  }
  window.GreenhouseIcons = { svg, setWeatherIcon, weatherName };
  init();
})();
