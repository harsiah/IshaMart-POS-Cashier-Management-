import { useRef, useState } from "react";
import "../../styles/Login.css";
import { login as loginService } from "../services/authService";
import { useAuth } from "../auth/AuthContext";
import mapIndonesia from "../assets/image/Map_of_Indonesia.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordInputRef = useRef(null);

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const data = await loginService(username, password);

      login(data);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${mapIndonesia})` }}
    >
      <div className="login-card">
        <h1>IshaMart System</h1>

        <p className="login-subtitle">
          Sign in to your account
        </p>

        {error && <p role="alert">{error}</p>}

        <form className="login-form" onSubmit={handleLogin}>
          <div>
            <label>Username</label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  passwordInputRef.current.focus();
                }
              }}
            />
          </div>

          <div>
            <label>Password</label>

            <input
              ref={passwordInputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;