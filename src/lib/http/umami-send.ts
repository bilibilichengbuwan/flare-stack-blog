/**
 * The request the `/api/send` proxy forwards to Umami.
 *
 * The request is forwarded unchanged. Umami reads the visitor's IP from the
 * `cf-connecting-ip` header and the location from the `cf-ipcountry` /
 * `cf-region-code` / `cf-ipcity` headers, all of which Cloudflare sets on the
 * inbound request and the proxy passes through.
 *
 * Do not put the IP into the event payload: with `payload.ip` set, Umami
 * skips the provider headers and does a MaxMind database lookup instead, but
 * the Vercel build skips the geo setup (`build-geo.js` exits early on
 * Vercel), so the database file is absent, the lookup throws, and every
 * collected event answers 500.
 */
export async function umamiSendRequest(
  request: Request,
  sendUrl: string,
): Promise<Request> {
  return new Request(sendUrl, request);
}
