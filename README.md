# Multi-worker idea

Consider the idea of an "Application" made up of multiple Workers: one Entry-Point Worker, and zero or more Auxiliary Workers.

* The external facing aspects of the Application is entirely defined by the Entry-Point Worker.
  This is the only one that can have triggers attached to it - e.g. Routes, Cron triggers, Queue consumers, Tail consumer, etc.
  It is also the only one that can be service bound to from outside this Worker (i.e. using a traditional `services` binding).

* Auxiliary Workers only exist in the context of the Application.
  They are effectively internal private Workers that can only be accessed via Service Bindings - either from the Entry-Point Worker or other Auxiliary Workers.
  The bindings between these Workers are versioned so that it is not possible to have version skew.
  Wrangler/EWC should deploy all the auxiliary Workers for a Worker in a single action.

Wrangler should follow `auxiliary_workers` bindings automatically so the user only has to think about the entry Worker.

[Diagram](https://www.tldraw.com/ro/zkDVgtFszd6N6WgJvea34?d=v-120.17.1512.857.page)

## Development

```bash
pnpm wrangler dev
```

Here Wrangler will run Miniflare using the top level `wrangler.toml` as its configuration.
But will also load the ssr auxiliary worker into the Miniflare setup and create a binding between the two.

## Deployment

```bash
pnpm wrangler deploy
```

Here Wrangler will start processing via the top level `wrangler.toml` as its configuration.
It will follow the auxiliary_workers bindings to find the other configurations,
And then deploy all the Workers in one go.
