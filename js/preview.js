// ─── CARD PREVIEW (mouse hover tooltip) ─────────────────────────
// This is handled primarily by CSS hover + .card__hover-panel
// This file handles edge cases and positioning

// Ensure first/last cards in row expand correctly
document.addEventListener('DOMContentLoaded', () => {
  // Adjust transform origin on scroll
  const updateCardOrigins = () => {
    document.querySelectorAll('.row__slider').forEach(slider => {
      const cards = slider.querySelectorAll('.card');
      if (!cards.length) return;
      cards.forEach((card, i) => {
        // Reset
        card.style.transformOrigin = '';
        const rect      = card.getBoundingClientRect();
        const sliderRect = slider.getBoundingClientRect();
        const isFirst   = rect.left - sliderRect.left < 10;
        const isLast    = sliderRect.right - rect.right < 10;
        if (isFirst) card.style.transformOrigin = 'left center';
        else if (isLast) card.style.transformOrigin = 'right center';
        else card.style.transformOrigin = 'center center';
      });
    });
  };

  document.addEventListener('mousemove', () => {}, { passive: true });
  // Debounced resize
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(updateCardOrigins, 100);
  });
});
