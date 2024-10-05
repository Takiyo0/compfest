'use client'

import {Button} from "@nextui-org/react";
import React from "react";
import {useRouter} from "next/navigation";

export default function ButtonNavigation({name, active, icon, redirectTo}: {
    name: string,
    active: boolean,
    redirectTo: string,
    icon: React.ReactNode
}) {
    const router = useRouter();

    return <Button startContent={icon} className={"w-full text-left mt-2 justify-start"}
                   color={active ? "primary" : undefined}
                   onClick={() => {
                       router.push(redirectTo);
                       router.refresh();
                   }}
                   variant={active ? "shadow" : undefined}>{name}</Button>
}