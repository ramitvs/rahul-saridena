/**
 * Entry point for Cloudflare Workers / Node service
 */
module.exports = {
  async fetch(request, env, ctx) {
    return new Response("Rahul Saridena Website Service Active", { status: 200 });
  }
};

