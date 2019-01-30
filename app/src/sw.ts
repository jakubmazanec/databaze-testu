import urlRoot from './internals/urlRoot';


const CACHE = 'cache';

self.addEventListener('install', (event) => {
	console.log('The service worker is being installed...');

	event.waitUntil(precache());
});

self.addEventListener('activate', () => {
	console.log('The service worker is being activated...');
});


self.addEventListener('fetch', (event) => {
	console.log('The service worker is fetching:', event.request.url);

	event.respondWith(fromCache(event.request));
	event.waitUntil(update(event.request)/*.then(refresh)*/);
});

async function precache() {
	let cache = await caches.open(CACHE);

	return cache.addAll([
		`${urlRoot}/`,
		`${urlRoot}/dist/client.js`,
		`${urlRoot}/dist/client.css`,
		`${urlRoot}/assets/manifest.json`
	]);
}

async function fromCache(request: any) {
	let cache = await caches.open(CACHE);
	let matching = await cache.match(request);

	if (matching) {
		console.log('Serving from cache:', request.url);

		return matching;
	}

	return fetch(request);
}

async function update(request: any) {
	let cache = await caches.open(CACHE);
	let response = await fetch(request);

	console.log('Cached file was updated:', request.url);

	await cache.put(request, response.clone());

	return response;
}

/*async function refresh(response) {
	let clients = await self.clients.matchAll();

	clients.forEach((client) => {
		let message = {
			type: 'refresh',
			url: response.url,
			eTag: response.headers.get('ETag')
		};

		console.log('Sending refresh message for:', response.url);

		client.postMessage(JSON.stringify(message));
	});
}*/
