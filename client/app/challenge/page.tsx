import Challenge from "@/app/challenge/challenge";
import {getCookies, getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import ErrorPage from "@/app/components/pages/ErrorPage";

export default async function ChallengePage() {
    const authorization = getCookie("Authorization", {cookies});

    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (!user.userId) return redirect("/login");
    if (user.interviewQuestionStatus == "IN_PROGRESS") return redirect("/challenge/interview");
    if (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS') return redirect("/challenge/interview");
    if (user.filledSkillInfo) return <ErrorPage message={"Anda sudah tidak bisa memilih opsi lagi disini"}
                                                errorCode={400}/>
    return <Challenge userData={user}/>;
}