/* Welcome page redirect — runs before the page renders.
   First-time visitors are sent to welcome.html.
   Returning visitors (same session) go straight to index.html. */
try {
  if (
    !sessionStorage.getItem('introSeen') &&
    location.search.indexOf('skipwelcome') < 0
  ) {
    location.replace('welcome.html');
  }
} catch (e) {}
