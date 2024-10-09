export enum Premission {
    Disabled     = 1 << 0,
    User         = 1 << 1,
    VerifiedUser = 1 << 2,
    Editor       = 1 << 3,
    Admin        = 1 << 4,
}

export enum ResourceStatus {
    Pending  = "pending",
    Approved = "approved",
    Rejected = "rejected",
}

export enum ResourceCategory {
    Textbook = "textbook",
    Homework = "homework",
    Exam     = "exam",
    Note     = "note",
    Answer   = "answer",
    Other    = "other",
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

export function classFormat(className: (string | null | undefined | boolean)[]) {
    return className.filter(e => !!e).join(" ");
}

export const humanFileSize = (size: number) => {
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return +((size / Math.pow(1024, i)).toFixed(2)) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export const downloadURI = (url: string, name?: string) => {
    const link = document.createElement("a");
    if (name)
        link.setAttribute('download', name);
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

export const numberFormat = (num: number) => {
    const formatterText = new Intl.NumberFormat("zh-TW", { notation: "compact" });
    const formatter = new Intl.NumberFormat("en-US");
    const format = formatterText.format(num)
        .replace(/([0-9]*)/gm, "$1 ")
        .split(" ");
    
    if (format.length == 2)
        format[0] = formatter.format(Number(format[0]));

    return format.join("");
}

export const isMimeSafe = (mime: string) => {
    return mime.includes("image")
        || mime.includes("pdf")
        || mime.includes("video")
        || mime.includes("audio")
        || mime.includes("text");
}