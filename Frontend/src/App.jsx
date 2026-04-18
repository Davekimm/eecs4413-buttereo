import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { Navbar } from "./components/layout/Navbar";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AccountPage } from "./pages/AccountPage";
import { CartPage } from "./pages/CartPage";
import { HomePage } from "./pages/HomePage";
import { AddProductPage } from "./pages/AddProductPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { EditProductPage } from "./pages/EditProductPage";
import { CheckoutConfirmationPage } from "./pages/CheckoutConfirmationPage";
import { SalesHistoryPage } from "./pages/SalesHistoryPage";

function App() {
  return (
    <div className="appShell">
      <Navbar />
      <main className="appMain">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout/confirmation"
            element={
              <ProtectedRoute>
                <CheckoutConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute requireAdmin>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory/add"
            element={
              <ProtectedRoute requireAdmin>
                <AddProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory/edit/:id"
            element={
              <ProtectedRoute requireAdmin>
                <EditProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sales-history"
            element={
              <ProtectedRoute requireAdmin>
                <SalesHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
