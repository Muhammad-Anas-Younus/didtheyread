// Handle authentication in background
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GOOGLE_AUTH") {
    handleGoogleAuth(sendResponse);
    return true; // Indicates we will respond asynchronously
  }
});

async function handleGoogleAuth(sendResponse: (response: any) => void) {
  try {
    const manifest = chrome.runtime.getManifest() as chrome.runtime.ManifestV3;

    if (!manifest.oauth2) {
      throw new Error("OAuth2 configuration not found in manifest");
    }

    // Get the proper redirect URL for Chrome extensions
    const redirectUrl = chrome.identity.getRedirectURL();

    const url = new URL("https://accounts.google.com/o/oauth2/auth");

    url.searchParams.set("client_id", manifest.oauth2.client_id);
    url.searchParams.set("response_type", "id_token");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("redirect_uri", redirectUrl);
    url.searchParams.set(
      "scope",
      manifest.oauth2.scopes?.join(" ") || "openid email profile"
    );

    chrome.identity.launchWebAuthFlow(
      {
        url: url.href,
        interactive: true,
      },
      async (redirectedTo) => {
        if (chrome.runtime.lastError) {
          console.error("Auth error:", chrome.runtime.lastError);
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else if (redirectedTo) {
          try {
            // Extract the ID token from the redirected URL
            const redirectUrl = new URL(redirectedTo);
            const fragment = redirectUrl.hash.substring(1); // Remove the # character
            const params = new URLSearchParams(fragment);
            const idToken = params.get("id_token");

            if (idToken) {
              sendResponse({ success: true, idToken: idToken });
            } else {
              sendResponse({
                success: false,
                error: "No ID token found in response",
              });
            }
          } catch (error) {
            console.error("Error processing auth response:", error);
            sendResponse({ success: false, error: (error as Error).message });
          }
        } else {
          sendResponse({ success: false, error: "No redirected URL received" });
        }
      }
    );
  } catch (error) {
    console.error("Error in handleGoogleAuth:", error);
    sendResponse({ success: false, error: (error as Error).message });
  }
}
