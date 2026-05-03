export default {
  async fetch(request, env, ctx) {
    try {
      const { createServerEntry } = await import("./dist/server/index.js");
      return await createServerEntry.fetch(request, { env }, ctx);
    } catch (e) {
      return new Response("Error: " + e.message, { status: 500 });
    }
  },
};