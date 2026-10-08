import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  SpoolLogo,
  GoogleIcon,
  InstagramIcon,
  EyeIcon,
  EyeOffIcon,
} from "@/components/Icons";
import { getGoogleAuthUrl } from "@/utils/auth";
import { useAuth } from "@/contexts/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const googleAuthUrl = getGoogleAuthUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      await login({ email, password });
      setSuccessMessage("Đăng nhập thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/"), 500);
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setErrorMessage(
        errObj.response?.data?.message ||
          errObj.message ||
          "Email hoặc mật khẩu không chính xác.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-main)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      {/* Brand Logo */}
      <Link
        to="/"
        style={{
          display: "inline-flex",
          marginBottom: "28px",
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Trở về Trang chủ"
      >
        <SpoolLogo size={60} />
      </Link>

      {/* Main Login Card */}
      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "var(--bg-card)",
          borderRadius: "24px",
          border: "1px solid var(--border-color)",
          padding: "36px 32px",
          boxShadow: "var(--shadow-popup)",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "800",
            textAlign: "center",
            color: "var(--text-main)",
            margin: "0 0 8px",
            letterSpacing: "-0.3px",
          }}
        >
          Log in to Spool
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          Enter your details to access your account
        </p>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: "rgba(255, 48, 64, 0.12)",
              border: "1px solid rgba(255, 48, 64, 0.3)",
              color: "#ff5c6a",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "13px",
              marginBottom: "18px",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              backgroundColor: "rgba(0, 186, 124, 0.12)",
              border: "1px solid rgba(0, 186, 124, 0.3)",
              color: "#00ba7c",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "13px",
              marginBottom: "18px",
              textAlign: "center",
            }}
          >
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          {/* Email / Username field */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username, phone or email"
              required
              style={{
                width: "100%",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                padding: "14px 16px",
                fontSize: "14px",
                color: "var(--text-main)",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--text-secondary)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-color)")
              }
            />
          </div>

          {/* Password field with eye toggle */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{
                width: "100%",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                padding: "14px 44px 14px 16px",
                fontSize: "14px",
                color: "var(--text-main)",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--text-secondary)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-color)")
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                padding: "4px",
              }}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>

          {/* Forgot Password link */}
          <div style={{ textAlign: "right", marginTop: "-4px" }}>
            <a
              href="#forgot"
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-main)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-secondary)")
              }
            >
              Forgot password?
            </a>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: "8px",
              backgroundColor: "var(--accent-white)",
              color: "var(--bg-main)",
              fontWeight: "700",
              fontSize: "15px",
              padding: "13px",
              borderRadius: "14px",
              cursor: isLoading ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.15s ease, transform 0.1s ease",
              opacity: isLoading ? 0.8 : 1,
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.98)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* OR Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "22px 0",
            color: "var(--text-muted)",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "var(--border-color)",
            }}
          />
          <span style={{ padding: "0 14px" }}>OR</span>
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "var(--border-color)",
            }}
          />
        </div>

        {/* Social Auth Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {googleAuthUrl ? (
            <a
              href={googleAuthUrl}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                padding: "11px",
                color: "var(--text-main)",
                fontSize: "14px",
                fontWeight: "600",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-pill-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-input)")
              }
            >
              <GoogleIcon size={18} />
              <span>Continue with Google</span>
            </a>
          ) : (
            <button
              onClick={() => {
                setSuccessMessage("Google OAuth demo triggered!");
                setTimeout(() => navigate("/"), 1200);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                padding: "11px",
                color: "var(--text-main)",
                fontSize: "14px",
                fontWeight: "600",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-pill-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--bg-input)")
              }
            >
              <GoogleIcon size={18} />
              <span>Continue with Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Switch to Register card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          marginTop: "16px",
          padding: "18px",
          textAlign: "center",
          backgroundColor: "var(--bg-card)",
          borderRadius: "18px",
          border: "1px solid var(--border-color)",
          fontSize: "14px",
          color: "var(--text-secondary)",
        }}
      >
        Don't have an account?{" "}
        <Link
          to="/register"
          style={{
            color: "var(--text-main)",
            fontWeight: "700",
            marginLeft: "4px",
          }}
        >
          Sign up
        </Link>
      </div>

      {/* Return to Feed */}
      <Link
        to="/"
        style={{
          marginTop: "20px",
          fontSize: "13px",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-main)")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--text-secondary)")
        }
      >
        <span>← Back to Spool feed</span>
      </Link>

      {/* Meta Footer */}
      <footer
        style={{
          marginTop: "32px",
          fontSize: "12px",
          color: "var(--text-muted)",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center",
        }}
      >
        <span>Meta</span>
        <span>·</span>
        <span>About</span>
        <span>·</span>
        <span>Help</span>
        <span>·</span>
        <span>Terms</span>
        <span>·</span>
        <span>Privacy</span>
        <span>·</span>
        <span>© 2026 Spool</span>
      </footer>
    </div>
  );
};

export default Login;
