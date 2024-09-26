import { AppLoadContext, redirect } from "@remix-run/node";
import { DecodedIdToken } from "./types/firebase";
import { auth as serverAuth } from "./firebase.server";
import cookie from "./cookies.server";
import db from "./db/client.server";
import { eq, sql } from "drizzle-orm";

interface CheckLoginArgs {
    request: Request,
    context: AppLoadContext
}

export interface AuthInfo {
    auth: boolean,
    id?: string,
    display?: string,
    email?: string,
    profile?: string,
    via?: string
}

export function redirectToLogin(request: Request) {
    return redirect("/login?return=" + encodeURIComponent(new URL(request.url).pathname));
}

export async function checkLogin({ request }: CheckLoginArgs): Promise<DecodedIdToken> {
    const cookieHeader = request.headers.get("Cookie");
    const cookies = await cookie.parse(cookieHeader);

    return new Promise((res, rej) => {
        if (!cookies)
            return rej(false);

        try {
            return serverAuth
                .verifySessionCookie(cookies)
                .then(e => e as unknown as DecodedIdToken)
                .then(e => res(e))
                .catch(() => rej(false));
        } catch (e) {
            return rej(false);
        }
    });
}

export async function getAuthInfo({ request, context }: { request: Request, context: AppLoadContext }): Promise<AuthInfo> {
    let auth: DecodedIdToken;

    try {
        auth = await checkLogin({ request, context });
    } catch (e) {
        return {
            auth: false
        };
    }

    return {
        auth: true,
        display: auth.name,
        email: auth.email,
        profile: auth.picture,
        via: auth.firebase.sign_in_provider,
        id: auth.sub
    };
}

export async function getAuthInfoWithPremission({ request, context }: { request: Request, context: AppLoadContext }) {
    const auth = await getAuthInfo({ request, context });
    const premission = await db
        .query
        .premissions
        .findFirst({
            columns: {
                premission: true
            },
            where: (v) => eq(v.user_id, sql.placeholder("id")),
        })
        .prepare()
        .execute({
            id: auth.id || ""
        });

    return {
        ...auth,
        ...premission
    };
}