import { expect, it } from "vitest";
import { umamiSendRequest } from "./umami-send";

const SEND_URL = "https://stats.example.com/api/send";

function send(body: string, headers: Record<string, string> = {}) {
  return new Request("https://blog.example.com/api/send", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
}

it("forwards an event body unchanged, keeping the Cloudflare headers", async () => {
  const body = JSON.stringify({
    type: "event",
    payload: { website: "site-id", url: "/posts/a" },
  });
  const forwarded = await umamiSendRequest(
    send(body, {
      "cf-connecting-ip": "203.0.113.7",
      "cf-ipcountry": "CN",
      "user-agent": "Firefox",
    }),
    SEND_URL,
  );

  expect(forwarded.url).toBe(SEND_URL);
  expect(forwarded.method).toBe("POST");
  expect(forwarded.headers.get("user-agent")).toBe("Firefox");
  expect(forwarded.headers.get("cf-connecting-ip")).toBe("203.0.113.7");
  expect(forwarded.headers.get("cf-ipcountry")).toBe("CN");
  expect(await forwarded.text()).toBe(body);
});

it("forwards a body that is not an Umami event unchanged", async () => {
  for (const body of ["not json", "[1,2]", '{"type":"event"}']) {
    const forwarded = await umamiSendRequest(
      send(body, { "cf-connecting-ip": "203.0.113.7" }),
      SEND_URL,
    );
    expect(await forwarded.text()).toBe(body);
  }
});

it("forwards untouched when there is no visitor IP", async () => {
  const body = JSON.stringify({ type: "event", payload: { url: "/" } });
  const forwarded = await umamiSendRequest(send(body), SEND_URL);

  expect(forwarded.url).toBe(SEND_URL);
  expect(await forwarded.text()).toBe(body);
});
