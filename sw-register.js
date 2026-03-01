(() => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const { hostname } = window.location;
  const isDevLikeHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.app.github.dev');

  if (isDevLikeHost) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(
          registrations
            .filter((registration) => registration.scope.includes('/Internet-Archive-Explorer/'))
            .map((registration) => registration.unregister()),
        ),
      )
      .catch(() => {
        // no-op in development-like environments
      });
    return;
  }

  const currentScript = document.currentScript;
  if (!(currentScript instanceof HTMLScriptElement) || !currentScript.src) {
    return;
  }

  const scriptUrl = new URL(currentScript.src);
  const appBase = scriptUrl.pathname.endsWith('/sw-register.js')
    ? scriptUrl.pathname.replace(/sw-register\.js$/, '')
    : '/';

  navigator.serviceWorker
    .register(`${appBase}sw.js`, { scope: appBase, updateViaCache: 'none' })
    .then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) {
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            window.waitingServiceWorker = newWorker;
            window.dispatchEvent(new CustomEvent('swUpdateReady'));
          }
        });
      });
    })
    .catch(() => {
      // no-op in production
    });
})();
