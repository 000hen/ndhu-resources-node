import { discovery } from "openid-client";

export const resource = await discovery(
    new URL("https://id.muisnowdevs.one"),
    process.env.MUID_CLIENT_ID!,
    process.env.MUID_CLIENT_SECRET!,
);
