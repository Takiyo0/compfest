import Challenge from "@/app/challenge/challenge";
import {getCookies, getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import ChallengeDescription from "@/app/challenge/description/description";
import ErrorPage from "@/app/components/pages/ErrorPage";
import {redirect} from 'next/navigation'
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Kuduga AI',
    description: 'platform untuk belajar pemrograman',
};
export default async function ChallengeDescriptionPage() {
    const authorization = getCookie("Authorization", {cookies});

    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (!user.userId) return redirect("/login");
    if (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS') return redirect("/challenge/interview");
    if (user.filledSkillInfo) return <ErrorPage message={"Anda sudah mengisi form deskripsi kemampuan Anda"}
                                                errorCode={400}/>
    return <ChallengeDescription userData={user}/>
}