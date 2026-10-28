import { createBrowserRouter } from 'react-router';
import PATH from '@/constants/path';
import HomePage from '@/page/home';
import Layout from './layout';
import ErrorBoundaryPage from './components/error-boundary';

const router = createBrowserRouter([
  {
    id: 'root',
    Component: Layout,
    ErrorBoundary: ErrorBoundaryPage,
    children: [{ path: PATH.HOME, Component: HomePage }],
  },
]);
export default router;
