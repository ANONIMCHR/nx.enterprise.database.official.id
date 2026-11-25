const routes = {
  auth: () => import("./api-auth.js"),
  global: () => import("./api-global.js"),
  keys: () => import("./api-keys.js"),
  logs: () => import("./api-logs.js"),
  staff: () => import("./api-staff.js"),
  status: () => import("./api-status.js"),
  verify: () => import("./api-verify.js")
};

export async function dispatchVercelApi(route, req, res) {
  const loadHandler = Object.hasOwn(routes, route) ? routes[route] : null;
  if (!loadHandler) return res.status(404).json({ error: "API tidak ditemukan." });

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    return res.status(503).json({
      error: "Turso belum dikonfigurasi. Atur TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN di environment."
    });
  }
  if (route !== "verify" && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
    return res.status(503).json({
      error: "SESSION_SECRET belum valid. Atur secret minimal 32 karakter di environment."
    });
  }

  try {
    const { default: apiHandler } = await loadHandler();
    return await apiHandler(req, res);
  } catch (error) {
    console.error(`Vercel API ${route} failed:`, error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "API gagal. Periksa konfigurasi Turso dan log Function." });
    }
    return res.end();
  }
}
