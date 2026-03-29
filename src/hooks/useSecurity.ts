import { useEffect } from 'react';

export const useSecurity = () => {
  useEffect(() => {
    // Additional component-level security measures
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block various developer tools shortcuts
      const blockedKeys = [
        'F12',
        'F11', // Fullscreen
        'F10', // Menu bar
      ];
      
      const blockedCombinations = [
        { ctrl: true, shift: true, key: 'I' }, // DevTools
        { ctrl: true, shift: true, key: 'J' }, // Console
        { ctrl: true, shift: true, key: 'C' }, // Inspect
        { ctrl: true, shift: true, key: 'K' }, // Console (Firefox)
        { ctrl: true, shift: true, key: 'X' }, // Responsive
        { ctrl: true, key: 'U' }, // View Source
        { ctrl: true, key: 'S' }, // Save
        { ctrl: true, key: 'P' }, // Print
        { ctrl: true, key: 'A' }, // Select All
      ];

      // Check for blocked single keys
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        return false;
      }

      // Check for blocked combinations
      for (const combo of blockedCombinations) {
        if (
          (combo.ctrl && e.ctrlKey) &&
          (combo.shift && e.shiftKey || !combo.shift) &&
          e.key.toUpperCase() === combo.key
        ) {
          e.preventDefault();
          return false;
        }
      }
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.matches('input, textarea, [contenteditable], .allow-select')) {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.matches('input, textarea, [contenteditable], .allow-copy')) {
        e.preventDefault();
        return false;
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.matches('input, textarea, [contenteditable], .allow-paste')) {
        e.preventDefault();
        return false;
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.matches('input, textarea, [contenteditable], .allow-cut')) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);

    // Prevent text selection on double click
    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.matches('input, textarea, [contenteditable], .allow-select')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('dblclick', handleDoubleClick);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('dblclick', handleDoubleClick);
    };
  }, []);

  // Function to check if devtools are open
  const checkDevTools = () => {
    const threshold = 160;
    const isOpen = 
      window.outerHeight - window.innerHeight > threshold || 
      window.outerWidth - window.innerWidth > threshold;
    
    if (isOpen) {
      document.body.innerHTML = `
        <div style="
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          background: #f5f5f5; 
          font-family: Arial, sans-serif;
        ">
          <div style="text-align: center;">
            <h1 style="color: #e74c3c; margin-bottom: 20px;">Access Denied</h1>
            <p style="color: #333; font-size: 18px;">Developer tools are not allowed in this application.</p>
            <p style="color: #666; margin-top: 10px;">This window will close automatically.</p>
          </div>
        </div>
      `;
      
      setTimeout(() => {
        window.close();
        if (!window.closed) {
          window.location.href = 'about:blank';
        }
      }, 3000);
      
      return true;
    }
    
    return false;
  };

  return { checkDevTools };
};
