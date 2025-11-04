import { createCookie } from "react-router";
import { v4 } from "uuid";

export default createCookie("session", {
    maxAge: 604800000,
    httpOnly: true,
    secrets: [process.env.COOKIE_SECRET || v4()]
});