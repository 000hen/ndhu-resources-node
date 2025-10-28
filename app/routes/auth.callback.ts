import { LoaderFunctionArgs } from "@remix-run/node";
import { authorizationCodeGrant, fetchUserInfo } from "openid-client";
import { resource } from "~/auth/muid.server";
import { auth } from "~/firebase.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const token = await authorizationCodeGrant(
        resource,
        url,
        {
            expectedState: url.searchParams.get("state") || undefined,
        },
        {
            redirect_uri: new URL(
                "/auth/callback",
                process.env.APP_URL!
            ).toString(),
        }
    );

    const user = await fetchUserInfo(
        resource,
        token.access_token,
        token.claims()?.sub ?? ""
    );

    console.log("Fetched user info:", user);

    const fbUser = await auth
        .getUserByEmail(user.email!)
        .then(async (userRecord) => {
            return auth.updateUser(userRecord.uid, {
                photoURL: user.picture,
                displayName: user.name,
                emailVerified: user.email_verified,
            });
        })
        .catch(() => {
            return auth.createUser({
                uid: user.sub,
                email: user.email,
                displayName: user.name,
                photoURL: user.picture,
                emailVerified: user.email_verified,
            });
        });

    const customToken = await auth.createCustomToken(fbUser.uid);

    return new Response(
        `
        <script>
            window.postMessage({
                token: ${JSON.stringify(customToken)}
            }, window.location.origin);
            window.close();
        </script>
        `,
        { headers: { "Content-Type": "text/html" } }
    );
}
