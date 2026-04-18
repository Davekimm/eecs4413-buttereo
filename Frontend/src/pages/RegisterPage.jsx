import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const formInitialData = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
};

export function RegisterPage() {
  const [formData, setFormData] = useState(formInitialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { onRegisterSuccess } = useAuth();
  const navigate = useNavigate();

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const requestBody = { ...formData, role: "USER" };

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Registration failed.");
      }

      setFormData(formInitialData);
      onRegisterSuccess(formData.firstName);
      navigate("/cart");
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong during registration.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="simplePage">
      <h1>Register</h1>
      <form className="registerForm" onSubmit={handleSubmit}>
        <label className="formField">
          Username
          <input name="username" value={formData.username} onChange={handleInputChange} required />
        </label>

        <label className="formField">
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </label>

        <label className="formField">
          First Name
          <input name="firstName" value={formData.firstName} onChange={handleInputChange} required />
        </label>

        <label className="formField">
          Last Name
          <input name="lastName" value={formData.lastName} onChange={handleInputChange} required />
        </label>

        <label className="formField">
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </label>

        <label className="formField">
          Phone
          <input name="phone" value={formData.phone} onChange={handleInputChange} />
        </label>

        <label className="formField">
          Address
          <input name="address" value={formData.address} onChange={handleInputChange} />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Create Account"}
        </button>
      </form>

      {errorMessage ? <p>{errorMessage}</p> : null}
    </section>
  );
}
