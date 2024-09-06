'use client';

import {Manrope} from "next/font/google";
import {Button} from "@nextui-org/react";
import {FaArrowLeft, FaHome} from "react-icons/fa";
import {useRouter} from "next/navigation";

const manrope = Manrope({subsets: ["latin"]});

export default function ErrorPage({message, errorCode, hideBack = false}: {
    message: string,
    errorCode: number,
    hideBack: boolean
}) {
    const router = useRouter();
    return <main
        className={"blue-palette min-w-screen min-h-screen flex flex-col items-center justify-center " + manrope.className}>
        <div className={"flex flex-col items-center justify-center"}>
            <h1 className={"font-bold text-9xl"}>{errorCode}</h1>
            <p className={"text-center"}>{message}</p>
            <div className={"flex"}>
                {!hideBack && <Button color={"default"} className={"mt-5 mr-3"} startContent={<FaArrowLeft size={20}/>}
                                      onPress={() => router.back()}>
                    Kembali
                </Button>}
                <Button color={"primary"} className={"mt-5"} startContent={<FaHome size={20}/>}
                        onPress={() => window.location.href = '/'}>
                    Kembali ke Beranda
                </Button>
            </div>
        </div>
    </main>
}