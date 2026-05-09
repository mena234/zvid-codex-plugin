---
sidebar_position: 2
---

# Authentication

Programmatic Zvid API access uses API keys. Include your key in the `x-api-key` header on API-key compatible endpoints such as render submission, job lookup, profile lookup, credits, and API-key management.

## Creating an API Key

Create API keys in the [Zvid Dashboard](https://dash.zvid.io):

1. Log in to your Zvid account.
2. Open **API Access**.
3. Click **Create API Key**.
4. Enter a descriptive name, such as `Production Server`.
5. Copy the generated key immediately.

:::warning Important
The full API key is shown only once. If you lose it, revoke the old key and create a new one.
:::

## Using API Keys

Send the API key in the `x-api-key` header:

```bash
curl -X GET https://api.zvid.io/api/user/profile \
  -H "x-api-key: zvid_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
```

```javascript
const response = await fetch("https://api.zvid.io/api/user/profile", {
  headers: {
    "x-api-key":
      "zvid_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
});

const data = await response.json();
console.log(data);
```

## API Key Format

Zvid API keys use this format:

```text
zvid_<64-character-hexadecimal-string>
```

- `zvid_`: Zvid production key prefix.
- `64-character-hexadecimal-string`: Secret key material using `a-f` and `0-9`.

## Security Recommendations

- Store API keys in server-side environment variables or a secrets manager.
- Do not expose API keys in browser code, mobile apps, public repos, logs, or support screenshots.
- Use separate keys for production and development.
- Revoke keys that are unused or suspected to be exposed.

## Need Help?

If authentication fails:

1. Verify the key value is correct.
2. Confirm the header name is exactly `x-api-key`.
3. Check that the key has not been revoked.
4. Contact [help@zvid.io](mailto:help@zvid.io).
