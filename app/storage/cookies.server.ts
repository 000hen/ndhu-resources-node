import { createCookie } from "@remix-run/node";
import { v4 } from "uuid";

export default createCookie("session", {
    maxAge: 604800000,
    httpOnly: true,
    secrets: [process.env.COOKIE_SECRET || v4()]
});