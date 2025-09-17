import { redirect } from "@remix-run/node";
import cookie from "~/storage/cookies.server";

export async function loader() {
    return redirect("/login", {
        headers: {
            "Set-Cookie": await cookie.serialize("", {
                expires: new Date(0)
            })
        }
    });
}