import { useEffect, useMemo, useState } from "react";
import {
  ACCOUNT_ADMIN_ALL_USERS_API_URL,
  accountAdminDeleteUserApiUrl,
  accountAdminUpdateUserApiUrl,
  orderAdminAllByUsernameApiUrl,
} from "../../config/api";
import { normalizeOrderForDisplay } from "../../utils/orderDto";
import { OrderRow } from "./OrderRow";

const DEFAULT_ROLE_OPTIONS = ["USER", "ADMIN"];

function normalizeRole(role) {
  if (typeof role !== "string") return "";
  return role.trim().toUpperCase();
}

function normalizeUserDraft(user) {
  return {
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    cardNumber: user?.cardNumber ?? "",
    role: normalizeRole(user?.role) || "USER",
  };
}

export function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [userDrafts, setUserDrafts] = useState({});
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [savingUsername, setSavingUsername] = useState("");
  const [deletingUsername, setDeletingUsername] = useState("");
  const [selectedHistoryUsername, setSelectedHistoryUsername] = useState("");
  const [historyOrders, setHistoryOrders] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyLoadingUsername, setHistoryLoadingUsername] = useState("");

  const roleOptions = useMemo(() => {
    const rolesFromUsers = [
      ...users.map((user) => normalizeRole(user?.role)),
      ...Object.values(userDrafts).map((draft) => normalizeRole(draft?.role)),
    ]
      .filter(Boolean);
    return Array.from(new Set([...DEFAULT_ROLE_OPTIONS, ...rolesFromUsers]));
  }, [users, userDrafts]);

  useEffect(() => {
    let cancelled = false;

    async function loadAllUsers() {
      setIsLoading(true);
      setLoadError("");
      setActionError("");
      setActionSuccess("");

      try {
        const response = await fetch(ACCOUNT_ADMIN_ALL_USERS_API_URL, {
          method: "GET",
          credentials: "include",
        });
        const text = await response.text();
        if (cancelled) return;

        if (!response.ok) {
          setUsers([]);
          setLoadError(text || "Could not load user accounts.");
          return;
        }

        let payload;
        try {
          payload = text.trim() ? JSON.parse(text) : [];
        } catch {
          setUsers([]);
          setLoadError("Unexpected response while loading users.");
          return;
        }

        const allUsers = Array.isArray(payload) ? payload : [];
        setUsers(allUsers);
        setUserDrafts(
          allUsers.reduce((drafts, user) => {
            const username = String(user?.username ?? "").trim();
            if (username) {
              drafts[username] = normalizeUserDraft(user);
            }
            return drafts;
          }, {}),
        );
      } catch {
        if (!cancelled) {
          setUsers([]);
          setLoadError("Network error while loading users.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAllUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateUserDraft(username, field, value) {
    setUserDrafts((current) => ({
      ...current,
      [username]: {
        ...(current[username] ?? normalizeUserDraft({})),
        [field]: field === "role" ? normalizeRole(value) : value,
      },
    }));
    setActionError("");
    setActionSuccess("");
  }

  async function handleApplyChanges(username) {
    const draft = userDrafts[username];
    if (!draft) {
      setActionError(`Could not find editable data for ${username}.`);
      setActionSuccess("");
      return;
    }
    if (!String(draft.email ?? "").trim()) {
      setActionError("Email is required.");
      setActionSuccess("");
      return;
    }
    if (!normalizeRole(draft.role)) {
      setActionError("Role is required.");
      setActionSuccess("");
      return;
    }

    setSavingUsername(username);
    setActionError("");
    setActionSuccess("");

    const requestBody = {
      username,
      firstName: draft.firstName,
      lastName: draft.lastName,
      email: draft.email,
      phone: draft.phone,
      address: draft.address,
      cardNumber: draft.cardNumber,
      role: normalizeRole(draft.role),
    };

    try {
      const response = await fetch(accountAdminUpdateUserApiUrl(username), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `Could not update role for ${username}.`);
      }

      let updatedUser = null;
      try {
        updatedUser = text.trim() ? JSON.parse(text) : null;
      } catch {
        updatedUser = null;
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.username === username
            ? {
                ...user,
                ...(updatedUser && typeof updatedUser === "object" ? updatedUser : {}),
                role: normalizeRole(updatedUser?.role) || requestBody.role,
              }
            : user,
        ),
      );
      setUserDrafts((currentDrafts) => ({
        ...currentDrafts,
        [username]: normalizeUserDraft(
          updatedUser && typeof updatedUser === "object"
            ? { ...requestBody, ...updatedUser }
            : requestBody,
        ),
      }));
      setActionSuccess(`Applied changes for ${username}.`);
    } catch (error) {
      setActionError(error.message || "Something went wrong while applying changes.");
    } finally {
      setSavingUsername("");
    }
  }

  async function handleDeleteUser(username) {
    if (!username) {
      return;
    }

    const confirmed = window.confirm(`Delete user "${username}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setDeletingUsername(username);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(accountAdminDeleteUserApiUrl(username), {
        method: "DELETE",
        credentials: "include",
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `Could not delete ${username}.`);
      }

      setUsers((currentUsers) => currentUsers.filter((user) => user.username !== username));
      setUserDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[username];
        return nextDrafts;
      });
      if (selectedHistoryUsername === username) {
        setSelectedHistoryUsername("");
        setHistoryOrders([]);
        setHistoryError("");
      }
      setActionSuccess(`Deleted user ${username}.`);
    } catch (error) {
      setActionError(error.message || "Something went wrong while deleting user.");
    } finally {
      setDeletingUsername("");
    }
  }

  async function handleLoadHistory(username) {
    if (!username) {
      return;
    }

    setSelectedHistoryUsername(username);
    setHistoryOrders([]);
    setHistoryError("");
    setIsHistoryLoading(true);
    setHistoryLoadingUsername(username);

    try {
      const response = await fetch(orderAdminAllByUsernameApiUrl(username), {
        method: "GET",
        credentials: "include",
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `Could not load orders for ${username}.`);
      }

      let payload;
      try {
        payload = text.trim() ? JSON.parse(text) : [];
      } catch {
        throw new Error("Unexpected response while loading order history.");
      }

      const rawOrders = Array.isArray(payload) ? payload : payload ? [payload] : [];
      const normalizedOrders = rawOrders
        .map(normalizeOrderForDisplay)
        .filter(Boolean)
        .sort((left, right) => right.placedAtMs - left.placedAtMs);

      setHistoryOrders(normalizedOrders);
    } catch (error) {
      setHistoryOrders([]);
      setHistoryError(error.message || "Something went wrong while loading order history.");
    } finally {
      setIsHistoryLoading(false);
      setHistoryLoadingUsername("");
    }
  }

  return (
    <section className="panelBox">
      <h2 className="panelTitle">Users account management</h2>

      {isLoading ? <p className="profileInfoStatus">Loading users...</p> : null}
      {!isLoading && loadError ? <p className="profileInfoError">{loadError}</p> : null}
      {actionError ? <p className="profileInfoError">{actionError}</p> : null}
      {actionSuccess ? <p className="profileInfoStatus">{actionSuccess}</p> : null}

      {!isLoading && !loadError && users.length === 0 ? (
        <p className="profileInfoStatus">No users found.</p>
      ) : null}

      {!isLoading && !loadError && users.length > 0 ? (
        <div className="adminUsersTableWrap">
          <table className="inventoryTable">
            <thead>
              <tr>
                <th>History</th>
                <th>Username</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Card Number</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const username = String(user?.username ?? "").trim();
                const draft = userDrafts[username] ?? normalizeUserDraft(user);
                const isSavingThisUser = savingUsername === username;
                const isDeletingThisUser = deletingUsername === username;
                const isProcessingThisUser = isSavingThisUser || isDeletingThisUser;

                return (
                  <tr key={username || `${user?.email ?? ""}-${user?.firstName ?? ""}`}>
                    <td>
                      <button
                        type="button"
                        className="navButton adminHistoryButton"
                        onClick={() => handleLoadHistory(username)}
                        disabled={isProcessingThisUser || !username}
                      >
                        {historyLoadingUsername === username ? "Loading..." : "Order History"}
                      </button>
                    </td>
                    <td>{username || "—"}</td>
                    <td>
                      <input
                        className="adminUserInput"
                        value={draft.firstName}
                        onChange={(event) => updateUserDraft(username, "firstName", event.target.value)}
                        disabled={isProcessingThisUser || !username}
                      />
                    </td>
                    <td>
                      <input
                        className="adminUserInput"
                        value={draft.lastName}
                        onChange={(event) => updateUserDraft(username, "lastName", event.target.value)}
                        disabled={isProcessingThisUser || !username}
                      />
                    </td>
                    <td>
                      <input
                        className="adminUserInput"
                        type="email"
                        value={draft.email}
                        onChange={(event) => updateUserDraft(username, "email", event.target.value)}
                        disabled={isProcessingThisUser || !username}
                      />
                    </td>
                    <td>
                      <input
                        className="adminUserInput"
                        value={draft.phone}
                        onChange={(event) => updateUserDraft(username, "phone", event.target.value)}
                        disabled={isProcessingThisUser || !username}
                      />
                    </td>
                    <td>
                      <input
                        className="adminUserInput"
                        value={draft.address}
                        onChange={(event) => updateUserDraft(username, "address", event.target.value)}
                        disabled={isProcessingThisUser || !username}
                      />
                    </td>
                    <td>
                      <input
                        className="adminUserInput"
                        value={draft.cardNumber}
                        onChange={(event) => updateUserDraft(username, "cardNumber", event.target.value)}
                        disabled={isProcessingThisUser || !username}
                      />
                    </td>
                    <td>
                      <select
                        className="adminRoleSelect"
                        value={normalizeRole(draft.role) || "USER"}
                        onChange={(event) => updateUserDraft(username, "role", event.target.value)}
                        disabled={isProcessingThisUser || !username}
                      >
                        {roleOptions.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {roleOption}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="adminActionButtons">
                        <button
                          type="button"
                          className="navButton adminRoleButton"
                          onClick={() => handleApplyChanges(username)}
                          disabled={isProcessingThisUser || !username}
                        >
                          {isSavingThisUser ? "Applying..." : "Update"}
                        </button>
                        <button
                          type="button"
                          className="navButton adminDeleteButton"
                          onClick={() => handleDeleteUser(username)}
                          disabled={isProcessingThisUser || !username}
                        >
                          {isDeletingThisUser ? "Deleting..." : "Delete user"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <section className="panelBox adminOrderHistoryPanel">
        <h3 className="panelTitle">
          Order History
          {selectedHistoryUsername ? ` - ${selectedHistoryUsername}` : ""}
        </h3>
        {!selectedHistoryUsername ? (
          <p className="profileInfoStatus">Choose a user and click History to view orders.</p>
        ) : null}
        {isHistoryLoading ? <p className="profileInfoStatus">Loading order history...</p> : null}
        {!isHistoryLoading && historyError ? <p className="profileInfoError">{historyError}</p> : null}
        {!isHistoryLoading && !historyError && selectedHistoryUsername && historyOrders.length === 0 ? (
          <p className="profileInfoStatus">No orders found for this user.</p>
        ) : null}
        {!isHistoryLoading && !historyError && historyOrders.length > 0 ? (
          <div className="orderHistoryList">
            {historyOrders.map((order) => (
              <OrderRow key={`${selectedHistoryUsername}-${order.id ?? order.placedAtMs}`} order={order} />
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
