# URL Shortener

An Express and TypeScript service that turns a long URL into a short link and redirects visitors to the original. It offers a JSON API and a small EJS web form that share the same core logic.

<!-- Add a screenshot of the form here: ![URL Shortener form](docs/form.png) -->

## Features

- JSON endpoint and an HTML form for creating short links
- 8-character random codes, with a check that regenerates on collision
- `302` redirects with a click counter per link
- Server-side validation with Zod (the form's `type="url"` input is only a convenience)
- A clean `404` for unknown codes

## Tech stack

Node.js, Express 5, TypeScript, EJS, Zod, nanoid

## Getting started

Requires Node.js 18 or newer.

```bash
git clone https://github.com/YOUR-USERNAME/url-shortener.git
cd url-shortener
npm install
npm run dev
```

Open `http://localhost:3000` for the form. The API is on the same port.

## Usage

**Web form:** open the home page, paste a URL and press the button. The result page shows your short link.

**API:**

```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com/some/long/path"}'
```

```json
{ "shortUrl": "http://localhost:3000/aB3dE9xZ" }
```

Visiting the short link redirects to the original URL.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | The web form |
| POST | `/shorten` | Create a short link from JSON, returns `shortUrl` |
| POST | `/shorten-form` | Create a short link from the form, renders the result page |
| GET | `/:code` | `302` redirect to the original URL, or `404` if the code is unknown |

Invalid input is rejected with `400` on both creation routes.

## Project structure

```
src/
  index.ts          routes and short-code logic
views/
  index.ejs         the form
  result.ejs        the result page
```

## Design decisions and edge cases

- **Codes are random and unrelated to the destination URL.** A `while` loop checks the store and regenerates until the code is unused, so a collision can never silently overwrite an existing link.
- **One shared function creates links.** Both creation routes call it. Validation stays in each route because a failure is answered differently (JSON for the API, a rendered page for the form).
- **`302`, not `301`.** A permanent redirect gets cached by browsers, and later clicks would never reach the server to be counted.
- **Server-side validation always runs,** even though the form's `type="url"` input blocks obvious mistakes in the browser. Anyone can send a request that skips the form.
- **The short URL is built from the incoming request** (`req.protocol` and `req.host`), not hardcoded, so it keeps working after deployment.
- **`/:code` is registered last,** so it cannot swallow the other routes.

## Limitations and next steps

- Links are stored in memory and disappear on restart. A database is the next step.
- Validation is structural. A URL such as `http://www.something.cod` is accepted because the domain is never checked. A real existence check is planned.
- Click counts are tracked but not yet exposed through an endpoint.
- No automated tests yet.

## License

MIT
