import { authApi } from "@/apis/auth.api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<
    "loading" | "success" | "already_verified" | "error"
  >("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { setAuthTokens, isAuthenticated } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Không tìm thấy mã xác thực!");
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    authApi
      .verifyEmail(token)
      .then(async ({ data }) => {
        if (data.result?.accessToken && data.result?.refreshToken) {
          // Tự động lưu token và đăng nhập
          await setAuthTokens(
            data.result.accessToken,
            data.result.refreshToken,
          );
          setStatus("success");
          setMessage("Xác thực email thành công! Đang tự động đăng nhập...");
        } else {
          setStatus("already_verified");
          setMessage(data.message || "Email này đã được xác thực trước đó.");
        }
        setTimeout(() => navigate("/"), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Xác thực thất bại hoặc đường dẫn đã hết hạn!",
        );
      });
  }, [token, navigate, setAuthTokens]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-main, #000)",
        color: "var(--text-main, #fff)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          padding: "36px 28px",
          backgroundColor: "var(--bg-card, #16181c)",
          borderRadius: "20px",
          border: "1px solid var(--border-color, #2f3336)",
          textAlign: "center",
        }}
      >
        {status === "loading" && (
          <>
            <h3
              style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 8px" }}
            >
              Đang xác thực email
            </h3>
            <p
              style={{
                color: "var(--text-secondary, #71767b)",
                fontSize: "14px",
                margin: 0,
              }}
            >
              Vui lòng chờ trong giây lát...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎉</div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#00ba7c",
                margin: "0 0 8px",
              }}
            >
              Xác thực thành công!
            </h3>
            <p
              style={{
                color: "var(--text-secondary, #71767b)",
                fontSize: "14px",
                margin: 0,
              }}
            >
              {message}
            </p>
          </>
        )}

        {status === "already_verified" && (
          <>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>✅</div>
            <h3
              style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 8px" }}
            >
              Email đã được xác thực
            </h3>
            <p
              style={{
                color: "var(--text-secondary, #71767b)",
                fontSize: "14px",
                margin: 0,
              }}
            >
              {message} Đang chuyển hướng...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#f4212e",
                margin: "0 0 8px",
              }}
            >
              Xác thực thất bại
            </h3>
            <p
              style={{
                color: "var(--text-secondary, #71767b)",
                fontSize: "14px",
                margin: "0 0 20px",
              }}
            >
              {message}
            </p>
            <button
              onClick={() => navigate(isAuthenticated ? "/" : "/login")}
              style={{
                backgroundColor: "var(--text-main, #fff)",
                color: "var(--bg-main, #000)",
                border: "none",
                borderRadius: "24px",
                padding: "10px 24px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {isAuthenticated ? "Về trang chủ" : "Đến trang đăng nhập"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
