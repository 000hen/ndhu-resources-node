import { redirect } from "react-router";
import { buildAuthorizationUrl, randomState } from "openid-client";
import { resource } from "~/auth/muid.server";

export async function loader() {
    const params: Record<string, string> = {
        redirect_uri: new URL(
            "/auth/callback",
            process.env.APP_URL!
        ).toString(),
        scope: "openid email profile",
        state: randomState(),
    };

    const redirectUrl = buildAuthorizationUrl(resource, params).toString();
    console.log("Redirecting to:", redirectUrl);

    return redirect(redirectUrl);
}
