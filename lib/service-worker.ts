/**
 * Service Worker registration and management utilities
 */

/**
 * Registers the service worker for offline support
 * Should be called on app initialization (client-side only)
 *
 * @returns Promise that resolves to the ServiceWorkerRegistration
 *
 * @example
 * registerServiceWorker().then(() => {
 *   console.log('Service worker registered');
 * });
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Check if service workers are supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered successfully:', registration.scope);

    // Check for updates periodically
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available, notify user
          console.log('New version available! Refresh to update.');
          notifyUpdate();
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregisters the service worker
 * Useful for development or troubleshooting
 *
 * @example
 * unregisterServiceWorker();
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    console.log('Service Worker unregistered:', success);
    return success;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Checks if a service worker is registered
 *
 * @returns true if a service worker is registered and active
 */
export function isServiceWorkerRegistered(): boolean {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  return !!navigator.serviceWorker.controller;
}

/**
 * Triggers a service worker update check
 * Forces the service worker to check for updates immediately
 *
 * @example
 * checkForUpdates();
 */
export async function checkForUpdates(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    console.log('Service Worker update check completed');
  } catch (error) {
    console.error('Service Worker update check failed:', error);
  }
}

/**
 * Notifies user about available updates
 * Can be customized to show a toast or modal
 */
function notifyUpdate(): void {
  // You can integrate with your toast notification system here
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('sw-update-available');
    window.dispatchEvent(event);
  }
}

/**
 * Hook for service worker registration status
 * Can be used in React components to track SW status
 *
 * @example
 * const swStatus = useServiceWorker();
 */
export function useServiceWorker() {
  if (typeof window === 'undefined') {
    return { registered: false, updateAvailable: false };
  }

  const registered = isServiceWorkerRegistered();

  return {
    registered,
    register: registerServiceWorker,
    unregister: unregisterServiceWorker,
    checkForUpdates,
  };
}

/**
 * Clears all service worker caches
 * Useful for troubleshooting or clearing old data
 *
 * @example
 * clearServiceWorkerCaches();
 */
export async function clearServiceWorkerCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log('Service Worker caches cleared');
  } catch (error) {
    console.error('Failed to clear Service Worker caches:', error);
  }
}
