import {getCookies, getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import ChallengeInterview from "@/app/challenge/interview/Interview";
import {redirect} from "next/navigation";

export default async function ChallengeInterviewPage() {
    const authorization = getCookie("Authorization", {cookies});

    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200) return redirect("/login");
    if (!user.filledSkillInfo) return redirect("/challenge/description");
    if (user.interviewQuestionStatus == 'SUCCESS') return redirect("/");
    const interviewQuestions = await ApiManager.GetInterviewQuestions(abort.signal, authorization ?? "");

    return <ChallengeInterview userData={user} questions={interviewQuestions.data}/>;
}