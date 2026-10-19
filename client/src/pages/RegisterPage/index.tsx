import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { SpoolLogo, GoogleIcon, EyeIcon, EyeOffIcon } from "@/components/Icons";
import { getGoogleAuthUrl } from "@/utils/auth";
import { authApi } from "@/apis/auth.api";
import { tokenStore } from "@/apis/http";
import type { RegisterBody } from "@/types/auth.types";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const googleAuthUrl = getGoogleAuthUrl();

  const registerMutation = useMutation({
    mutationFn: (body: RegisterBody) => authApi.signUp(body),
    onSuccess: (res) => {
      const tokenData = res.data.data;
      if (tokenData?.accessToken && tokenData?.refreshToken) {
        tokenStore.setTokens(tokenData.accessToken, tokenData.refreshToken);
      }
      setSuccessMessage("Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => {
        navigate("/");
      }, 1200);
    },
    onError: (err: unknown) => {
      const errObj = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, { msg: string }>;
          };
        };
        message?: string;
      };
      const firstError = errObj.response?.data?.errors
        ? Object.values(errObj.response.data.errors)[0]?.msg
        : null;
      setErrorMessage(
        firstError ||
          errObj.response?.data?.message ||
          errObj.message ||
          "Có lỗi xảy ra khi tạo tài khoản.",
      );
    },
  });

  const isLoading = registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword || !dateOfBirth) {
      setErrorMessage("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setErrorMessage("");

    const isoDob = new Date(dateOfBirth).toISOString();
    registerMutation.mutate({
      name,
      email,
      password,
      confirmPassword,
      dateOfBirth: isoDob,
    });
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
          marginBottom: "24px",
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Trở về Trang chủ"
      >
        <SpoolLogo size={60} />
      </Link>

      {/* Main Register Card */}
      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "var(--bg-card)",
          borderRadius: "24px",
          border: "1px solid var(--border-color)",
          padding: "32px 30px",
          boxShadow: "var(--shadow-popup)",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "800",
            textAlign: "center",
            color: "var(--text-main)",
            margin: "0 0 6px",
            letterSpacing: "-0.3px",
          }}
        >
          Create your Spool account
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          Join Spool to share ideas and start conversations
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
              marginBottom: "16px",
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
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {/* Full Name */}
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              style={{
                width: "100%",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                padding: "13px 16px",
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

          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              style={{
                width: "100%",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                padding: "13px 16px",
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

          {/* Date of Birth */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                color: "var(--text-secondary)",
                marginBottom: "4px",
                paddingLeft: "4px",
              }}
            >
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              style={{
                width: "100%",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                padding: "12px 16px",
                fontSize: "14px",
                color: "var(--text-main)",
                transition: "border-color 0.15s ease",
                colorScheme: "dark",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--text-secondary)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-color)")
              }
            />
          </div>

          {/* Password */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min. 6 characters)"
              required
              style={{
                width: "100%",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                padding: "13px 44px 13px 16px",
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

          {/* Confirm Password */}
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              style={{
                width: "100%",
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                padding: "13px 44px 13px 16px",
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? (
                <EyeOffIcon size={18} />
              ) : (
                <EyeIcon size={18} />
              )}
            </button>
          </div>

          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              lineHeight: "1.4",
              margin: "4px 0",
            }}
          >
            By registering, you agree to our Terms, Privacy Policy and Cookies
            Policy.
          </p>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: "4px",
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
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* OR Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "20px 0",
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

        {/* Social Auth */}
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
            <span>Sign up with Google</span>
          </a>
        ) : (
          <button
            onClick={() => {
              setSuccessMessage("Google OAuth demo triggered!");
              setTimeout(() => navigate("/"), 1200);
            }}
            style={{
              width: "100%",
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
            <span>Sign up with Google</span>
          </button>
        )}
      </div>

      {/* Switch to Login card */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
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
        Already have an account?{" "}
        <Link
          to="/login"
          style={{
            color: "var(--text-main)",
            fontWeight: "700",
            marginLeft: "4px",
          }}
        >
          Log in
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
          marginTop: "28px",
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

export default Register;
