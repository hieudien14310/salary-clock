import { createBrowserRouter } from "react-router";
import PATH from "@/constants/path";
import HomePage from "@/page/home";
import Layout from "./layout";

const router = createBrowserRouter([{ Component: Layout, children: [{ path: PATH.HOME, Component: HomePage }] }]);
export default router;
