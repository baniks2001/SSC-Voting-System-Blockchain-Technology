import { useEffect, useCallback } from 'react';

// Allowed copy/paste/selection shortcuts
const ALLOWED_SHORTCUTS = [
  { key: 'c', ctrl: true, shift: false, alt: false, meta: false }, // Ctrl+C
  { key: 'v', ctrl: true, shift: false, alt: false, meta: false }, // Ctrl+V
  { key: 'x', ctrl: true, shift: false, alt: false, meta: false }, // Ctrl+X
  { key: 'a', ctrl: true, shift: false, alt: false, meta: false }, // Ctrl+A
  // Also allow Mac equivalents
  { key: 'c', ctrl: false, shift: false, alt: false, meta: true }, // Cmd+C
  { key: 'v', ctrl: false, shift: false, alt: false, meta: true }, // Cmd+V
  { key: 'x', ctrl: false, shift: false, alt: false, meta: true }, // Cmd+X
  { key: 'a', ctrl: false, shift: false, alt: false, meta: true }, // Cmd+A
];

// DevTools detection and blocking
export const useSecurity = () => {
  const isAllowedShortcut = useCallback((e: KeyboardEvent): boolean => {
    const key = e.key.toLowerCase();
    return ALLOWED_SHORTCUTS.some(
      (shortcut) =>
        shortcut.key === key &&
        shortcut.ctrl === e.ctrlKey &&
        shortcut.shift === e.shiftKey &&
        shortcut.alt === e.altKey &&
        shortcut.meta === e.metaKey
    );
  }, []);

  const checkDevTools = useCallback((): boolean => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const isDevToolsOpen = widthThreshold || heightThreshold;

    // Additional check: Debugger detection
    const start = performance.now();
    debugger;
    const end = performance.now();
    const debuggerDetected = end - start > 100;

    return isDevToolsOpen || debuggerDetected;
  }, []);

  const handleDevToolsDetected = useCallback(() => {
    // Clear sensitive data from memory
    sessionStorage.clear();
    localStorage.removeItem('voting_session');
    localStorage.removeItem('temp_voter_data');

    // Log security event to server before closing
    fetch('/api/security/devtools-detected', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        action: 'browser_closed',
      }),
    }).catch(() => {
      // Silent fail - proceed to close anyway
    }).finally(() => {
      // Attempt to close the browser window/tab
      // Note: This only works reliably for windows opened by script,
      // but we can try to navigate away and clear the page

      // Clear all content first
      document.head.innerHTML = '';
      document.body.innerHTML = '';

      // Try to close the window
      window.open('', '_self')?.close();

      // If window.close() didn't work (most modern browsers block it),
      // navigate to blank and try again
      window.location.href = 'about:blank';

      // Final attempt with self-close after navigation
      setTimeout(() => {
        window.open('', '_self')?.close();
        // If still open, try to crash the page
        while (true) {
          // Infinite loop as last resort to freeze the page
          // This prevents further interaction with the page
        }
      }, 100);
    });
  }, []);

  useEffect(() => {
    // Skip in development mode if explicitly disabled
    if (import.meta.env.DEV && import.meta.env.VITE_DISABLE_SECURITY === 'true') {
      return;
    }

    // Keyboard shortcuts blocking
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Always allow copy/paste/selection shortcuts
      if (isAllowedShortcut(e)) {
        return;
      }

      // Block F12
      if (key === 'f12') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Block Ctrl+Shift+I (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'i') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Block Ctrl+Shift+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'j') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Block Ctrl+Shift+C (Element Inspector)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && key === 'c') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Block Ctrl+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Block Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    // Context menu (right click) - optional blocking
    // Uncomment below to disable right-click entirely
    // const handleContextMenu = (e: MouseEvent) => {
    //   e.preventDefault();
    //   return false;
    // };

    // DevTools detection via window resize
    const handleResize = () => {
      if (checkDevTools()) {
        handleDevToolsDetected();
      }
    };

    // Console detection using timing
    let devToolsCheck: number;
    const detectDevToolsLoop = () => {
      if (checkDevTools()) {
        handleDevToolsDetected();
        return;
      }
      devToolsCheck = window.setTimeout(detectDevToolsLoop, 1000);
    };

    // Prevent text selection on sensitive elements (optional)
    const preventSelection = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target?.classList?.contains('sensitive-data')) {
        e.preventDefault();
      }
    };

    // Attach listeners
    document.addEventListener('keydown', handleKeyDown, true);
    // document.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('selectstart', preventSelection, true);

    // Start DevTools detection
    detectDevToolsLoop();

    // Prevent some console functions from being used
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    // Override console methods in production
    if (!import.meta.env.DEV) {
      console.log = () => {};
      console.warn = () => {};
      console.info = () => {};
      console.debug = () => {};
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      // document.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('selectstart', preventSelection, true);
      window.clearTimeout(devToolsCheck);

      // Restore console
      if (!import.meta.env.DEV) {
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
        console.info = originalConsole.info;
        console.debug = originalConsole.debug;
      }
    };
  }, [checkDevTools, handleDevToolsDetected, isAllowedShortcut]);

  return { checkDevTools };
};
