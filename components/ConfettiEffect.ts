import confetti from "canvas-confetti";

// Trigger a highly romantic confetti burst with hearts and warm colors
export const triggerYesConfetti = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Confetti from left and right
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#f43f5e", "#fda4af", "#fb7185", "#ff007f", "#ffccd5"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#f43f5e", "#fda4af", "#fb7185", "#ff007f", "#ffccd5"],
    });
  }, 250);
};

// Trigger a gentle, floating heart and sparkle shower for the final page
export const triggerSuccessConfetti = () => {
  const end = Date.now() + 4 * 1000;

  // Colors: rose, pink, gold, light pink
  const colors = ["#f43f5e", "#fda4af", "#fb7185", "#fbbf24", "#fef08a"];

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};
