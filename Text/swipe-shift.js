(() => {
  const maxShift = window.innerWidth * 0.4; // max horizontal shift
  const threshold = 10; // distance before confirming gesture
  const swipeTrigger = maxShift * 0.9; // trigger event threshold

  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let isDragging = false;
  let triggered = false;
  let lockDirection = null; // 'horizontal' | 'vertical' | null
  let tapTimeout = null;
  const TAP_MAX_MOVEMENT = 20; // px threshold for tap
  const TAP_MAX_TIME = 600; // ms threshold for tap duration
  let touchStartTime = 0;

  const body = document.body;

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    isDragging = true;
    triggered = false;
    lockDirection = null;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = 0;
    currentY = 0;
    touchStartTime = Date.now();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    // Decide gesture direction after small movement
    if (!lockDirection && Math.hypot(deltaX, deltaY) > threshold) {
      lockDirection =
        Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }

    const shiftX = Math.max(Math.min(deltaX, maxShift), -maxShift);
    const shiftY = Math.max(Math.min(deltaY, maxShift), -maxShift);
    currentX = shiftX;
    currentY = shiftY;
    // Only handle horizontal gestures
    if (lockDirection === "horizontal") {
      e.preventDefault();
      body.style.transform = `translateX(${shiftX}px)`;
      body.style.transition = "none";
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    isDragging = false;

    const duration = Date.now() - touchStartTime;
    const absShiftX = Math.abs(currentX);
    const absShiftY = Math.abs(currentY);

    // ✅ Detect tap
    if (
      absShiftX < TAP_MAX_MOVEMENT &&
      absShiftY < TAP_MAX_MOVEMENT &&
      duration < TAP_MAX_TIME
    ) {
      console.log("👆 Tap detected!", absShiftX, absShiftY, duration);
    }

    // ✅ Detect swipe direction
    if (absShiftX > swipeTrigger && !triggered) {
      triggered = true;
      const direction = currentX > 0 ? "right" : "left";
      console.log(`✅ Swipe ${direction} detected!`);
    }

    // Smoothly reset
    body.style.transition = "transform 0.35s ease";
    body.style.transform = "translateX(0)";
  };

  // Attach listeners
  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd);
})();
