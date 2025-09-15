import { supabase } from "./lib/supabase";

// Handle authentication in background
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GOOGLE_AUTH") {
    handleGoogleAuth(sendResponse);
    return true; // Indicates we will respond asynchronously
  }

  if (message.type === "STORE_EMAIL_DATA") {
    handleStoreEmailData(message.data, sendResponse);
    return true; // Indicates we will respond asynchronously
  }

  if (message.type === "GET_USER_SESSION") {
    handleGetUserSession(sendResponse);
    return true; // Indicates we will respond asynchronously
  }

  if (message.type === "SET_BADGE_TEXT") {
    chrome.action.setBadgeText({ text: message.text });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
    sendResponse({ success: true });
  }
});

async function handleStoreEmailData(
  emailData: any,
  sendResponse: (response: any) => void
) {
  try {
    console.log("🔵 Background: Storing email data...", emailData);

    // Get user session from storage
    const result = await chrome.storage.local.get(["supabase_session"]);
    const session = result.supabase_session;

    if (!session || !session.user) {
      sendResponse({
        success: false,
        error: "No authenticated user found",
      });
      return;
    }

    // Set the session on supabase client
    await supabase.auth.setSession(session);

    // Insert email data
    const { data, error } = await supabase
      .from("emails")
      .insert({
        tracking_id: emailData.trackingId,
        recipients: emailData.recipients,
        subject: emailData.subject,
        user_id: session.user.id,
        sender_email: session.user.email,
      })
      .select();

    if (error) {
      console.error("🔴 Database error:", error);
      sendResponse({
        success: false,
        error: error.message,
      });
      return;
    }

    console.log("🟢 Email stored successfully:", data);
    sendResponse({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("🔴 Error storing email:", error);
    sendResponse({
      success: false,
      error: (error as Error).message,
    });
  }
}

async function handleGetUserSession(sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get(["supabase_session"]);
    const session = result.supabase_session;

    if (session && session.user) {
      sendResponse({
        success: true,
        user: session.user,
      });
    } else {
      sendResponse({
        success: false,
        error: "No session found",
      });
    }
  } catch (error) {
    sendResponse({
      success: false,
      error: (error as Error).message,
    });
  }
}

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
