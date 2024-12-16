# Multi-worker / Assets Middleware idea

This is a different take on [Pete's original proposal](https://github.com/petebacondarwin/multi-worker-idea/tree/main) that solves how to do asset middlewares
via multi-worker approach.

The gist of the idea is that asset middlewares can be modeled after procedences in the platform (mainly outbound and tail workers) as an incrementally addition to the platform without introduction of new major features.

It works as follows:

1. A user creates a new middleware worker with middleware logic. See the `middleware/` folder.

  - this is just a normal worker with one exception, it is not exposed via routes or custom domain
  - otherwise behaves like a regular worker
  - it has binidngs, triggers, and could even be smartly-placed however the effectiveness of that is questionable
  - it can be tailed, and logged, just like a normal worker
  - it defines a new type of binding called `origin`, which can be used to delegate requests to the worker which uses it as its middleware.
  - the `origin` binding uses the usual `Fetcher` interface.


2. A user creates a regular worker with static assets. See the `origin/` folder.

   - there is nothing special about this worker, except for middleware declaration
   - this worker can have bindings, triggers, static assets, and can be smartly placed 
   - the middleware declaration is designed after the precences set by [outbound](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/outbound-workers/) and [tail](https://developers.cloudflare.com/workers/observability/logs/tail-workers/) workers
   - when this origin worker is deployed, the internal superpipeline is constructed in a way where:
     - the middleware worker receives the request targetting this worker
     - the origin worker receives the request only if the middleware worker dispatches the request via the `origin` binding
     - the middleware intercepts all calls to static assets


## Trade offs

This designs is simple and incrementally compatible with the current platform, without us having to introduce a new abstraction or significant internal mechanism. This however means that we are making some trade offs, mainly:

1. Version skew protection and atomic deploys are not handled at all.

   - we however mostly don't handle it anywhere else in the platform, so we should take a holistic look at how to solve that rather than designing a one-of solution

2. General-purpose multi-worker solution is not part of this.

   - similar to version-skew protection, general-purpose multi-worker solution requires a bigger change in the underlying platform, and we can solve that separately from solving the assets middleware problem

