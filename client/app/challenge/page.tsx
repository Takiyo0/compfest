import Challenge from "@/app/challenge/challenge";
import {getCookies} from "cookies-next";
import {cookies} from "next/headers";

export default function ChallengePage() {
    const testCookies = getCookies({cookies});
    console.log(testCookies);

    return <Challenge/>
}