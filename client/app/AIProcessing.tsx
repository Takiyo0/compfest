'use client'

import {Manrope} from "next/font/google";
import {useEffect} from 'react'

const manrope = Manrope({subsets: ["latin"]});

export default function AIProcessing() {
    useEffect(() => {
        async function getLoader() {
            const {helix} = await import('ldrs')
            helix.register()
        }

        getLoader();
    }, [])


    return <main className={"flex min-h-screen flex-col items-center justify-center p-24 " + manrope.className}>
        <div className={"flex items-center flex-col"}>
            <l-helix
                size="200"
                speed="2.5"
                color="#84A1F5"/>
            <p className={"mt-7 text-2xl"}>Sedang memproses skill-tree Anda</p>
        </div>
    </main>
}