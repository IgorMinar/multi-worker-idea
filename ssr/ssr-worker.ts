export default {
  async fetch(request, env) {
    // Do SSR stuff - maybe talking to a backend database
    return new Response("SSR stuff");
  },
};
