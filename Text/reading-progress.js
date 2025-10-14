(() => {
  /**
   * Reading Progress Reporter
   * Reports reading percentage as user scrolls through EPUB content
   * Designed for integration with React Native WebView
   */

  const PROGRESS_INTERVAL = 500; // ms between progress updates
  let lastReportedProgress = -1;
  let progressTimer = null;

  // Helper — calculate progress percentage
  function getReadingProgress() {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    return Math.min(Math.max(progress, 0), 100);
  }

  // Helper — send progress to React Native or log in browser
  function reportProgress(progress) {
    const rounded = Math.round(progress);
    if (rounded === lastReportedProgress) return; // skip duplicates
    lastReportedProgress = rounded;

    const payload = JSON.stringify({
      type: "progress",
      progress: rounded,
      timestamp: Date.now(),
    });

    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(payload);
    } else {
      console.log("📖 Progress:", rounded + "%");
    }
  }

  // Listen for scroll events — throttled by interval
  function startTracking() {
    if (progressTimer) clearInterval(progressTimer);
    progressTimer = setInterval(() => {
      const progress = getReadingProgress();
      reportProgress(progress);
    }, PROGRESS_INTERVAL);
  }

  function stopTracking() {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  // React Native can control tracking (optional)
  window.ReadingProgress = {
    start: startTracking,
    stop: stopTracking,
    get: getReadingProgress,
  };

  // Auto-start when DOM is ready
  document.addEventListener("DOMContentLoaded", startTracking);
})();
