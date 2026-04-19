import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ACCOUNT_API_URL } from "../config/api";

const WELCOME_KEY = "buttereoSignedInWelcome";
export const POST_LOGIN_REDIRECT_KEY = "buttereoPostLoginRedirect";

const AuthContext = createContext(null);

/** Remove URL parameter. */
function removeUrlParam(paramName) {
  const params = new URLSearchParams(window.location.search);
  params.delete(paramName);

  const queryString = params.toString();
  const cleanUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${
    window.location.hash
  }`;
  window.history.replaceState(null, "", cleanUrl || "/");
}

function getDisplayName(user) {
  if (!user) return "";
  if (user.firstName && user.firstName.trim() !== "") return user.firstName.trim();
  if (user.username && user.username.trim() !== "") return user.username.trim();
  return "";
}

/**
 * Set roles to "ADMIN" or "USER" / Fix this later...
 */
function normalizeRole(role) {
  if (!role || typeof role !== "string") return "";
  return role.trim().toUpperCase();
}

/**
 * Check if user is logged in or logged out with keys from backend.
 * Backend sends fromLogin=1 if logged in, or loggedOut=1 if logged out.
 * Set isSignedIn to true if logged in, false if logged out.
 */
function readInitialAuthState() {
  const params = new URLSearchParams(window.location.search);
  const wasLoggedOut = params.get("loggedOut") === "1";
  const cameFromLogin = params.get("fromLogin") === "1";
  const redirectAfterLogin = localStorage.getItem(POST_LOGIN_REDIRECT_KEY) || "";

  if (wasLoggedOut) {       // Logged out, clear welcome key and redirect key.
    sessionStorage.removeItem(WELCOME_KEY);
    localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    return {
      isSignedIn: false,
      clearParam: "loggedOut",
      redirectAfterLogin: "",
    };
  }

  if (cameFromLogin) {       // Logged in, set welcome key and redirect key.
    sessionStorage.setItem(WELCOME_KEY, "1");
    return {
      isSignedIn: true,
      clearParam: "fromLogin",
      redirectAfterLogin,
    };
  }

  return {      // Not logged in or logged out, check welcome key.
    isSignedIn: sessionStorage.getItem(WELCOME_KEY) === "1",
    clearParam: "",
    redirectAfterLogin: "",
  };
}

/**
 *  Global state for authentication.
 */
export function AuthProvider({ children }) {
  const initialAuthState = useMemo(() => readInitialAuthState(), []);
  const [isSignedIn, setIsSignedIn] = useState(initialAuthState.isSignedIn);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!initialAuthState.clearParam) return;
    removeUrlParam(initialAuthState.clearParam);
  }, [initialAuthState]);

  useEffect(() => {
    if (!initialAuthState.redirectAfterLogin) {
      return;
    }

    localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    if (window.location.pathname !== initialAuthState.redirectAfterLogin) {
      window.location.replace(initialAuthState.redirectAfterLogin);
    }
  }, [initialAuthState]);

  // If logged in, load user profile.
  useEffect(() => {         
    if (!isSignedIn) {
      setProfileLoaded(false);
      setRole("");
      return;
    }
    
    async function loadAuthenticatedUser() {
      setProfileLoaded(false);
      try {
        const response = await fetch(ACCOUNT_API_URL, {
          method: "GET",
          credentials: "include",     // Include credentials to get user profile.
        });

        if (response.ok) {
          const user = await response.json();
          setDisplayName(getDisplayName(user));
          setRole(normalizeRole(user.role));
        }
      } catch {
        // ...
      } finally {
        setProfileLoaded(true);
      }
    }

    loadAuthenticatedUser();
  }, [isSignedIn]);

  // If user registers successfully, set welcome key and profile.
  function onRegisterSuccess(firstName) {
    sessionStorage.setItem(WELCOME_KEY, "1");
    setIsSignedIn(true);
    setDisplayName(firstName ? firstName.trim() : "");
    setRole("USER");
    setProfileLoaded(true);
  }

  const welcomeText = isSignedIn    
    ? displayName
      ? `Hello ${displayName}, nice to meet you!`
      : "Happy to meet you! how are you doing?"
    : "Welcome to Buttereo";

  const isAdmin = role === "ADMIN";     // Setting isAdmin to true if role is "ADMIN".

  const value = useMemo(
    () => ({
      isSignedIn,
      displayName,
      role,
      isAdmin,
      profileLoaded,
      welcomeText,
      onRegisterSuccess,
    }),
    [isSignedIn, displayName, role, isAdmin, profileLoaded, welcomeText],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export the context to be used in other components.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
