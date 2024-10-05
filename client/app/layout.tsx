import React from "react";
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import {Providers} from "@/app/providers";
import "./globals.css";
import {Toaster} from "react-hot-toast";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Kuduga AI",
    description: "Tempat para programmer belajar"
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={"dark"}>
            <body className={inter.className}>
                <Providers>
                    <Toaster position={"top-right"}/>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
