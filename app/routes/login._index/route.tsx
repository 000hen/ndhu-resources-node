import { ActionFunction, redirect, MetaFunction } from "@remix-run/node";
import { FaUser } from "react-icons/fa";
import { auth as clientAuth } from "~/firebase.client";
import { auth as serverAuth } from "~/firebase.server";
import {
    Link,
    useFetcher,
    useNavigate,
    useRouteLoaderData,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import cookie from "~/storage/cookies.server";
import Hr from "~/components/hr";
import db from "~/db/client.server";
import { premissions } from "~/db/schema";
import { eq, sql } from "drizzle-orm";
import { checkIsNDHU, Premission } from "~/utils";
import { loader as rootLoader } from "~/root";
import { DecodedIdToken } from "~/types/firebase";
import { signInWithCustomToken } from "firebase/auth";

export const meta: MetaFunction = () => {
    return [
        { title: "登入 - 東華資源庫" },
        {
            name: "description",
            content: "登入至東華資源庫。",
        },
    ];
};

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const idToken = form.get("idToken")?.toString();

    invariant(idToken, "Missing token");
    const data = (await serverAuth.verifyIdToken(
        idToken
    )) as unknown as DecodedIdToken;
    const jwt = await serverAuth.createSessionCookie(idToken, {
        expiresIn: 60480000,
    });

    const user = await db
        .select({
            premission: premissions.premission,
            display: premissions.display,
        })
        .from(premissions)
        .where(eq(premissions.user_id, sql.placeholder("id")))
        .limit(1)
        .prepare()
        .execute({
            id: data.sub,
        });

    if (!user.length) {
        await db
            .insert(premissions)
            .values({
                user_id: sql.placeholder("id"),
                premission: sql.placeholder("premission"),
                display: sql.placeholder("display"),
            })
            .prepare()
            .execute({
                id: data.sub,
                premission:
                    data.email_verified && checkIsNDHU(data.email || "")
                        ? Premission.VerifiedUser
                        : Premission.User,
                display: data.name,
            });
    }

    if (user[0] && data.name !== user[0].display && user.length) {
        await db
            .update(premissions)
            .set({
                display: data.name,
            })
            .where(eq(premissions.user_id, sql.placeholder("id")))
            .prepare()
            .execute({
                id: data.sub,
            });
    }

    const url = new URL(request.url);
    const redirectPath = url.searchParams.get("return") || "/resources";

    return redirect(redirectPath, {
        headers: {
            "Set-Cookie": await cookie.serialize(jwt),
        },
    });
};

export default function LoginIndex() {
    const fetcher = useFetcher<typeof action>();
    const navigate = useNavigate();
    const data = useRouteLoaderData<typeof rootLoader>("root");

    function sendIdToken(idToken: string) {
        fetcher.submit({ idToken }, { method: "post" });
    }

    // function signUpWithMuID() {
    //     const provider = new OAuthProvider("oidc.muid");
    //     signInWithPopup(clientAuth, provider)
    //         .then(async (result) => {
    //             const additionalUserInfo = getAdditionalUserInfo(result);
    //             await updateProfile(result.user, {
    //                 photoURL: additionalUserInfo?.profile?.picture as string,
    //             });
    //             return result.user.getIdToken();
    //         })
    //         .then((token) => sendIdToken(token));
    // }

    function signUpWithMuID() {
        const popup = window.open(
            "/auth/muid",
            "MuID Login",
            "width=500,height=600"
        );

        const receiveMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.token) {
                popup?.close();
                popup?.removeEventListener("message", receiveMessage);

                signInWithCustomToken(clientAuth, event.data.token)
                    .then((result) => result.user.getIdToken())
                    .then((token) => sendIdToken(token));
            }
        };

        popup?.addEventListener("message", receiveMessage);
    }

    function signUpWithCurrentAccount() {
        navigate("/resources");
    }

    return (
        <div>
            <div className="mb-5">
                <h1 className="text-4xl text-black mb-0">登入/註冊</h1>
                <span className="text-sm text-gray-500 mt-2 block max-w-96">
                    請注意！我們僅提供 @gms.ndhu.edu.tw 的使用者使用
                </span>
            </div>
            {data?.auth && (
                <>
                    <AuthWithAccount
                        display={data.display}
                        email={data.email || ""}
                        profile={data.profile}
                        onClick={signUpWithCurrentAccount}
                    />
                    <Hr>OR</Hr>
                </>
            )}
            <div>
                <button
                    onClick={signUpWithMuID}
                    className="block w-full btn btn-info"
                >
                    <span className="flex items-center">
                        <FaUser className="inline mr-2" />
                        使用您的 MuID 帳戶登入
                    </span>
                </button>
                <p className="text-xs text-gray-500 mt-3 mb-0">
                    若您使用 MuID 登入，即代表您已悉知並同意⟪
                    <Link
                        to="https://muisnowdevs.one/privacy"
                        className="underline"
                    >
                        Muisnow Devs 隱私權政策
                    </Link>
                    ⟫
                </p>
            </div>
        </div>
    );
}

function AuthWithAccount({
    display,
    email,
    profile,
    onClick,
}: {
    display: string;
    email: string;
    profile: string | undefined;
    onClick: () => void;
}) {
    return (
        <div className="card shadow-2xl p-3 bg-gray-800">
            <h2>使用已登入帳號繼續</h2>
            <div className="w-full grid place-content-center mb-5">
                <img
                    referrerPolicy="no-referrer"
                    className="rounded-full w-32"
                    alt="Profile"
                    src={profile || ""}
                />
            </div>
            <button
                onClick={onClick}
                className="btn btn-success w-full shadow-xl"
            >
                以 {display ?? ""} ({email}) 繼續
            </button>
        </div>
    );
}
