import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CartWidget } from "./CartWidget";
import { UserMenu } from "./UserMenu";

/** Navigation bar. Uses GET /api/cart/items and GET /api/order/admin/all. */
export function Navbar() {
  const { isSignedIn, isAdmin, profileLoaded, role } = useAuth();

  let cartOrInventory = null;
  if (isSignedIn && !profileLoaded) {
    cartOrInventory = null;
  } else if (isSignedIn && isAdmin) {
    cartOrInventory = (
      <div className="adminNavLinks">
        <Link className="navButton" to="/admin/inventory">
          Inventory
        </Link>
        <Link className="navButton" to="/admin/sales-history">
          Sales history
        </Link>
      </div>
    );
  } else if (!isSignedIn || role === "USER") {
    cartOrInventory = <CartWidget />;
  }

  return (
    <header className="topBar">
      <Link className="navButton" to="/">
        Home
      </Link>

      <div className="topBarRight">
        {cartOrInventory}
        <UserMenu />
      </div>
    </header>
  );
}
