import React, { PropsWithChildren } from "react";

interface HrArgs extends PropsWithChildren {
    title?: React.ReactNode
}

export default function CardComponent({ children, title }: HrArgs) {
    return <div className="card bg-neutral p-5 m-2">
        {title && <h1 className="mb-2">{title}</h1>}
        {children}
    </div>;
}