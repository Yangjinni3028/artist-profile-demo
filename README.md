# artist-profile-demo

A dependency-free Node.js HTTP service that serves demo artist profiles.

## Run locally

From the repository root:

```powershell
yarn workspace artist-profile-demo start
```

The service listens on port `8081` by default. Set `PORT` to use another valid port.

## API

| Method | Endpoint                  | Description                                   |
| ------ | ------------------------- | --------------------------------------------- |
| `GET`  | `/health`                 | Returns service health and name.              |
| `GET`  | `/profiles`               | Lists artist profiles.                        |
| `GET`  | `/profiles?q=<name>`      | Searches artist names case-insensitively.     |
| `GET`  | `/profiles?genre=<genre>` | Filters profiles by genre case-insensitively. |
| `GET`  | `/profiles/:id`           | Returns one artist profile.                   |

Filters can be combined, for example: `/profiles?q=sora&genre=jazz`.

## Test

```powershell
yarn workspace artist-profile-demo test
```

## Container image

```powershell
docker build -t artist-profile-demo packages/artist-profile-demo
docker run --rm -p 8081:8081 artist-profile-demo
```
