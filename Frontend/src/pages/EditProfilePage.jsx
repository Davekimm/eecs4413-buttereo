import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACCOUNT_API_URL } from "../config/api";

const emptyForm = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  cardNumber: "",
};

/** Edit profile page. Uses GET /api/account and PUT /api/account. */
export function EditProfilePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await fetch(ACCOUNT_API_URL, { method: "GET", credentials: "include" });
        const text = await response.text();
        if (cancelled) return;

        if (!response.ok) {
          setLoadError(text || "Could not load your profile.");
          return;
        }

        let user;
        try {
          user = JSON.parse(text);
        } catch {
          setLoadError("Unexpected response from server.");
          return;
        }

        setFormData({
          username: user.username ?? "",
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          address: user.address ?? "",
          cardNumber: user.cardNumber ?? "",
        });
      } catch {
        if (!cancelled) {
          setLoadError("Network error while loading profile.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleApply(event) {
    event.preventDefault();
    setSaveError("");
    setIsSaving(true);
    const body = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      cardNumber: formData.cardNumber,
    };
    try {
      const response = await fetch(ACCOUNT_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || "Could not save changes.");
      }
      navigate("/account");
    } catch (error) {
      setSaveError(error.message || "Something went wrong while saving.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleGoBack() {
    navigate("/account");
  }

  return (
    <section className="simplePage">
      <h1>Edit profile</h1>

      {isLoading ? <p className="profileInfoStatus">Loading your information…</p> : null}
      {!isLoading && loadError ? <p className="profileInfoError">{loadError}</p> : null}

      {!isLoading && !loadError ? (
        <form className="registerForm editProfileForm" onSubmit={handleApply}>
          <label className="formField">
            Username
            <input name="username" value={formData.username} readOnly />
          </label>

          <label className="formField">
            First name
            <input name="firstName" value={formData.firstName} onChange={handleInputChange} />
          </label>

          <label className="formField">
            Last name
            <input name="lastName" value={formData.lastName} onChange={handleInputChange} />
          </label>

          <label className="formField">
            Email
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
          </label>

          <label className="formField">
            Phone
            <input name="phone" value={formData.phone} onChange={handleInputChange} />
          </label>

          <label className="formField">
            Address
            <input name="address" value={formData.address} onChange={handleInputChange} />
          </label>

          <label className="formField">
            Card number
            <input name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} />
          </label>

          {saveError ? <p className="profileInfoError">{saveError}</p> : null}

          <div className="profileEditFooter">
            <button className="loginSubmit" type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Apply changes"}
            </button>
            <button className="loginSubmit profileEditBack" type="button" onClick={handleGoBack} disabled={isSaving}>
              Go back to Account
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
