import {NextUIProvider} from '@nextui-org/react'
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import React from "react";

export function Providers({children}: { children: React.ReactNode }) {
    return (
        <NextUIProvider className={"blue-palette text-foreground bg-background"}>
            {children}
        </NextUIProvider>
    )
}