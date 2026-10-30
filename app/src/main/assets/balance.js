// Shared gameplay tuning for the offline Android build.
(function (root) {
  const ACCELERATOR_KEY = "codug5-accelerator";
  let acceleratorEnabled = false;
  try { acceleratorEnabled = root.localStorage?.getItem(ACCELERATOR_KEY) === "1"; } catch {}
  function updateAcceleratorButton() {
    if (typeof document === "undefined") return;
    const button = document.getElementById("acceleratorBtn");
    if (!button) return;
    button.textContent = acceleratorEnabled ? "⚡ x2 ON" : "⚡ x2 OFF";
    button.setAttribute("aria-pressed", acceleratorEnabled ? "true" : "false");
  }
  function setAccelerator(enabled) {
    acceleratorEnabled = Boolean(enabled);
    try { root.localStorage?.setItem(ACCELERATOR_KEY, acceleratorEnabled ? "1" : "0"); } catch {}
    updateAcceleratorButton();
    return acceleratorEnabled;
  }
  function installAcceleratorButton() {
    if (typeof document === "undefined") return;
    const host = document.querySelector(".hudButtons");
    if (!host || document.getElementById("acceleratorBtn")) return;
    const button = document.createElement("button");
    button.className = "mini";
    button.id = "acceleratorBtn";
    button.type = "button";
    button.addEventListener("click", (event) => { event.stopPropagation(); setAccelerator(!acceleratorEnabled); });
    host.insertBefore(button, host.firstChild);
    updateAcceleratorButton();
  }
  const tuning = {
    duration: 0.5, maxDuration: 0.9, cooldown: 0.32, minCooldown: 0.16,
    heatGain: 0.55, minHeatGain: 0.3, coolRate: 0.5, maxCoolRate: 1.1,
    maxHp: 8, maxOreMultiplier: 3.5, maxTipReach: 34, moveDelay: 0.14,
    acceleratorFactor() { return acceleratorEnabled ? 2 : 1; },
    setAccelerator,
    stepLane(current, target) { return Math.max(0, Math.min(2, current + Math.sign(target - current))); },
    barrierRow(index, depth) {
      if (depth < 1500 || index % 24 < 6) return false;
      const spacing = depth < 15000 ? 12 : depth < 40000 ? 8 : depth < 70000 ? 6 : depth < 90000 ? 5 : 4;
      return index % spacing === spacing - 1;
    },
    extraObstacleChance(depth) {
      if (depth < 600) return 0;
      const progress = Math.min(1, Math.max(0, depth - 600) / (100000 - 600));
      return 0.72 * Math.sqrt(progress);
    },
    oreValue(value, multiplier, combo) { return Math.round(value * 1.8 * multiplier * (1 + Math.min(2, Math.max(0, combo - 1) * 0.12))); },
    researchTarget(level) { return Math.min(18, 5 + level * 3); },
    encounter(index, seed) {
      const offset = index % 24;
      if (index < 24 || offset >= 6) return null;
      const block = Math.floor(index / 24);
      const kind = ["vein", "slalom", "supply"][(block + Math.abs(seed % 3)) % 3];
      return { kind, offset, lane: (block + Math.abs(seed % 3) + Math.floor(offset / 2)) % 3 };
    },
    speed(depth) {
      const d = Math.max(0, depth);
      const progress = Math.log1p(d / 5000) / Math.log1p(100000 / 5000);
      const normalSpeed = Math.min(78, 16 + 62 * progress);
      return normalSpeed * (acceleratorEnabled ? 2 : 1);
    },
    activationHeat(heat) { return 0.075 + heat * 0.035; },
    cooldownFactor(stage) { return [1, 1.5, 2.2, 3.2][stage]; },
    coolingFactor(stage, recovering = false) { return [0.8, 0.7, 0.6, 0.5][stage] * (recovering ? 0.2 : 1); },
    itemChance(depth) { return depth < 250 ? 0 : Math.min(0.14, 0.065 + depth / 80000); },
    comboWindow(depth) { return Math.max(3, 5.5 - Math.max(0, depth) / 40000); },
  };
  root.CODUG_BALANCE = Object.freeze(tuning);
  if (typeof document !== "undefined") installAcceleratorButton();
})(globalThis);
