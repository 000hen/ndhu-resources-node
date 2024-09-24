import { ActionFunction, redirect, json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { FaGoogle } from "react-icons/fa";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth as clientAuth } from "~/firebase.client";
import { auth as serverAuth } from "~/firebase.server";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import cookie from "~/cookies.server";
import Hr from "~/components/hr";
import { AuthInfo, getAuthInfo } from "~/utils.server";
import db from "~/db/client.server";
import { premissions } from "~/db/schema";
import { eq, sql } from "drizzle-orm";

export const meta: MetaFunction = () => {
    return [
        { title: "登入 - 東華資源庫" },
        {
            name: "description",
            content: "登入至東華資源庫。",
        },
    ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
    return json<AuthInfo>(await getAuthInfo({ request, context }));
}

export const action: ActionFunction = async ({ request }) => {
    const form = await request.formData();
    const idToken = form.get("idToken")?.toString();

    invariant(idToken, "Missing token");
    const data = await serverAuth.verifyIdToken(idToken);
    const jwt = await serverAuth.createSessionCookie(idToken, { expiresIn: 60480000 });

    const user = await db
        .select({
            premission: premissions.premission
        })
        .from(premissions)
        .where(eq(premissions.user_id, sql.placeholder("id")))
        .limit(1)
        .prepare()
        .execute({
            id: data.sub
        });

    if (!user.length) {
        await db
            .insert(premissions)
            .values({
                user_id: data.sub,
                premission: data.email_verified ? 4 : 2
            });
    }

    const url = new URL(request.url);
    const redirectPath = url.searchParams.get("return") || "/dashboard";

    return redirect(redirectPath, {
        headers: {
            "Set-Cookie": await cookie.serialize(jwt)
        }
    });
};

export default function LoginIndex() {
    const fetcher = useFetcher<typeof action>();
    const navigate = useNavigate();
    const data = useLoaderData<typeof loader>();

    function sendIdToken(idToken: string) {
        fetcher.submit({ idToken }, { method: "post" });
    }

    function signUpWithGoogle() {
        const provider = new GoogleAuthProvider();
        signInWithPopup(clientAuth, provider)
            .then((result) => result.user.getIdToken())
            .then((token) => sendIdToken(token));
    }

    function signUpWithCurrentAccount() {
        navigate("/dashboard");
    }

    return <div>
        <div className="mb-5">
            <h1 className="text-4xl text-black">登入/註冊</h1>
        </div>
        {
            data.auth && <>
                <div className="card shadow-2xl p-3 bg-gray-800">
                    <h2>使用已登入帳號繼續</h2>
                    <div className="w-full grid place-content-center mb-5">
                        <img referrerPolicy="no-referrer" className="rounded-full w-32" alt="Profile" src={data.profile || ""} />
                    </div>
                    <button onClick={signUpWithCurrentAccount} className="btn btn-success w-full shadow-xl">
                        以 {data.display ?? ""} ({data.email}) 繼續
                    </button>
                </div>

                <Hr>OR</Hr>
            </>
        }
        <div>
            <button onClick={signUpWithGoogle} className="block w-full mb-2 btn btn-info">
                <span className="flex items-center">
                    <FaGoogle className="inline mr-2" />
                    使用您的 Google 帳戶登入
                </span>
            </button>
        </div>
    </div>;
}