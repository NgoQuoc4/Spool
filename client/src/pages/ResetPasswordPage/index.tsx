import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/apis/auth.api";
import { PATH } from "@/constants/path";
import { SpoolLogo, EyeIcon, EyeOffIcon } from "@/components/Icons";

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const forgot_password_token = location.state?.forgot_password_token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!forgot_password_token) {
      navigate(PATH.LOGIN);
    }
  }, [forgot_password_token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có độ dài tối thiểu 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      await authApi.resetPassword({
        forgot_password_token,
        password,
        confirmPassword,
      });

      setSuccessMessage(
        "Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...",
      );
      setTimeout(() => {
        navigate(PATH.LOGIN);
      }, 1500);
    } catch (err: unknown) {
      const errObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setErrorMessage(
        errObj.response?.data?.message ||
          errObj.message ||
          "Có lỗi xảy ra, vui lòng thử lại.",
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
        to={PATH.HOME}
        style={{
          display: "inline-flex",
          marginBottom: "28px",
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        title="Trang chủ"
      >
        <SpoolLogo size={60} />
      </Link>

      {/* Main Card */}
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
          Reset Password
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          Enter your new password below
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
          {/* New Password field */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirm Password field */}
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Submit Button */}
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
            {isLoading ? "Updating..." : "Reset password"}
          </button>
        </form>

        {/* Back to Login */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            to={PATH.LOGIN}
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontWeight: "500",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-main)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
