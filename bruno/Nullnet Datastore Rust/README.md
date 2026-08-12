# Nullnet Datastore Rust Bruno Collection

This collection is organized for Bruno and is safe to keep in Git.

## Environments

- `local`
- `qa`

## Variables

- Normal variables live in `environments/*.bru` and cover values such as `baseUrl`, `appUrl`, `defaultEntity`, and sample resource ids.
- Secret variables are declared with `vars:secret` and should be filled in Bruno after opening the collection: `loginEmail`, `loginPassword`, `fallbackToken`, `syncEndpointUsername`, `syncEndpointPassword`.

## Flow

1. Select `local` or `qa` in Bruno.
2. Populate the secret variables in the active environment.
3. Run `Authenticate Organization`.
4. The login request stores the bearer token in runtime variable `sessionToken`.
5. Run the remaining requests, which inherit bearer auth from the collection.

## Notes

- `fallbackToken` is optional and reserved for manual troubleshooting if you need to work around login outside the standard flow.
- Request ids such as `sampleId` and `bookingFeedbackId` stay editable per environment.
