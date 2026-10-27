export default {
  async fetch(request, env, ctx) {
    return new Response("Rahul Saridena Website Service Active", {
      status: 200,
      headers: { "content-type": "text/plain" }
    });
  }
};
