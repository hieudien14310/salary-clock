import { createBrowserRouter } from "react-router";
import PATH from "@/constants/path";
import HomePage from "@/page/home";

const router = createBrowserRouter([{ path: PATH.HOME, Component: HomePage }]);
export default router;
