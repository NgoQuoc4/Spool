import { authApi } from "@/apis/auth.api";
import { PATH } from "@/constants/path";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forgot_password_token = searchParams.get("forgot_password_token");

  useEffect(() => {
    if (!forgot_password_token) {
      navigate(PATH.LOGIN);
      return;
    }

    authApi
      .verifyForgotPassword(forgot_password_token)
      .then(() => {
        navigate(PATH.RESET_PASSWORD, {
          state: { forgot_password_token },
        });
      })
      .catch(() => {
        navigate(PATH.LOGIN);
      });
  }, [forgot_password_token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <p className="text-gray-500">Đang xác thực liên kết, vui lòng chờ...</p>
    </div>
  );
};

export default VerifyForgotPasswordPage;
