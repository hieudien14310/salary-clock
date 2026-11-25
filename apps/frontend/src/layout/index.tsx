import { Outlet } from 'react-router';

const Layout = () => {
  return (
    <div className="flex min-h-svh flex-col">
      <Outlet />
    </div>
  );
};

export default Layout;
