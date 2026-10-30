// =========================================================
// GOOGLE IDENTITY SERVICES CLIENT HELPER
// =========================================================

let scriptLoadingPromise = null;

/**
 * Loads the Google Identity Services client script into the page.
 */
export const loadGoogleIdentityScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available in SSR context"));
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript) {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google);
        return;
      }
      existingScript.addEventListener("load", () => resolve(window.google));
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services script"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

/**
 * Triggers Google Sign-In popup using Google Identity Services (OAuth2 Code Client).
 * Returns the authorization code for backend exchange.
 * 
 * @param {string} clientId - The Google OAuth 2.0 Web Client ID
 * @returns {Promise<string>} Resolves with the authorization code
 */
export const requestGoogleAuthCode = async (clientId) => {
  if (!clientId || typeof clientId !== "string" || !clientId.trim()) {
    throw new Error("Google Client ID is missing or invalid");
  }

  await loadGoogleIdentityScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services is not available");
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId.trim(),
        scope: "openid email profile",
        ux_mode: "popup",
        callback: (response) => {
          if (response?.error) {
            const errorDescription =
              response.error_description || response.error;
            reject(new Error(errorDescription || "Google authorization failed"));
            return;
          }

          if (response?.code) {
            resolve(response.code);
          } else {
            reject(new Error("No authorization code returned from Google"));
          }
        },
        error_callback: (err) => {
          const message =
            err?.message ||
            (err?.type === "popup_closed"
              ? "Google Sign-In popup was closed before completing."
              : "Google Sign-In was blocked or cancelled.");
          reject(new Error(message));
        }
      });

      client.requestCode();
    } catch (err) {
      reject(
        new Error(
          err?.message || "Failed to initialize Google Sign-In code client"
        )
      );
    }
  });
};

