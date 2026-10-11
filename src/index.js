import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

const port = Number.parseInt(process.env.PORT ?? '8081', 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const profiles = [
  {
    id: 'mira-lin',
    name: 'Mira Lin',
    genre: 'Electronic',
    location: 'Taipei, Taiwan',
    bio: 'Producer and live performer combining analogue synthesizers with field recordings.',
    featuredAlbum: 'Night Signals',
  },
  {
    id: 'northbound',
    name: 'The Northbound',
    genre: 'Indie Rock',
    location: 'Manchester, United Kingdom',
    bio: 'Four-piece indie rock band writing widescreen songs about long journeys home.',
    featuredAlbum: 'Mile Markers',
  },
  {
    id: 'sora-vale',
    name: 'Sora Vale',
    genre: 'Jazz',
    location: 'Osaka, Japan',
    bio: 'Saxophonist and composer exploring the space between modern jazz and ambient music.',
    featuredAlbum: 'Open Sky',
  },
];

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(body));
}

function matchesProfile(profile, query, genre) {
  const matchesQuery = !query || profile.name.toLowerCase().includes(query);
  const matchesGenre = !genre || profile.genre.toLowerCase() === genre;
  return matchesQuery && matchesGenre;
}

export function createArtistProfileServer() {
  return createServer((request, response) => {
    const url = new URL(
      request.url ?? '/',
      `http://${request.headers.host ?? 'localhost'}`,
    );

    if (request.method === 'GET' && url.pathname === '/health') {
      sendJson(response, 200, { status: 'ok', service: 'artist-profile-demo' });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/profiles') {
      const query = url.searchParams.get('q')?.trim().toLowerCase();
      const genre = url.searchParams.get('genre')?.trim().toLowerCase();
      const items = profiles.filter(profile =>
        matchesProfile(profile, query, genre),
      );
      sendJson(response, 200, { items, total: items.length });
      return;
    }

    const profileMatch = url.pathname.match(/^\/profiles\/([^/]+)$/);
    if (request.method === 'GET' && profileMatch) {
      const profile = profiles.find(
        item => item.id === decodeURIComponent(profileMatch[1]),
      );

      if (profile) {
        sendJson(response, 200, profile);
      } else {
        sendJson(response, 404, { error: 'Artist profile not found' });
      }
      return;
    }

    sendJson(response, 404, { error: 'Route not found' });
  });
}

function startServer() {
  const server = createArtistProfileServer();
  server.listen(port, () => {
    console.log(`artist-profile-demo listening on http://localhost:${port}`);
  });

  function shutdown(signal) {
    console.log(`${signal} received, closing HTTP server`);
    server.close(error => {
      if (error) {
        console.error(error);
        process.exitCode = 1;
      }
    });
  }

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  startServer();
}
