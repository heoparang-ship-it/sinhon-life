/* global module, process */

let appPromise;

function getApp() {
  process.env.SINHON_OS_SKIP_API_LISTEN = "true";
  appPromise ??= import("../apps/api/dist/server.js").then(({ createApp }) => createApp());
  return appPromise;
}

module.exports = async function handler(req, res) {
  const app = await getApp();

  return app(req, res);
};
