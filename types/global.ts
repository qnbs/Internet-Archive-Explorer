declare global {
  interface Window {
    waitingServiceWorker?: ServiceWorker;
    MSStream?: unknown;
  }
}

export {};
