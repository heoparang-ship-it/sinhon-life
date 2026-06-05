/* global module */

let appPromise;

function getApp() {
  appPromise ??= import("../apps/api/dist/server.js").then(({ createApp }) => createApp());
  return appPromise;
}

module.exports = async function handler(req, res) {
  const app = await getApp();

  return app(req, res);
};
