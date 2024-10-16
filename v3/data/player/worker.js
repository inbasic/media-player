/* File Handler */
self.addEventListener('fetch', e => {
  if (e.request.url.endsWith('/process-local-files')) {
    e.request.formData().then(body => {
      const files = body.getAll('file');
      console.log(files);
    });
    e.respondWith(new Response());
  }
});

self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('install', () => self.skipWaiting());
