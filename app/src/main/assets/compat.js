(() => {
  // Compatibility helpers for older Android System WebView builds often used
  // inside virtual Android environments such as Virtual Master.
  const proto = globalThis.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
  if (proto && typeof proto.roundRect !== 'function') {
    proto.roundRect = function (x, y, width, height, radii = 0) {
      let r = Array.isArray(radii) ? Number(radii[0] || 0) : Number(radii || 0);
      r = Math.max(0, Math.min(r, Math.abs(width) / 2, Math.abs(height) / 2));
      const right = x + width;
      const bottom = y + height;
      this.moveTo(x + r, y);
      this.lineTo(right - r, y);
      this.quadraticCurveTo(right, y, right, y + r);
      this.lineTo(right, bottom - r);
      this.quadraticCurveTo(right, bottom, right - r, bottom);
      this.lineTo(x + r, bottom);
      this.quadraticCurveTo(x, bottom, x, bottom - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
      this.closePath();
      return this;
    };
  }

  if (!Array.prototype.at) {
    Object.defineProperty(Array.prototype, 'at', {
      configurable: true,
      writable: true,
      value(index) {
        index = Math.trunc(index) || 0;
        if (index < 0) index += this.length;
        return this[index];
      },
    });
  }

  // AbortSignal.timeout is newer than many embedded WebViews. CO-DUG only uses
  // it as a timeout signal, so a small standards-compatible fallback is enough.
  if (globalThis.AbortSignal && typeof AbortSignal.timeout !== 'function') {
    AbortSignal.timeout = function (ms) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), Math.max(0, Number(ms) || 0));
      return controller.signal;
    };
  }

  // Surface unexpected rendering errors instead of leaving an apparently empty
  // game field. This is intentionally local-only and does not send diagnostics.
  globalThis.addEventListener('error', (event) => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = `描画互換エラー: ${event.message || 'unknown'}`;
    toast.classList.add('show');
  });
})();
