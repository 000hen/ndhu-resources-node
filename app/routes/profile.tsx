import { LoaderFunctionArgs } from "@remix-run/node";
import { getAuthInfo, redirectToLogin } from "~/utils.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
    const auth = await getAuthInfo({ request, context });
    if (!auth.auth)
        return redirectToLogin(request);

    return null;
}