import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Additional React-level security measures
if (typeof window !== 'undefined') {
  // Prevent drag and drop
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());

  // Disable right-click on React components
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable text selection globally (but allow for inputs)
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    if (!target.matches('input, textarea, [contenteditable]')) {
      e.preventDefault();
      return false;
    }
  });

  // Block keyboard shortcuts for developer tools
  document.addEventListener('keydown', (e) => {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) || 
        (e.ctrlKey && e.key === 'U')) {
      e.preventDefault();
      return false;
    }
  });

  // Detect window size changes (devtools detection)
  let devtoolsOpen = false;
  const checkDevTools = () => {
    const threshold = 160;
    const isOpen = window.outerHeight - window.innerHeight > threshold || 
                   window.outerWidth - window.innerWidth > threshold;
    
    if (isOpen && !devtoolsOpen) {
      devtoolsOpen = true;
      document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 20%;">Developer tools are not allowed</h1>';
      setTimeout(() => {
        window.close();
        if (!window.closed) {
          window.location.href = 'about:blank';
        }
      }, 1000);
    } else if (!isOpen && devtoolsOpen) {
      devtoolsOpen = false;
    }
  };

  setInterval(checkDevTools, 500);

  // Disable console in production
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    console.debug = () => {};
    
    // Override console.clear
    console.clear = () => {};
  }

  // Prevent copy/paste/cut
  document.addEventListener('copy', (e) => {
    const target = e.target as HTMLElement;
    if (!target.matches('input, textarea, [contenteditable]')) {
      e.preventDefault();
      return false;
    }
  });

  document.addEventListener('paste', (e) => {
    const target = e.target as HTMLElement;
    if (!target.matches('input, textarea, [contenteditable]')) {
      e.preventDefault();
      return false;
    }
  });

  document.addEventListener('cut', (e) => {
    const target = e.target as HTMLElement;
    if (!target.matches('input, textarea, [contenteditable]')) {
      e.preventDefault();
      return false;
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
