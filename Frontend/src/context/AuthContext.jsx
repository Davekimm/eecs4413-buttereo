import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ACCOUNT_API_URL } from "../config/api";

const WELCOME_KEY = "buttereoSignedInWelcome";
const POST_LOGIN_REDIRECT_KEY = "buttereoPostLoginRedirect";

const AuthContext = createContext(null);

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

/** Backend may send "ADMIN", "admin", "USER", etc. */
function normalizeRole(role) {
  if (!role || typeof role !== "string") return "";
  return role.trim().toUpperCase();
}

function readInitialAuthState() {
  const params = new URLSearchParams(window.location.search);
  const wasLoggedOut = params.get("loggedOut") === "1";
  const cameFromLogin = params.get("fromLogin") === "1";
  const redirectAfterLogin = localStorage.getItem(POST_LOGIN_REDIRECT_KEY) || "";

  if (wasLoggedOut) {
    sessionStorage.removeItem(WELCOME_KEY);
    localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    return {
      isSignedIn: false,
      clearParam: "loggedOut",
      redirectAfterLogin: "",
    };
  }

  if (cameFromLogin) {
    sessionStorage.setItem(WELCOME_KEY, "1");
    return {
      isSignedIn: true,
      clearParam: "fromLogin",
      redirectAfterLogin,
    };
  }

  return {
    isSignedIn: sessionStorage.getItem(WELCOME_KEY) === "1",
    clearParam: "",
    redirectAfterLogin: "",
  };
}

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
          credentials: "include",
        });

        if (response.ok) {
          const user = await response.json();
          setDisplayName(getDisplayName(user));
          setRole(normalizeRole(user.role));
        }
      } catch {
        // Keep basic UI flow if account endpoint is not ready.
      } finally {
        setProfileLoaded(true);
      }
    }

    loadAuthenticatedUser();
  }, [isSignedIn]);

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

  const isAdmin = role === "ADMIN";

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
