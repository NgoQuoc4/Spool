import { createBrowserRouter } from "react-router-dom";
import { PATH } from "@/constants/path";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import MainLayout from "@/layouts/MainLayout";
import LikePage from "@/pages/LikePage";
import FollowPage from "@/pages/FollowPage";
import GhostPage from "@/pages/GhostPage";
import ArchivePage from "@/pages/ArchivePage";
import InsightsPage from "@/pages/InsightsPage";
import ProfilePage from "@/pages/ProfilePage";
import ActivityPage from "@/pages/ActivityPage";
import MessagesPage from "@/pages/MessagesPage";
import SearchPage from "@/pages/SearchPage";
import SavePage from "@/pages/SavePage";
import SettingPage from "@/pages/SettingPage";
import ReportPage from "@/pages/ReportPage";
import NotFoundPage from "@/pages/NotFoundPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import ProtectedRoute from "./ProtectedRoute";
import RejectedRoute from "./RejectedRoute";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import VerifyForgotPasswordPage from "@/pages/VerifyForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import TweetDetailPage from "@/pages/TweetDetailPage";
import BotsPage from "@/pages/Admin/BotsPage";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: PATH.HOME,
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: PATH.LIKE, element: <LikePage /> },
          { path: PATH.FOLLOW, element: <FollowPage /> },
          { path: PATH.GHOST, element: <GhostPage /> },
          { path: PATH.ARCHIVE, element: <ArchivePage /> },
          { path: PATH.INSIGHTS, element: <InsightsPage /> },
          { path: PATH.TWEET_DETAIL, element: <TweetDetailPage /> },
          { path: PATH.PROFILE_USER, element: <ProfilePage /> },
          { path: PATH.ACTIVITY, element: <ActivityPage /> },
          { path: PATH.MESSAGES, element: <MessagesPage /> },
          { path: PATH.SAVED, element: <SavePage /> },
          { path: PATH.SEARCH, element: <SearchPage /> },
          { path: PATH.SETTING, element: <SettingPage /> },
          { path: PATH.REPORT, element: <ReportPage /> },
          { path: PATH.BOTS, element: <BotsPage /> },
          { path: PATH.NOTFOUND, element: <NotFoundPage /> },
          { path: "/404", element: <NotFoundPage /> },
        ],
      },
    ],
  },
  {
    element: <RejectedRoute />,
    children: [
      { path: PATH.LOGIN, element: <LoginPage /> },
      { path: PATH.REGISTER, element: <RegisterPage /> },
    ],
  },
  {
    path: PATH.VERIFY_EMAIL,
    element: <VerifyEmailPage />,
  },
  { path: PATH.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
  { path: PATH.VERIFY_FORGOT_PASSWORD, element: <VerifyForgotPasswordPage /> },
  { path: PATH.RESET_PASSWORD, element: <ResetPasswordPage /> },
  { path: PATH.NOTFOUND, element: <NotFoundPage /> },
  { path: "/404", element: <NotFoundPage /> },
]);
