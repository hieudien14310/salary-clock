import { Outlet } from "react-router";
import Header from "@/layout/header";
import Footer from "@/layout/footer";

const Layout = () => {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;
