# iSide Server

Backend for the iSide IPA installer/PWA.

## What is working

- Backblaze B2 private-bucket integration.
- Direct browser-to-B2 presigned IPA uploads.
- Session metadata stored in B2, so the API does not need a separate database for the first version.
- Authenticated API expected by the iSide Vercel frontend:
  - `POST /v1/signing/session`
  - `POST /v1/signing/complete`
  - `GET /v1/signing/status?sessionId=...`
- `GET /health`
- `GET /v1/capabilities`
- Configurable external signer provider.
- Docker deployment.
- GitHub Actions type-check/build/Docker validation.

## Important

Backblaze storage is only one part of the system. With `SIGNING_PROVIDER=disabled`, uploads and sessions work but iSide will not pretend an IPA has been natively signed.

A real authorized signing/provisioning component must implement `docs/SIGNER_CONTRACT.md`, then set:

```env
SIGNING_PROVIDER=external
SIGNER_URL=https://...
SIGNER_TOKEN=...
```

## Environment

Copy `.env.example` and set secrets only on your hosting provider.

For the Backblaze bucket created for this project:

```env
B2_ENDPOINT=https://s3.us-east-005.backblazeb2.com
B2_REGION=us-east-005
B2_BUCKET=iside-temp
B2_KEY_ID=YOUR_KEY_ID
B2_APPLICATION_KEY=YOUR_APPLICATION_KEY
```

Never commit the key ID/application key pair to GitHub.

Generate a separate long random secret for:

```env
ISIDE_API_TOKEN=...
```

The same value is placed in the iSide Vercel project as `ISIDE_SIGNING_API_TOKEN`.

Once this server is deployed, the iSide Vercel project uses:

```env
ISIDE_SIGNING_API_URL=https://YOUR-SERVER
ISIDE_SIGNING_API_TOKEN=SAME_RANDOM_SECRET
```

## Local run

```bash
npm install
cp .env.example .env
npm run dev
```

## Flow

```text
iSide PWA
   |
   | POST /v1/signing/session
   v
iSide Server ---- creates presigned PUT ----> Backblaze B2
   ^                                      /
   |                                     /
Browser uploads IPA directly ------------

POST /v1/signing/complete
   |
   v
Signing provider
   |
   v
signed IPA -> B2 -> install/download result
```
