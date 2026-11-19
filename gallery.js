/* Gallery: builds the albums from gallery-data.js and shows a full-screen photo viewer.
   The viewer has arrows, a counter and a close button. It has no download button. */
(function () {
  var base = window.PHOTO_BASE || '';
  if (base && base.charAt(base.length - 1) !== '/') base += '/';
  var categories = window.CATEGORIES || [];
  var rawAlbums = window.ALBUMS || [];
  var root = document.getElementById('albums');
  var chipsBox = document.getElementById('albumChips');
  if (!root) return;

  // ImageKit can resize a photo by adding  tr:w-600/  after your address.
  // THUMB_TR is used for the small album covers, VIEW_TR for the full-screen viewer.
  // Leave them empty to show the photos exactly as uploaded.
  var thumbTr = window.THUMB_TR || '';
  var viewTr = window.VIEW_TR || '';

  function encodePath(path) {
    return String(path).split('/').map(encodeURIComponent).join('/');
  }

  function photoUrl(album, file, tr) {
    return base + (tr ? 'tr:' + tr + '/' : '') + encodePath(album.folder) + '/' + encodeURIComponent(file);
  }

  // Turn each album into a list of file names.
  var albums = rawAlbums.map(function (a) {
    var files = [];
    if (a.photos && a.photos.length) {
      files = a.photos.slice();
    } else if (a.count) {
      for (var i = 1; i <= a.count; i++) files.push(i + '.' + (a.ext || 'jpg'));
    }
    return { category: a.category, title: a.title, date: a.date, folder: a.folder, files: files, cover: a.cover || files[0] };
  }).filter(function (a) { return a.files.length > 0 && a.folder; });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- Page: categories and album cards ---------- */
  var lastOpener = null;

  function buildCard(album) {
    var card = el('button', 'album album-btn');
    card.type = 'button';
    var n = album.files.length;
    card.setAttribute('aria-label', 'Open album ' + album.title + ', ' + n + (n === 1 ? ' photo' : ' photos'));

    var frame = el('div', 'photo-frame');
    var img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.draggable = false;
    img.src = photoUrl(album, album.cover, thumbTr);
    img.addEventListener('error', function () {
      frame.textContent = 'Photo not found';
    });
    frame.appendChild(img);

    var body = el('div', 'album-body');
    body.appendChild(el('div', 'album-title', album.title || 'Album'));
    if (album.date) body.appendChild(el('div', 'album-date', album.date));
    body.appendChild(el('div', 'album-count', n + (n === 1 ? ' photo' : ' photos')));

    card.appendChild(frame);
    card.appendChild(body);
    card.addEventListener('click', function () {
      lastOpener = card;
      openViewer(album, 0);
    });
    return card;
  }

  var shown = 0;
  categories.forEach(function (cat) {
    var list = albums.filter(function (a) { return a.category === cat.id; });
    if (!list.length) return;
    shown += list.length;

    var group = el('div', 'cat-group');
    group.id = 'cat-' + cat.id;
    group.appendChild(el('h3', 'cat', cat.name));
    if (cat.note) group.appendChild(el('p', 'cat-note', cat.note));
    var grid = el('div', 'grid');
    list.forEach(function (a) { grid.appendChild(buildCard(a)); });
    group.appendChild(grid);
    root.appendChild(group);

    if (chipsBox) {
      var chip = el('a', null, cat.name);
      chip.href = '#cat-' + cat.id;
      chipsBox.appendChild(chip);
    }
  });

  if (!shown) {
    if (chipsBox) chipsBox.hidden = true;
    var empty = el('div', 'notice');
    var body = el('div', 'notice-body');
    body.appendChild(el('strong', null, 'Photo albums will appear here'));
    body.appendChild(el('p', null, 'The school is preparing its photographs. Please visit again soon.'));
    empty.appendChild(body);
    root.appendChild(empty);
    return;
  }

  /* ---------- Full-screen viewer ---------- */
  var viewer = null, imgEl, titleEl, countEl, errEl, closeBtn, prevBtn, nextBtn;
  var current = null, index = 0;

  var ARROW_L = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg>';
  var ARROW_R = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7"/></svg>';
  var CROSS = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function buildViewer() {
    viewer = el('div', 'lb');
    viewer.hidden = true;
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'Photo viewer');

    var top = el('div', 'lb-top');
    var info = el('div', 'lb-info');
    titleEl = el('div', 'lb-title');
    countEl = el('div', 'lb-count');
    countEl.setAttribute('aria-live', 'polite');
    info.appendChild(titleEl);
    info.appendChild(countEl);
    closeBtn = el('button', 'lb-btn lb-close');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close photo viewer');
    closeBtn.innerHTML = CROSS;
    top.appendChild(info);
    top.appendChild(closeBtn);

    prevBtn = el('button', 'lb-btn lb-nav lb-prev');
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Previous photo');
    prevBtn.innerHTML = ARROW_L;
    nextBtn = el('button', 'lb-btn lb-nav lb-next');
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Next photo');
    nextBtn.innerHTML = ARROW_R;

    var stage = el('div', 'lb-stage');
    imgEl = document.createElement('img');
    imgEl.className = 'lb-img';
    imgEl.alt = '';
    imgEl.draggable = false;
    errEl = el('div', 'lb-error', 'This photo could not be loaded.');
    errEl.hidden = true;
    stage.appendChild(imgEl);
    stage.appendChild(errEl);

    viewer.appendChild(top);
    viewer.appendChild(prevBtn);
    viewer.appendChild(stage);
    viewer.appendChild(nextBtn);
    document.body.appendChild(viewer);

    closeBtn.addEventListener('click', closeViewer);
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });
    // Clicking the dark area outside the photo closes the viewer.
    stage.addEventListener('click', function (e) { if (e.target === stage) closeViewer(); });

    imgEl.addEventListener('load', function () { imgEl.classList.add('is-ready'); errEl.hidden = true; });
    imgEl.addEventListener('error', function () { imgEl.classList.remove('is-ready'); errEl.hidden = false; });

    // Swipe left or right on phones.
    var sx = null, sy = null;
    viewer.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { sx = null; return; }
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    viewer.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function show() {
    var n = current.files.length;
    imgEl.classList.remove('is-ready');
    errEl.hidden = true;
    imgEl.alt = current.title + ', photo ' + (index + 1) + ' of ' + n;
    imgEl.src = photoUrl(current, current.files[index], viewTr);
    titleEl.textContent = current.title;
    countEl.textContent = (index + 1) + ' / ' + n;
    prevBtn.hidden = nextBtn.hidden = n < 2;
    // Load the neighbouring photos in advance so the arrows feel quick.
    [index + 1, index - 1].forEach(function (i) {
      if (i >= 0 && i < n) { var p = new Image(); p.src = photoUrl(current, current.files[i], viewTr); }
    });
  }

  function step(d) {
    if (!current) return;
    var n = current.files.length;
    index = (index + d + n) % n;
    show();
  }

  function openViewer(album, i) {
    if (!viewer) buildViewer();
    current = album;
    index = i;
    viewer.hidden = false;
    document.documentElement.classList.add('lb-open');
    show();
    closeBtn.focus();
  }

  function closeViewer() {
    if (!viewer || viewer.hidden) return;
    viewer.hidden = true;
    document.documentElement.classList.remove('lb-open');
    imgEl.removeAttribute('src');
    current = null;
    if (lastOpener) { try { lastOpener.focus(); } catch (e) {} }
  }

  document.addEventListener('keydown', function (e) {
    if (!viewer || viewer.hidden) return;
    if (e.key === 'Escape') { closeViewer(); }
    else if (e.key === 'ArrowRight') { step(1); }
    else if (e.key === 'ArrowLeft') { step(-1); }
    else if (e.key === 'Tab') {
      // Keep keyboard focus inside the viewer while it is open.
      var items = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (items.indexOf(document.activeElement) < 0) { e.preventDefault(); first.focus(); }
    }
  });
})();
