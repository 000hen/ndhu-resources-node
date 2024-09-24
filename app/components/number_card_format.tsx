import { classFormat } from "~/utils";

interface NumberCardFormatArgs {
    amount: number,
    format?: string,
    bold?: boolean
}

export default function NumberCardFormatComponent({ amount, format, bold }: NumberCardFormatArgs) {
    const formatter = Intl.NumberFormat("zh-TW", { notation: "compact" });

    return <span className={classFormat([
        "text-right",
        bold && "font-bold text-4xl"
    ])}>{formatter.format(amount)} {format}</span>
}