(() => {
  // Avoid double injection
  if (window.__rn_reader_bridge_installed) return;
  window.__rn_reader_bridge_installed = true;

  // ---- Helpers ----
  function post(obj) {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify(obj));
    } catch (e) {
      console.log("⚠️ WebView postMessage failed", e);
    }
  }

  // ---- Inject a <style> element for dynamic styles ----
  const STYLE_ID = "rn-injected-style";
  let styleEl = null;

  function ensureStyleEl() {
    if (!styleEl) {
      styleEl = document.getElementById(STYLE_ID);
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = STYLE_ID;
        (document.head || document.documentElement).appendChild(styleEl);
      }
    }
    return styleEl;
  }

  function setInjectedCSS(cssText) {
    ensureStyleEl().textContent = cssText || "";
    console.log("✅ Style applied");
  }

  // ---- Handle messages from RN ----
  function handleMessageFromRN(event) {
    let dataStr = null;
    if (typeof event.data === "string") dataStr = event.data;
    else if (
      event.data &&
      typeof event.data === "object" &&
      "data" in event.data
    )
      dataStr = event.data.data;

    if (!dataStr) return;

    try {
      const obj = JSON.parse(dataStr);
      if (!obj?.type) return;

      switch (obj.type) {
        case "setStyles":
          setInjectedCSS(obj.css || "");
          post({ type: "setStylesAck" });
          break;
        case "updateStyle":
          if (obj.selector && obj.styles) {
            updateStyle(obj.selector, obj.styles);
            post({ type: "updateStyleAck", selector: obj.selector });
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.log("⚠️ Failed to parse RN message", err);
    }
  }

  // ---- Update individual styles dynamically ----
  function updateStyle(selector, styles) {
    ensureStyleEl();
    let styleStr = "";

    // Convert JS object to CSS string
    for (const key in styles) {
      if (styles.hasOwnProperty(key)) {
        const prop = key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
        styleStr += `${prop}: ${styles[key]}; `;
      }
    }

    // Add/replace CSS rule for the selector
    const sheet = styleEl.sheet;
    let found = false;

    for (let i = 0; i < sheet.cssRules.length; i++) {
      if (sheet.cssRules[i].selectorText === selector) {
        sheet.deleteRule(i);
        found = true;
        break;
      }
    }

    sheet.insertRule(`${selector} { ${styleStr} }`, sheet.cssRules.length);
  }

  // ---- Ensure viewport meta exists for mobile ----
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "viewport");
    meta.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
    );
    document.head.appendChild(meta);
  }

  // Listen to RN WebView messages
  document.addEventListener("message", handleMessageFromRN);

  // Disable old postMessage
  const origPost = window.postMessage;
  window.postMessage = function () {
    /* noop */
  };

  // ---- Expose API ----
  window.RNStyleBridge = {
    setCSS: setInjectedCSS,
    update: updateStyle, // update individual styles dynamically
  };

  // Bridge is ready
  post({ type: "bridgeReady" });
})();
