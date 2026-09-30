# External signer contract

iSide-Server separates public upload/session handling from native iOS signing.

When `SIGNING_PROVIDER=external`, iSide-Server calls:

`POST {SIGNER_URL}/v1/sign`

with a Bearer token from `SIGNER_TOKEN`.

Request:

```json
{
  "sessionId": "uuid",
  "app": {
    "name": "Example",
    "bundleId": "com.example.app",
    "version": "1.0"
  },
  "inputUrl": "temporary-presigned-GET-url",
  "output": {
    "url": "temporary-presigned-PUT-url",
    "method": "PUT",
    "headers": {
      "content-type": "application/octet-stream"
    }
  }
}
```

The signer downloads the IPA, performs only signing/provisioning it is authorized to perform, uploads the result to `output.url`, then returns:

```json
{
  "status": "ready",
  "installUrl": "optional-installation-url",
  "signing": {
    "authority": "display name",
    "status": "valid",
    "expiresAt": "2026-10-07T12:00:00Z"
  }
}
```

or:

```json
{"status":"waiting_for_user","message":"Complete provisioning on the device."}
```

or:

```json
{"status":"failed","error":"Reason"}
```

Never put Apple Account passwords, certificate private keys, B2 secrets, or shared enterprise credentials in frontend JavaScript or this public repository.
