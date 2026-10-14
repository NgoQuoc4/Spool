import { SpoolLogo } from "@/components/Icons";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage("Vui lòng điền đầy đủ email.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setErrorMessage("");
      setSuccessMessage("Password reset link sent successfully");
    } catch (error) {
      setErrorMessage("");
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.08)")
          }
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
            Forgot Password
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              textAlign: "center",
              marginBottom: "28px",
            }}
          >
            Enter your details to get a password reset link
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
                placeholder="Username, phone or email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: isLoading ? "default" : "pointer",
                opacity: isLoading ? 0.8 : 1,
                transition: "opacity 0.15s ease, transform 0.1s ease",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.98)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Send reset password link
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <button
              onClick={() => navigate("/login")}
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
              <SpoolLogo />
              <span>Login</span>
            </button>
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
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-main)")
          }
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
    </>
  );
};

export default index;
