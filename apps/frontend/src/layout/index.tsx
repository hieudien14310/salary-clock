import { Outlet } from "react-router";
import { Fragment } from "react/jsx-runtime";
import Header from "@/layout/header";

const Layout = () => {
  return (
    <Fragment>
      <Header />
      <Outlet />
    </Fragment>
  );
};
export default Layout;
