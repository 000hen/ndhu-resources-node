import { LoaderFunctionArgs } from "react-router";
import { authorizationCodeGrant, fetchUserInfo } from "openid-client";
import { resource } from "~/auth/muid.server";
import { auth } from "~/firebase.server";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const base = new URL(process.env.APP_URL!);

    url.protocol = base.protocol;
    url.host = base.host;

    const token = await authorizationCodeGrant(resource, url, {
        expectedState: url.searchParams.get("state") || undefined,
    });

    const user = await fetchUserInfo(
        resource,
        token.access_token,
        token.claims()?.sub ?? ""
    );

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
            const delay = ms => new Promise(res => setTimeout(res, ms));
            (async () => {
                while (true) {
                    window.opener.postMessage({
                        type: "muid-callback",
                        token: ${JSON.stringify(customToken)}
                    }, window.location.origin);
                    await delay(100);
                }
            })();
        </script>
        `,
        { headers: { "Content-Type": "text/html" } }
    );
}
