(() => {
  if (globalThis.__CODUG_OFFLINE__) return;
  globalThis.__CODUG_OFFLINE__ = true;

  const json = (value, status = 200) => Promise.resolve(new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  }));
  const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const player = () => {
    let value = localStorage.getItem("codug-player-v1");
    if (!value) {
      value = `local-${id()}`;
      localStorage.setItem("codug-player-v1", value);
    }
    return value;
  };
  player();

  // CO-DUG's original API contract is fulfilled entirely on-device.
  // No request is ever forwarded to Supabase or another web service.
  globalThis.fetch = (input, init = {}) => {
    let url;
    try {
      const raw = typeof input === "string" ? input : input.url;
      url = new URL(raw, location.href);
    } catch {
      return json({ error: "offline only" }, 400);
    }
    const route = url.searchParams.get("route");
    if (url.pathname.endsWith("/api/codug") || route) {
      if (route === "run") return json({ player: player(), run: `local-run-${id()}` });
      if (route === "profile") return json({ points: Number(localStorage.getItem("codug3-total-points") || 0) });
      if (route === "result") {
        let body = {};
        try { body = JSON.parse(init.body || "{}"); } catch {}
        const result = {
          id: `local-result-${id()}`,
          token: `local-${id()}`,
          depth: Number(body.depth || 0),
          points: Number(body.points || 0),
          at: Date.now(),
        };
        localStorage.setItem("codug-local-last-result", JSON.stringify(result));
        return json(result);
      }
      if (route === "leaderboard") return json({ entries: [] });
      return json({ error: "offline route not available" }, 404);
    }
    return json({ error: "network disabled in CO-DUG Android" }, 403);
  };

  const localize = () => {
    const style = document.createElement("style");
    style.textContent = `
      #rankingBtn,#introRanking,#resultRanking,#rankingOverlay,#submissionStatus,#submitRetry,#shareBtn,#sharedOverlay,
      .account-rank,.rank-track,.rank-note { display:none !important; }
    `;
    document.head.appendChild(style);
    const nameNote = document.querySelector(".pilotLabel span");
    if (nameNote) nameNote.textContent = "端末内にのみ保存";

    const toast = document.getElementById("toast");
    if (toast) {
      const replace = () => {
        const map = {
          "オンライン接続を確認中…": "ローカルデータを準備中…",
          "オンライン接続済み // 掘削開始": "ローカル保存 // 掘削開始",
          "オンライン登録なしの練習プレイ": "ローカル保存 // 掘削開始",
          "結果を署名中…": "結果を保存中…",
        };
        if (map[toast.textContent]) toast.textContent = map[toast.textContent];
      };
      new MutationObserver(replace).observe(toast, { childList: true, subtree: true, characterData: true });
      replace();
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", localize, { once: true });
  else localize();
})();
