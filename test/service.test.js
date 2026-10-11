import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';

import { createArtistProfileServer } from '../src/index.js';

let server;
let baseUrl;

before(async () => {
  server = createArtistProfileServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close(error => (error ? reject(error) : resolve())),
  );
});

test('reports service health', async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok',
    service: 'artist-profile-demo',
  });
});

test('lists profiles and applies filters', async () => {
  const listResponse = await fetch(`${baseUrl}/profiles`);
  const searchResponse = await fetch(`${baseUrl}/profiles?q=north`);
  const genreResponse = await fetch(`${baseUrl}/profiles?genre=jazz`);

  assert.equal(listResponse.status, 200);
  assert.equal((await listResponse.json()).total, 3);
  assert.deepEqual(await searchResponse.json(), {
    items: [
      {
        id: 'northbound',
        name: 'The Northbound',
        genre: 'Indie Rock',
        location: 'Manchester, United Kingdom',
        bio: 'Four-piece indie rock band writing widescreen songs about long journeys home.',
        featuredAlbum: 'Mile Markers',
      },
    ],
    total: 1,
  });
  assert.deepEqual(
    (await genreResponse.json()).items.map(profile => profile.id),
    ['sora-vale'],
  );
});

test('returns a profile by id and 404 responses for missing routes', async () => {
  const profileResponse = await fetch(`${baseUrl}/profiles/mira-lin`);
  const missingResponse = await fetch(`${baseUrl}/profiles/not-found`);
  const unknownResponse = await fetch(`${baseUrl}/unknown`);

  assert.equal(profileResponse.status, 200);
  assert.equal((await profileResponse.json()).name, 'Mira Lin');
  assert.equal(missingResponse.status, 404);
  assert.deepEqual(await missingResponse.json(), {
    error: 'Artist profile not found',
  });
  assert.equal(unknownResponse.status, 404);
  assert.deepEqual(await unknownResponse.json(), { error: 'Route not found' });
});
