import Challenge from "@/app/challenge/challenge";
import {getCookies, getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import ChallengeDescription from "@/app/challenge/description/description";

export default async function ChallengeDescriptionPage() {
    const authorization = getCookie("Authorization", {cookies});

    const abort = new AbortController();

    const user = await ApiManager.getUser(abort.signal, authorization ?? "");
    return <ChallengeDescription userData={user.data}/>
}