export default {
  async fetch(request, env) {
    return env.MIDDLEWARE.fetch(request);
  },
};
