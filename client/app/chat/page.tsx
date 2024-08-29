import {Manrope} from "next/font/google";
import {cookies} from "next/headers";
import {getCookies, setCookie} from "cookies-next";
import {ApiManager} from "@/app/managers/api"
import Chat from "@/app/chat/chat";


const manrope = Manrope({subsets: ["latin"]});

export default async function Page() {
    const testCookies = getCookies({cookies});
    console.log(testCookies);

    const abortion = new AbortController();

    const userInfo = await ApiManager.getUser(abortion.signal, "testing");
    console.log(userInfo);


    return <Chat userInfo={userInfo}/>
}