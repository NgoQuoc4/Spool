import { authApi } from "@/apis/auth.api";
import { PATH } from "@/constants/path";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

const VerifyForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forgot_password_token = searchParams.get("forgot_password_token");
  const calledRef = useRef(false);

  const verifyForgotPasswordMutation = useMutation({
    mutationFn: (token: string) => authApi.verifyForgotPassword(token),
    onSuccess: () => {
      navigate(PATH.RESET_PASSWORD, {
        state: { forgot_password_token },
      });
    },
    onError: () => {
      navigate(PATH.LOGIN);
    },
  });

  useEffect(() => {
    if (!forgot_password_token) {
      navigate(PATH.LOGIN);
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    verifyForgotPasswordMutation.mutate(forgot_password_token);
  }, [forgot_password_token, navigate, verifyForgotPasswordMutation]);

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <p className="text-gray-500">Đang xác thực liên kết, vui lòng chờ...</p>
    </div>
  );
};

export default VerifyForgotPasswordPage;
