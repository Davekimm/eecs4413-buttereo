import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LOGOUT_URL = "http://localhost:8080/logout";

export function UserMenu() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <Link className="navButton" to="/login">
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
