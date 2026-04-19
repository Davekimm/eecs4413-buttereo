import { useState } from "react";
import { Link } from "react-router-dom";
import { AccountNav } from "../components/account/AccountNav";
import { OrderHistory } from "../components/account/OrderHistory";
import { ProfileSettings } from "../components/account/ProfileSettings";
import { SecuritySettings } from "../components/account/SecuritySettings";
import { AdminUsersPanel } from "../components/account/AdminUsersPanel";
import { useAuth } from "../context/AuthContext";

const SECTION_COMPONENTS = {
  profile: ProfileSettings,
  orders: OrderHistory,
  security: SecuritySettings,
};

/** Account page. Uses GET /api/account and GET /api/order/admin/all. */
export function AccountPage() {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");
  const ActivePanel = SECTION_COMPONENTS[activeSection];

  if (isAdmin) {
    return (
      <section className="simplePage">
        <h1>Account</h1>
        <div className="adminAccountToolbar">
          <Link className="navButton" to="/admin/sales-history">
            Sales history
          </Link>
        </div>
        <div className="accountGrid accountGridAdmin">
          <div className="accountBody">
            <AdminUsersPanel />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="simplePage">
      <h1>Account</h1>
      <div className="accountGrid">
        <AccountNav activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="accountBody">{ActivePanel ? <ActivePanel /> : null}</div>
      </div>
    </section>
  );
}
