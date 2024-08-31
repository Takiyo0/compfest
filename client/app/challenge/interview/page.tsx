import {getCookies, getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import ChallengeInterview from "@/app/challenge/interview/Interview";

export default async function ChallengeInterviewPage() {
    const authorization = getCookie("Authorization", {cookies});

    const abort = new AbortController();

    const user = await ApiManager.getUser(abort.signal, authorization ?? "");
    const interviewQuestions = await ApiManager.GetInterviewQuestions(abort.signal, authorization ?? "");
    return <ChallengeInterview userData={user.data} questions={interviewQuestions.data}/>;
}