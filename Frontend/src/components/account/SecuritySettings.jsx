import { useState } from "react";
import { ACCOUNT_API_URL } from "../../config/api";

export function SecuritySettings() {
  const [cardNumber, setCardNumber] = useState("");
  const [cardSaveError, setCardSaveError] = useState("");
  const [cardSaveSuccess, setCardSaveSuccess] = useState("");
  const [isSavingCard, setIsSavingCard] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  async function requestUpdateCardNumber(nextCardNumber) {
    return fetch(ACCOUNT_API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cardNumber: nextCardNumber }),
    });
  }

  async function requestPasswordChange({ newPasswordValue }) {
    return fetch(`${ACCOUNT_API_URL}/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        newPassword: newPasswordValue,
      }),
    });
  }

  async function requestDeleteAccount() {
    return fetch(`${ACCOUNT_API_URL}/delete`, {
      method: "DELETE",
      credentials: "include",
    });
  }

  async function handleCardUpdate(event) {
    event.preventDefault();
    setCardSaveError("");
    setCardSaveSuccess("");
    setIsSavingCard(true);
    try {
      const response = await requestUpdateCardNumber(cardNumber.trim());
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || "Could not update card number.");
      }
      setCardSaveSuccess("Card number updated.");
      setCardNumber("");
    } catch (error) {
      setCardSaveError(error.message || "Something went wrong while saving.");
    } finally {
      setIsSavingCard(false);
    }
  }

  async function handlePasswordUpdate(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword) {
      setPasswordError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await requestPasswordChange({
        newPasswordValue: newPassword,
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || "Could not change password.");
      }
      setPasswordSuccess("Password changed.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error.message || "Something went wrong while changing password.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleDeleteAccount(event) {
    event.preventDefault();
    setDeleteError("");
    setDeleteSuccess("");

    if (deleteConfirmText.trim() !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await requestDeleteAccount();
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || "Could not delete account.");
      }
      window.location.assign("/?loggedOut=1");
    } catch (error) {
      setDeleteError(error.message || "Something went wrong while deleting account.");
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <section className="panelBox">
      <form className="registerForm" onSubmit={handleCardUpdate}>
        <h3>Payment Information</h3>
        <label className="formField">
          Update card number
          <input
            name="cardNumber"
            value={cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
            placeholder="Enter new card number"
          />
        </label>

        {cardSaveError ? <p className="profileInfoError">{cardSaveError}</p> : null}
        {cardSaveSuccess ? <p className="profileInfoStatus">{cardSaveSuccess}</p> : null}

        <div className="profileEditFooter">
          <button className="loginSubmit" type="submit" disabled={isSavingCard}>
            {isSavingCard ? "Saving…" : "Update card info"}
          </button>
        </div>
      </form>
      <hr />
      <form className="registerForm" onSubmit={handlePasswordUpdate}>
        <h3>Change Password</h3>
        <label className="formField">
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </label>
        <label className="formField">
          Confirm new password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>

        {passwordError ? <p className="profileInfoError">{passwordError}</p> : null}
        {passwordSuccess ? <p className="profileInfoStatus">{passwordSuccess}</p> : null}

        <div className="profileEditFooter">
          <button className="loginSubmit" type="submit" disabled={isSavingPassword}>
            {isSavingPassword ? "Saving…" : "Change password"}
          </button>
        </div>
      </form>
      <hr />
      <form className="registerForm" onSubmit={handleDeleteAccount}>
        <h3>Delete Account</h3>
        <p className="profileInfoError">
          This action is permanent. Type DELETE below to confirm.
        </p>
        <label className="formField">
          Confirmation
          <input
            value={deleteConfirmText}
            onChange={(event) => setDeleteConfirmText(event.target.value)}
            placeholder='Type "DELETE"'
          />
        </label>

        {deleteError ? <p className="profileInfoError">{deleteError}</p> : null}
        {deleteSuccess ? <p className="profileInfoStatus">{deleteSuccess}</p> : null}

        <div className="profileEditFooter">
          <button className="navButton" type="submit" disabled={isDeletingAccount}>
            {isDeletingAccount ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </form>
    </section>
  );
}
