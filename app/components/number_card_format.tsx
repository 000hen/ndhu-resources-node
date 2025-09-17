import { classFormat, numberFormat } from "~/utils";

interface NumberCardFormatArgs {
    amount: number,
    format?: string,
    bold?: boolean
}

export default function NumberCardFormatComponent({ amount, format, bold }: NumberCardFormatArgs) {
    return <span className={classFormat([
        "text-right",
        bold && "font-bold text-4xl",
        amount < 0 && "text-red-500",
    ])}>{numberFormat(amount)} {format}</span>
}