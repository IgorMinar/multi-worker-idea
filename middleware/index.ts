export default {
  // Do middleware stuff
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "old-path") {
      // Maybe a redirect
      return Response.redirect(new URL("new-path", url));
    }

    // Delegate to the SSR worker
    const response: Response = await env.SSR.fetch(request);

    // Maybe add a response header
    if (response.headers.get("Content-Type")?.startsWith("image/")) {
      response.headers.append("Cache-control", "max-age=180, public");
    }

    return response;
  },
};
