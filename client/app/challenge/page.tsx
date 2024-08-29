import Challenge from "@/app/challenge/challenge";
import {getCookies, getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";

export default async function ChallengePage() {
    const authorization = getCookie("Authorization", {cookies});

    const abort = new AbortController();

    console.log("parent challenge called")

    const user = await ApiManager.getUser(abort.signal, authorization ?? "");
    return <Challenge userData={user.data}/>;
}