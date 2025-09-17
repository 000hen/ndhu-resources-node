import { AppLoadContext, redirect } from "@remix-run/node";
import { DecodedIdToken } from "./types/firebase";
import { auth as serverAuth } from "./firebase.server";
import cookie from "./storage/cookies.server";
import db from "./db/client.server";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

interface CheckLoginArgs {
    request: Request,
    context: AppLoadContext
}

export interface AuthedInfo {
    auth: true,
    display: string,
    email?: string,
    profile?: string,
    via: string,
    id: string
}
export type AuthInfo =
    | { auth: false }
    | AuthedInfo    

export type AuthInfoWithPremission = AuthInfo & { premission: number }

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

export async function getAuthInfoWithPremission({ request, context }: { request: Request, context: AppLoadContext }): Promise<AuthInfoWithPremission> {
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
            id: (auth.auth && auth.id) || ""
        });

    return {
        ...auth,
        premission: premission?.premission || 0
    };
}

const getValidationKey = () => {
    const key = process.env.VALIDATION_SECRET;
    if (!key) throw new Error("No validation secret found");
    return crypto.createHash("sha256").update(key).digest();
};

const getBinaryDataHash = (data: string) => crypto
    .createHash("sha256")
    .update(Buffer.from(data, "utf-8"))
    .digest();

export const createServerValidation = (data: string) => {
    const dataHash = getBinaryDataHash(data);
    const binaryKey = getValidationKey();
    const iv = crypto.randomBytes(16);
    const signature = crypto
        .createCipheriv("aes-256-cbc", binaryKey, iv)
        .update(dataHash);

    return signature.toString("base64") + iv.toString("hex");
};

export const validateServerValidation = (data: string, signature: string): boolean => {
    const dataHash = getBinaryDataHash(data);
    const binaryKey = getValidationKey();
    const iv = Buffer.from(signature.slice(-32), "hex");
    const signatureData = Buffer.from(signature.slice(0, -32), "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", binaryKey, iv);
    decipher.setAutoPadding(false);

    let deciphered = decipher.update(signatureData);
    deciphered = Buffer.concat([deciphered, decipher.final()]);

    return Buffer.compare(deciphered, dataHash) === 0;
};
