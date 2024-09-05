'use client'

import {Manrope} from "next/font/google";
import {useEffect, useRef} from 'react'
import {ApiManager, UserInfoResponse} from "@/app/managers/api";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import TetrisGame from "@/app/components/Tetris";
import {useWindowSize} from "@react-hook/window-size";
import {getCookie} from "cookies-next";
import toast from "react-hot-toast";

const manrope = Manrope({subsets: ["latin"]});

export default function AIProcessing({userData}: {
    userData: UserInfoResponse['data']
}) {
    const [width] = useWindowSize();
    const interval = useRef<NodeJS.Timeout>();
    const controller = useRef(new AbortController());
    const authorization = getCookie('Authorization');

    useEffect(() => {
        async function getLoader() {
            const {helix} = await import('ldrs')
            helix.register()
        }

        getLoader();

        window.addEventListener("keydown", function (e) {
            if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);

        interval.current = setInterval(async () => {
            if (controller.current.signal.aborted) {
                clearInterval(interval.current);
                return;
            }

            const {data, statusCode} = await ApiManager.GetTree(controller.current.signal, authorization ?? "");
            if (statusCode == 200 && data && data.ready) window.location.reload();
            if (statusCode != 200) toast.error(`Server returned: ${statusCode}. Something wrong?`);
        }, 5000);

        return () => {
            controller.current.abort();
            clearInterval(interval.current);
        }
    }, [])


    return <>
        <Header userInfo={userData} center/>
        <main
            className={"blue-palette flex flex-col items-center justify-center p-24 " + manrope.className + (width < 1024 ? ' !pl-2 !pr-2' : ' ')}>
            <div className={"flex items-center flex-col"}>
                <l-helix
                    size="200"
                    speed="2.5"
                    color="#84A1F5"/>
                <p className={"mt-7 text-2xl"}>Sedang memproses skill-tree Anda</p>
            </div>
            <TetrisGame/>
        </main>
        <Footer/>
    </>
}