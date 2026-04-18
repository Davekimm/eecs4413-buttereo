import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ACCOUNT_API_URL } from "../../config/api";

function formatValue(value) {
  if (value == null) return "—";
  const s = String(value).trim();
  return s === "" ? "—" : s;
}

function ProfileField({ label, value }) {
  return (
    <div className="profileInfoRow">
      <dt>{label}</dt>
      <dd>{formatValue(value)}</dd>
    </div>
  );
}

export function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await fetch(ACCOUNT_API_URL, {
          method: "GET",
          credentials: "include",
        });

        const text = await response.text();
        if (cancelled) return;

        if (!response.ok) {
          setUser(null);
          setLoadError(text || "Could not load your profile.");
          return;
        }

        try {
          setUser(JSON.parse(text));
        } catch {
          setUser(null);
          setLoadError("Unexpected response from server.");
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setLoadError("Network error while loading profile.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="panelBox">

      {isLoading ? <p className="profileInfoStatus">Loading your information…</p> : null}
      {!isLoading && loadError ? <p className="profileInfoError">{loadError}</p> : null}

      {!isLoading && user && !loadError ? (
        <>
          <h3>Profile Information</h3>
          <dl className="profileInfoList">
            <ProfileField label="Username" value={user.username} />
            <ProfileField label="First name" value={user.firstName} />
            <ProfileField label="Last name" value={user.lastName} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Phone" value={user.phone} />
            <ProfileField label="Address" value={user.address} />
            <ProfileField label="Card number" value={user.cardNumber} />
          </dl>
          <div className="profileActionBar">
            <Link className="navButton" to="/account/edit">
              Edit profile
            </Link>
          </div>
        </>
      ) : null}
    </section>
  );
}
