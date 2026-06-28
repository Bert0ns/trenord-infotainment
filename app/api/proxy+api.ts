export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { url, method, headers, body } = payload;

    if (!url) {
      return new Response(
        JSON.stringify({ error: "Missing URL in proxy request" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // SECURITY: Prevent SSRF by ensuring the proxy only forwards to Trenord domains
    const allowedDomains = [
      "https://preprod.mp.trenord.it",
      "https://cloud.mp.trenord.it",
    ];
    const isAllowed = allowedDomains.some((domain) => url.startsWith(domain));

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Forbidden target URL" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(url, {
      method: method || "GET",
      headers: headers || {},
      body: body || undefined,
    });

    const responseData = await response.text();

    return new Response(responseData, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
