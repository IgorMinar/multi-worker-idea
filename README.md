# Multi-worker / Assets Middleware idea

This repository contains a proposal for solving the Workers Assets middleware problem.
The example shows ability to run code in front of static assets, without compromising ability to run code behind static assets as well, or ability to place the middleware code at the edge, while the backend code could be smartly placed nearby the data it operates on.

This is a different take on [Pete's original proposal](https://github.com/petebacondarwin/multi-worker-idea/tree/main) that solves how to do asset middlewares via a multi-worker approach designed by following the existing precedences set by [outbound](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/outbound-workers/) and [tail](https://developers.cloudflare.com/workers/observability/logs/tail-workers/) workers.

The gist of the idea is that asset middlewares can be modeled after precedences in the platform (mainly outbound and tail workers) as an incrementally addition to the platform without introduction of new major features.

It works as follows:

1. A user creates a new middleware worker with middleware logic. See the `middleware/` folder.

  - This is just a normal worker with one exception, it is not exposed via routes or a custom domain, requests are routed to it only because the origin worker declares this the `middleware/` worker as it's "middleware" in wrangler.toml.
  - Otherwise behaves like a regular worker.
  - It has bindings, triggers, and could even be smartly-placed however if it makes sense.
  - It can be tailed, and logged, just like a normal worker.
  - (optionally) It defines a new type of binding called `origin`, which can be used to delegate requests to the worker which uses it as its middleware. The `origin` binding uses the usual `Fetcher` interface that behaves similarly to service-bindings except that the middleware doesn't need to know the target of the service-binding, which makes it reusable across multiple origin workers.
    - Alternatively, any fetch with the same origin is treated as a call to the origin worker just like the original Workers CDN middleware works, but this feels magical. Explicitness would help here and make the code easier to understand and easier to test.
    - Another alternative is to use regular service-binding to the `origin/` but that will tightly couple the middleware worker to the origin worker, which will make re-usability of middleware workers across multiple workers difficult.

2. A user creates a regular worker with static assets. See the `origin/` folder.

   - There is nothing special about this worker, except for middleware declaration in wrangler.toml.
   - This worker can have bindings, triggers, static assets, and can be smartly placed.
   - The middleware declaration is designed by following the existing precedences set by [outbound](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/outbound-workers/) and [tail](https://developers.cloudflare.com/workers/observability/logs/tail-workers/) workers.
   - When this origin worker is deployed, the internal super-pipeline is constructed in a way where:
     - The middleware worker receives the request targeting this worker.
     - The origin worker receives the request only if the middleware worker dispatches the request via a same-origin-`fetch` (or the `origin` binding).
     - The middleware intercepts all calls to static assets.


## Trade offs

This design is simple and incrementally compatible with the current platform, without us having to introduce a new abstraction or significant internal mechanism. This however means that we are making some trade offs, mainly:

1. Version skew protection and atomic deploys are not handled at all.

   - we however mostly don't handle it anywhere else in the platform, so we should take a holistic look at how to solve that rather than designing a one-of solution

2. General-purpose multi-worker solution is not part of this.

   - similar to version-skew protection, general-purpose multi-worker solution requires a bigger change in the underlying platform, and we can solve that separately from solving the assets middleware problem
