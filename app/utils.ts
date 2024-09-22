import { redirect } from "@remix-run/node";

export enum Premission {
    Disabled     = 1 << 0,
    User         = 1 << 1,
    VerifiedUser = 1 << 2,
    Editor       = 1 << 3,
    Admin        = 1 << 4,
}

export function redirectToLogin(request: Request) {
    return redirect("/login?return=" + encodeURIComponent(new URL(request.url).pathname));
}

export function getEmailDomain(email: string) {
    return email.split("@")[1];
}

export function checkIsNDHU(email: string) {
    const domain = getEmailDomain(email);
    return domain.includes("ndhu.edu.tw");
}

export function checkEnum<T>(value: number, enums: T[]) {
    const checked = [];
    let v = value;

    for (let i = 0; i < enums.length; i++) {
        if (v % 2 != 0)
            checked.push(enums[i]);
        v = v >> 1;
    }

    return checked;
}

export function getPremissions(premissionNumber: number) {
    return checkEnum<Premission>(premissionNumber, [
        Premission.Disabled,
        Premission.User,
        Premission.VerifiedUser,
        Premission.Editor,
        Premission.Admin,
    ]);
}

export function googleImageResize(original: string, size: number) {
    return original.replace("=s96-c", `=s${size}-c`);
}

export function classFormat(className: (string | null | undefined)[]) {
    return className.filter(e => !!e).join(" ");
}