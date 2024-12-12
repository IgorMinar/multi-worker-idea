# Multi-worker idea

Wrangler should follow `auxiliary_workers` bindings automatically so the user only has to think about the entry Worker.

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
