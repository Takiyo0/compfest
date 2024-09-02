import Challenge from "@/app/challenge/challenge";
import {getCookies, getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import ChallengeDescription from "@/app/challenge/description/description";
import ErrorPage from "@/app/components/pages/ErrorPage";
import {redirect} from 'next/navigation'

export default async function ChallengeDescriptionPage() {
    const authorization = getCookie("Authorization", {cookies});

    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (!user.userId) return redirect("/login");
    if (user.interviewQuestionStatus == "IN_PROGRESS") return redirect("/challenge/interview");
    if (user.filledSkillInfo) return <ErrorPage message={"Anda sudah mengisi form deskripsi kemampuan Anda"}
                                                errorCode={400}/>
    return <ChallengeDescription userData={user}/>
}