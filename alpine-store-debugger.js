(() => {
  // Configuration
  const config = {
    buttonPosition: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    panelWidth: '350px',
    panelMaxHeight: '600px',
    updateDebounce: 100 // ms to debounce updates
  };

  // Create debugger button
  const createDebugButton = () => {
    const button = document.createElement('button');
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    `;
    button.className = 'alpine-debugger-btn';

    // Position based on config
    const positions = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4'
    };

    button.classList.add(...positions[config.buttonPosition].split(' '));
    return button;
  };

  // Create debugger panel
  const createDebugPanel = () => {
    const panel = document.createElement('div');
    panel.className = 'alpine-debugger-panel';
    panel.innerHTML = `
      <div class="alpine-debugger-header">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span>Alpine Debugger</span>
          <button class="alpine-debugger-tab-stores active">Stores</button>
          <button class="alpine-debugger-tab-data">Data</button>
        </div>
        <div class="alpine-debugger-controls">
          <button class="alpine-debugger-refresh" title="Refresh">↻</button>
          <button class="alpine-debugger-close" title="Close">×</button>
        </div>
      </div>
      <div class="alpine-debugger-content"></div>
    `;
    return panel;
  };

  // Inject styles
  const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      .alpine-debugger-btn {
        position: fixed;
        z-index: 9998;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(99, 102, 241, 0.9);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
      }
      
      .alpine-debugger-btn:hover {
        transform: scale(1.1);
        background: rgba(99, 102, 241, 1);
      }
      
      .alpine-debugger-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${config.panelWidth};
        max-height: ${config.panelMaxHeight};
        background: rgba(17, 24, 39, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #e5e7eb;
        z-index: 9999;
        display: none;
        backdrop-filter: blur(10px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      }
      
      .alpine-debugger-panel.active {
        display: block;
      }
      
      .alpine-debugger-header {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: move;
          background: rgba(31, 41, 55, 0.5);
          border-radius: 8px 8px 0 0;
          font-weight: 600;
          flex-wrap: nowrap;
          gap: 12px;
        }
      
      .alpine-debugger-controls {
        display: flex;
        gap: 8px;
      }
      
      .alpine-debugger-controls button {
        background: transparent;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 20px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
      }
      
      .alpine-debugger-controls button:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
      
      .alpine-debugger-content {
        max-height: calc(${config.panelMaxHeight} - 50px);
        overflow-y: auto;
        padding: 16px;
      }
      
      .alpine-debugger-tab-stores,
        .alpine-debugger-tab-data {
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(55, 65, 81, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .alpine-debugger-tab-stores:hover,
        .alpine-debugger-tab-data:hover {
          background: rgba(99, 102, 241, 0.2);
          color: #d1d5db;
        }
        
        .alpine-debugger-tab-stores.active,
        .alpine-debugger-tab-data.active {
          background: rgba(99, 102, 241, 0.3);
          color: #60a5fa;
          border-color: rgba(99, 102, 241, 0.5);
        }
      
      .alpine-debugger-store {
        margin-bottom: 16px;
        background: rgba(31, 41, 55, 0.3);
        border-radius: 6px;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .alpine-debugger-store-name {
        font-weight: 600;
        color: #60a5fa;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      .alpine-debugger-store-item {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        gap: 8px;
      }
      
      .alpine-debugger-store-key {
        color: #a78bfa;
        font-size: 13px;
        min-width: 80px;
      }
      
      .alpine-debugger-store-value {
        flex: 1;
        background: rgba(17, 24, 39, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        padding: 4px 8px;
        color: #d1d5db;
        font-size: 13px;
        font-family: 'Monaco', 'Menlo', monospace;
        outline: none;
        transition: all 0.2s;
      }
      
      .alpine-debugger-store-value:focus {
        background: rgba(17, 24, 39, 0.8);
        border-color: #60a5fa;
      }
      
      .alpine-debugger-store-value.boolean {
        cursor: pointer;
        user-select: none;
      }
      
      .alpine-debugger-store-value.object,
      .alpine-debugger-store-value.array {
        font-size: 11px;
        white-space: pre;
        overflow-x: auto;
      }
      
      .alpine-debugger-empty {
        text-align: center;
        color: #6b7280;
        padding: 32px;
        font-style: italic;
      }
      
      .alpine-debugger-tab-stores,
        .alpine-debugger-tab-data {
          padding: 2px 8px;
          font-size: 14px;
          font-weight: bold;
        }
        
        .alpine-debugger-tab-stores.active,
        .alpine-debugger-tab-data.active {
          background: rgba(99, 102, 241, 0.3);
          color: #60a5fa;
        }
      
      /* Positions */
      .bottom-4 { bottom: 1rem; }
      .right-4 { right: 1rem; }
      .left-4 { left: 1rem; }
      .top-4 { top: 1rem; }
    `;
    document.head.appendChild(style);
  };

  // Make panel draggable
  const makeDraggable = (panel) => {
    const header = panel.querySelector('.alpine-debugger-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    const dragStart = (e) => {
      if (e.target.closest('.alpine-debugger-controls')) return;

      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      isDragging = true;
    };

    const drag = (e) => {
      if (!isDragging) return;

      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;

      panel.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
    };

    const dragEnd = () => {
      isDragging = false;
    };

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
  };

  // Get all Alpine stores

  const getStores = () => {
      if (!window.Alpine) return {};

      const stores = {};

      // Method 1: Try accessing through Alpine's internal store registry
      if (window.Alpine.$store) {
        // Alpine exposes stores through proxies, we need to check the internal registry
        const storeProxy = window.Alpine.$store;

        // Try to get store names from the global context
        if (typeof Proxy !== 'undefined') {
          // Check for stores in Alpine's internal structure
          const alpineStores = window.Alpine.stores;
          if (alpineStores) {
            Object.keys(alpineStores).forEach(name => {
              stores[name] = alpineStores[name];
            });
            return stores;
          }
        }
      }

      // Method 2: Scan for x-data elements and extract store references
      document.querySelectorAll('[x-data]').forEach(el => {
        if (el._x_dataStack) {
          el._x_dataStack.forEach(data => {
            if (data.$store) {
              // Found stores in component context
              Object.keys(data.$store).forEach(name => {
                if (!stores[name]) {
                  stores[name] = data.$store[name];
                }
              });
            }
          });
        }
      });

      return stores;
    };

    //
  const getDataContexts = () => {
      if (!window.Alpine) return [];

      const contexts = [];
      const processedElements = new WeakSet();

      document.querySelectorAll('[x-data]').forEach(el => {
        if (processedElements.has(el)) return;
        processedElements.add(el);

        if (el._x_dataStack && el._x_dataStack.length > 0) {
          const data = el._x_dataStack[0];
          const selector = el.id ? `#${el.id}` :
                          el.className ? `.${el.className.split(' ')[0]}` :
                          el.tagName.toLowerCase();

          contexts.push({
            element: el,
            selector: selector,
            data: data,
            path: getElementPath(el)
          });
        }
      });

      return contexts;
    };


  // Add after getDataContexts function
  const getRegisteredComponents = () => {
  if (!window.Alpine || !window.Alpine.dataStack) return {};

  const registered = {};

  // Alpine stores registered components internally
  // We need to check for the internal registry
  try {
    // Alpine 3.x stores these in an internal map
    if (window.Alpine._data) {
      Object.entries(window.Alpine._data).forEach(([name, factory]) => {
        registered[name] = {
          factory: factory,
          instances: []
        };
      });
    }

    // Find instances of each registered component
    document.querySelectorAll('[x-data]').forEach(el => {
      const xDataAttr = el.getAttribute('x-data');

      // Check if it matches a registered component name
      Object.keys(registered).forEach(name => {
        // Match patterns like "dropdown", "dropdown()", "dropdown({...})"
        const patterns = [
          new RegExp(`^${name}\\s*$`),
          new RegExp(`^${name}\\s*\\(`),
        ];

        if (patterns.some(pattern => pattern.test(xDataAttr.trim()))) {
          registered[name].instances.push({
            element: el,
            data: el._x_dataStack ? el._x_dataStack[0] : null
          });
        }
      });
    });
  } catch (e) {
    console.warn('Could not access Alpine registered components:', e);
  }

  return registered;
};

  // Alternative method using monkey-patching to track registrations
  const trackAlpineDataRegistrations = () => {
  if (!window.Alpine || !window.Alpine.data) return;

  const originalData = window.Alpine.data;
  window.__alpineDataRegistry = window.__alpineDataRegistry || {};

  window.Alpine.data = function(name, callback) {
    window.__alpineDataRegistry[name] = callback;
    return originalData.call(this, name, callback);
  };
};

    // Helper function to get element path
  const getElementPath = (el) => {
      const path = [];
      while (el && el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.id) {
          selector += '#' + el.id;
          path.unshift(selector);
          break;
        } else if (el.className) {
          selector += '.' + el.className.split(' ')[0];
        }
        path.unshift(selector);
        el = el.parentNode;
      }
      return path.join(' > ');
    };

    // Add this new initialization helper
  const waitForAlpineStores = (callback) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait

      const checkStores = () => {
        attempts++;

        if (window.Alpine && window.Alpine.store) {
          // Try to trigger store access to ensure they're loaded
          const testStore = window.Alpine.store('test');

          // Give Alpine time to initialize stores
          setTimeout(() => {
            callback();
          }, 100);
        } else if (attempts < maxAttempts) {
          setTimeout(checkStores, 100);
        } else {
          console.warn('Alpine Store Debugger: Could not detect Alpine or stores');
          callback(); // Try anyway
        }
      };

      checkStores();
    };

  // Render store data
  const renderStores = (container) => {
    const stores = getStores();

    if (Object.keys(stores).length === 0) {
      container.innerHTML = '<div class="alpine-debugger-empty">No Alpine stores found</div>';
      return;
    }

    container.innerHTML = '';

    Object.entries(stores).forEach(([storeName, storeData]) => {
      const storeEl = document.createElement('div');
      storeEl.className = 'alpine-debugger-store';

      const nameEl = document.createElement('div');
      nameEl.className = 'alpine-debugger-store-name';
      nameEl.textContent = `$store.${storeName}`;
      storeEl.appendChild(nameEl);

      Object.entries(storeData).forEach(([key, value]) => {
        if (typeof value === 'function') return; // Skip methods

        const itemEl = document.createElement('div');
        itemEl.className = 'alpine-debugger-store-item';

        const keyEl = document.createElement('div');
        keyEl.className = 'alpine-debugger-store-key';
        keyEl.textContent = key + ':';

        const valueEl = document.createElement('input');
        valueEl.className = 'alpine-debugger-store-value';

        // Handle different value types
        const valueType = typeof value;

        if (valueType === 'boolean') {
          valueEl.value = value;
          valueEl.classList.add('boolean');
          valueEl.readOnly = true;
          valueEl.style.cursor = 'pointer';
          valueEl.addEventListener('click', () => {
            const newValue = !window.Alpine.store(storeName)[key];
            window.Alpine.store(storeName)[key] = newValue;
            valueEl.value = newValue;
          });
        } else if (valueType === 'object') {
          valueEl.value = JSON.stringify(value, null, 2);
          valueEl.classList.add(Array.isArray(value) ? 'array' : 'object');
          valueEl.readOnly = true;
        } else {
          valueEl.value = value;
          valueEl.addEventListener('change', (e) => {
            let newValue = e.target.value;

            // Try to parse as number
            if (!isNaN(newValue) && newValue !== '') {
              newValue = Number(newValue);
            }

            window.Alpine.store(storeName)[key] = newValue;
          });
        }

        itemEl.appendChild(keyEl);
        itemEl.appendChild(valueEl);
        storeEl.appendChild(itemEl);
      });

      container.appendChild(storeEl);
    });
  };

  const renderDataContexts = (container) => {
  container.innerHTML = '';

  // Section 1: Registered Components
  const registered = window.__alpineDataRegistry || {};

  if (Object.keys(registered).length > 0) {
    const registeredHeader = document.createElement('div');
    registeredHeader.style.cssText = 'color: #60a5fa; font-weight: bold; margin-bottom: 12px; padding: 8px; background: rgba(96, 165, 250, 0.1); border-radius: 4px;';
    registeredHeader.textContent = 'Registered Components';
    container.appendChild(registeredHeader);

    Object.entries(registered).forEach(([name, factory]) => {
      const componentEl = document.createElement('div');
      componentEl.className = 'alpine-debugger-store';

      const nameEl = document.createElement('div');
      nameEl.className = 'alpine-debugger-store-name';
      nameEl.innerHTML = `Alpine.data('<span style="color: #a78bfa">${name}</span>')`;
      componentEl.appendChild(nameEl);

      // Find and count instances
      const instances = [];
      document.querySelectorAll('[x-data]').forEach(el => {
        const xDataAttr = el.getAttribute('x-data');
        if (xDataAttr && (xDataAttr === name || xDataAttr.startsWith(name + '('))) {
          instances.push(el);
        }
      });

      const infoEl = document.createElement('div');
      infoEl.style.cssText = 'font-size: 11px; color: #9ca3af; margin: 4px 0;';
      infoEl.textContent = `${instances.length} instance${instances.length !== 1 ? 's' : ''} found`;
      componentEl.appendChild(infoEl);

      // Show sample data structure by creating a temporary instance
      try {
        const sampleData = factory();
        Object.entries(sampleData).forEach(([key, value]) => {
          if (typeof value === 'function') {
            const itemEl = document.createElement('div');
            itemEl.className = 'alpine-debugger-store-item';
            itemEl.innerHTML = `
              <div class="alpine-debugger-store-key" style="color: #fbbf24">${key}():</div>
              <div class="alpine-debugger-store-value" style="background: rgba(251, 191, 36, 0.1); font-style: italic;">function</div>
            `;
            componentEl.appendChild(itemEl);
          } else {
            const itemEl = document.createElement('div');
            itemEl.className = 'alpine-debugger-store-item';

            const keyEl = document.createElement('div');
            keyEl.className = 'alpine-debugger-store-key';
            keyEl.textContent = key + ':';

            const valueEl = document.createElement('div');
            valueEl.className = 'alpine-debugger-store-value';
            valueEl.style.cssText = 'background: rgba(17, 24, 39, 0.3); padding: 4px 8px; border-radius: 4px;';
            valueEl.textContent = JSON.stringify(value);

            itemEl.appendChild(keyEl);
            itemEl.appendChild(valueEl);
            componentEl.appendChild(itemEl);
          }
        });
      } catch (e) {
        // If factory requires parameters, just show that it's a factory function
        const itemEl = document.createElement('div');
        itemEl.style.cssText = 'font-size: 11px; color: #6b7280; font-style: italic; padding: 4px;';
        itemEl.textContent = 'Factory function (requires parameters)';
        componentEl.appendChild(itemEl);
      }

      container.appendChild(componentEl);
    });
  }

  // Section 2: Active Data Contexts
  const contexts = getDataContexts();

  if (contexts.length > 0) {
    const activeHeader = document.createElement('div');
    activeHeader.style.cssText = 'color: #60a5fa; font-weight: bold; margin: 16px 0 12px 0; padding: 8px; background: rgba(96, 165, 250, 0.1); border-radius: 4px;';
    activeHeader.textContent = 'Active Data Contexts';
    container.appendChild(activeHeader);

    // Continue with existing context rendering logic...
    contexts.forEach((context, index) => {
      // (existing context rendering code stays the same)
      const contextEl = document.createElement('div');
      contextEl.className = 'alpine-debugger-store';

      const nameEl = document.createElement('div');
      nameEl.className = 'alpine-debugger-store-name';
      nameEl.textContent = context.selector;
      nameEl.title = context.path;
      contextEl.appendChild(nameEl);

      // Add element highlighter
      nameEl.style.cursor = 'pointer';
      nameEl.addEventListener('mouseenter', () => {
        context.element.style.outline = '2px solid #60a5fa';
        context.element.style.outlineOffset = '2px';
      });
      nameEl.addEventListener('mouseleave', () => {
        context.element.style.outline = '';
        context.element.style.outlineOffset = '';
      });

      Object.entries(context.data).forEach(([key, value]) => {
        if (typeof value === 'function' || key.startsWith('$') || key.startsWith('_x_')) return;

        const itemEl = document.createElement('div');
        itemEl.className = 'alpine-debugger-store-item';

        const keyEl = document.createElement('div');
        keyEl.className = 'alpine-debugger-store-key';
        keyEl.textContent = key + ':';

        const valueEl = document.createElement('input');
        valueEl.className = 'alpine-debugger-store-value';

        const valueType = typeof value;

        if (valueType === 'boolean') {
          valueEl.value = value;
          valueEl.classList.add('boolean');
          valueEl.readOnly = true;
          valueEl.style.cursor = 'pointer';
          valueEl.addEventListener('click', () => {
            context.data[key] = !context.data[key];
            valueEl.value = context.data[key];
          });
        } else if (valueType === 'object') {
          valueEl.value = JSON.stringify(value, null, 2);
          valueEl.classList.add(Array.isArray(value) ? 'array' : 'object');
          valueEl.readOnly = true;
        } else {
          valueEl.value = value;
          valueEl.addEventListener('change', (e) => {
            let newValue = e.target.value;
            if (!isNaN(newValue) && newValue !== '') {
              newValue = Number(newValue);
            }
            context.data[key] = newValue;
          });
        }

        itemEl.appendChild(keyEl);
        itemEl.appendChild(valueEl);
        contextEl.appendChild(itemEl);
      });

      container.appendChild(contextEl);
    });
  }

  if (Object.keys(registered).length === 0 && contexts.length === 0) {
    container.innerHTML = '<div class="alpine-debugger-empty">No Alpine data contexts found</div>';
  }
};

  // Debounce helper
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Initialize debugger
  const init = () => {
    // Wait for Alpine to be ready
    if (!window.Alpine) {
      setTimeout(init, 100);
      return;
    }
    trackAlpineDataRegistrations();
    injectStyles();

    const button = createDebugButton();
    const panel = createDebugPanel();

    document.body.appendChild(button);
    document.body.appendChild(panel);

    makeDraggable(panel);

    const content = panel.querySelector('.alpine-debugger-content');
    const refreshBtn = panel.querySelector('.alpine-debugger-refresh');
    const closeBtn = panel.querySelector('.alpine-debugger-close');
    const storesTab = panel.querySelector('.alpine-debugger-tab-stores');
    const dataTab = panel.querySelector('.alpine-debugger-tab-data');
    let currentView = 'stores'; // Track current view

    // Add tab switching logic
    storesTab.addEventListener('click', () => {
      currentView = 'stores';
      storesTab.classList.add('active');
      dataTab.classList.remove('active');
      renderStores(content);
    });

    dataTab.addEventListener('click', () => {
      currentView = 'data';
      dataTab.classList.add('active');
      storesTab.classList.remove('active');
      renderDataContexts(content);
    });


    // Toggle panel
    button.addEventListener('click', () => {
      panel.classList.toggle('active');
      if (panel.classList.contains('active')) {
        if (currentView === 'stores') {
          renderStores(content);
        } else {
          renderDataContexts(content);
        }
        startWatching();
      } else {
        stopWatching();
      }
    });

    // Close panel
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('active');
      stopWatching();
    });

    // Refresh stores
    refreshBtn.addEventListener('click', () => {
      if (currentView === 'stores') {
        renderStores(content);
      } else {
        renderDataContexts(content);
      }
    });

    // Auto-update mechanism
    let watchInterval;
    const debouncedRender = debounce(() => {
      if (currentView === 'stores') {
        renderStores(content);
      } else {
        renderDataContexts(content);
      }
    }, config.updateDebounce);

    const startWatching = () => {
      // Use Alpine's reactivity if possible
      if (window.Alpine.effect) {
        window.Alpine.effect(() => {
          debouncedRender();
        });
      } else {
        // Fallback to interval checking
        watchInterval = setInterval(debouncedRender, 500);
      }
    };

    const stopWatching = () => {
      if (watchInterval) {
        clearInterval(watchInterval);
      }
    };
  };

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();