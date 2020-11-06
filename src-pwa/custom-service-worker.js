/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import * as strats from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import { Queue } from "workbox-background-sync";

//// config
precacheAndRoute(self.__WB_MANIFEST);
let backgroundSyncSupported = "sync" in self.registration ? true : false;
let createPostQueue = null;
if (backgroundSyncSupported) {
  createPostQueue = new Queue("createPostQueue", {
    // https://github.com/GoogleChrome/workbox/issues/2044#issuecomment-486390207
    // https://github.com/GoogleChrome/workbox/issues/1982
    onSync: async ({ queue }) => {
      let entry;
      while ((entry = await queue.shiftRequest())) {
        try {
          await fetch(entry.request);
          console.log("Replay successful for request", entry.request);
          // https://stackoverflow.com/questions/42127148/service-worker-communicate-to-clients
          const channel = new BroadcastChannel("sw-messages");
          channel.postMessage({ msg: "offline-post-uploaded" });
        } catch (error) {
          console.error("Replay failed for request", entry.request, error);

          // Put the entry back in the queue and re-throw the error:
          await queue.unshiftRequest(entry);
          throw error;
        }
      }
      console.log("Replay complete!");
    }
  });
}

//// strategies

// Google Fonts
// https://developers.google.com/web/tools/workbox/guides/common-recipes#google_fonts
// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new strats.StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets"
  })
);
// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new strats.CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30
      })
    ]
  })
);

// Posts: network first
registerRoute(
  ({ url }) => url.pathname.startsWith("/posts"),
  new strats.NetworkFirst()
);

// catch all: stale while revalidate
registerRoute(
  ({ url }) => url.origin.startsWith("http"),
  new strats.StaleWhileRevalidate()
);

// queue POST and DELETE calls
if (backgroundSyncSupported) {
  self.addEventListener("fetch", event => {
    if (
      event.request.url.endsWith("/posts") &&
      (event.request.method === "POST" || event.request.method === "DELETE")
    ) {
      // Clone the request to ensure it's safe to read when
      // adding to the Queue.
      const promiseChain = fetch(event.request.clone()).catch(err => {
        console.log("err", err);
        return createPostQueue.pushRequest({ request: event.request });
      });

      event.waitUntil(promiseChain);
    }
  });
}
