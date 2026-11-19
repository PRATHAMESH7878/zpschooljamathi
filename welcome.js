/* Welcome page: ring the bell, zoom into the school, open the website. */
(function () {
  // The page that opens after the welcome page.
  var NEXT = 'index.html';

  // Where the main door is inside the photo, as a fraction from the left and from the top.
  // If you change images/school.jpg, change these two numbers to point at the new door.
  var DOOR = { x: 0.624, y: 0.579 };

  var stage = document.getElementById('stage');
  var scene = document.getElementById('scene');
  var photo = document.getElementById('schoolPhoto');
  var bell = document.getElementById('bellBtn');
  var skip = document.getElementById('skipBtn');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = false;
  var leaving = false;

  // Remember that the welcome page was seen, then open the website.
  function go() {
    if (leaving) return;
    leaving = true;
    var stored = false;
    try {
      sessionStorage.setItem('introSeen', '1');
      stored = sessionStorage.getItem('introSeen') === '1';
    } catch (e) {}
    location.replace(stored ? NEXT : NEXT + '?skipwelcome');
  }

  function skipNow() {
    stage.classList.add('is-leaving');
    setTimeout(go, 450);
  }

  // Work out where the door is on this screen, so the zoom lands on it.
  function aimAtDoor() {
    var iw = photo.naturalWidth, ih = photo.naturalHeight;
    if (!iw || !ih) return;
    var W = window.innerWidth, H = window.innerHeight;
    var scale = Math.max(W / iw, H / ih);
    var rw = iw * scale, rh = ih * scale;
    var pos = (getComputedStyle(photo).objectPosition || '50% 50%').split(' ');
    var px = parseFloat(pos[0]) / 100, py = parseFloat(pos[1]) / 100;
    var x = (W - rw) * px + DOOR.x * rw;
    var y = (H - rh) * py + DOOR.y * rh;
    scene.style.transformOrigin = x + 'px ' + y + 'px';
  }

  // A short school-bell sound made in the browser, so no sound file is needed.
  // To remove the sound, delete the line  playBell();  inside enter() below.
  function playBell() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC();
      var master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
      var partials = [[880, 1], [1320, 0.55], [2210, 0.32], [3150, 0.18]];
      function strike(start) {
        partials.forEach(function (p, i) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = p[0];
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(p[1], start + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.6 - i * 0.25);
          osc.connect(gain);
          gain.connect(master);
          osc.start(start);
          osc.stop(start + 1.7);
        });
      }
      var now = ctx.currentTime;
      strike(now);
      strike(now + 0.55);
      setTimeout(function () { try { ctx.close(); } catch (e) {} }, 3500);
    } catch (e) {}
  }

  function enter() {
    if (started || leaving) return;
    started = true;
    stage.classList.add('is-ring');
    playBell();
    if (reduceMotion) {
      setTimeout(skipNow, 900);
      return;
    }
    aimAtDoor();
    setTimeout(function () { stage.classList.add('is-zoom'); }, 700);
    setTimeout(go, 700 + 2800);
  }

  bell.addEventListener('click', enter);
  skip.addEventListener('click', skipNow);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') skipNow();
  });
  try { bell.focus(); } catch (e) {}
})();
