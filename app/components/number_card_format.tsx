interface NumberCardFormatArgs {
    amount: number,
    format?: string
}

export default function NumberCardFormatComponent({ amount, format }: NumberCardFormatArgs) {
    const formatter = Intl.NumberFormat("zh-TW");

    return <span className="font-bold text-4xl text-right">{formatter.format(amount)} {format}</span>
}