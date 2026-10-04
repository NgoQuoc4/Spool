import { createBrowserRouter } from 'react-router-dom';
import { PATH } from '@/constants/path';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MainLayout from '@/layouts/MainLayout';
import LikePage from '@/pages/LikePage';
import FollowPage from '@/pages/FollowPage';
import GhostPage from '@/pages/GhostPage';
import ArchivePage from '@/pages/ArchivePage';
import InsightsPage from '@/pages/InsightsPage';
import ProfilePage from '@/pages/ProfilePage';
import ActivityPage from '@/pages/ActivityPage';
import MessagesPage from '@/pages/MessagesPage';
import SearchPage from '@/pages/SearchPage';
import SavePage from '@/pages/SavePage';
import SettingPage from '@/pages/SettingPage';
import ReportPage from '@/pages/ReportPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProtectedRoute from './ProtectedRoute';
import RejectedRoute from './RejectedRoute';

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
          { path: PATH.PROFILE, element: <ProfilePage /> },
          { path: PATH.ACTIVITY, element: <ActivityPage /> },
          { path: PATH.MESSAGES, element: <MessagesPage /> },
          { path: PATH.SAVED, element: <SavePage /> },
          { path: PATH.SEARCH, element: <SearchPage /> },
          { path: PATH.SETTING, element: <SettingPage /> },
          { path: PATH.REPORT, element: <ReportPage /> },
          { path: PATH.NOTFOUND, element: <NotFoundPage /> },
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
]);
