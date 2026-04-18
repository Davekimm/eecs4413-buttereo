import { Link, useSearchParams } from "react-router-dom";

const LOGIN_ACTION = "http://localhost:8080/login";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  
  const showLoginFailed = searchParams.has("error");

  return (
    <section className="simplePage loginPageWrap">
      <h1>Sign in</h1>
      {showLoginFailed ? (
        <p className="formError" role="alert">
          Username or password is incorrect. Please try again.
        </p>
      ) : null}
      <form className="loginForm" method="post" action={LOGIN_ACTION}>
        <label className="formField">
          Username
          <input name="username" autoComplete="username" required />
        </label>
        <label className="formField">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="loginSubmit" type="submit">
          Sign in
        </button>
      </form>

      <p className="loginFooter">
        No account yet? <Link to="/register">Register</Link>
      </p>
    </section>
  );
}
