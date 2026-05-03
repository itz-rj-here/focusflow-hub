import { createServerEntry } from "./dist/server/index.js";

export default {
  async fetch(request, env, ctx) {
    return await createServerEntry.fetch(request, { env }, ctx);
  },
};