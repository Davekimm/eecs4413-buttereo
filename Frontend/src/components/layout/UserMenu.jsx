import { Link } from "react-router-dom";
import { POST_LOGIN_REDIRECT_KEY, useAuth } from "../../context/AuthContext";

const LOGOUT_URL = "http://localhost:8080/logout";

/** User menu. Uses POST /api/auth/logout. */
export function UserMenu() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <Link
        className="navButton"
        to="/login"
        onClick={() => localStorage.removeItem(POST_LOGIN_REDIRECT_KEY)}
      >
        Log In
      </Link>
    );
  }

  return (
    <>
      <Link className="navButton" to="/account">
        Account
      </Link>
      <form method="post" action={LOGOUT_URL} className="logoutForm">
        <button className="navButton" type="submit">
          Logout
        </button>
      </form>
    </>
  );
}
