import {getCookies, getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import ChallengeInterview from "@/app/challenge/interview/Interview";
import {redirect} from "next/navigation";
import ErrorPage from "@/app/components/pages/ErrorPage";

export default async function ChallengeInterviewPage() {
    const authorization = getCookie("Authorization", {cookies});

    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200) return redirect("/login");
    if (user.interviewQuestionStatus == 'SUCCESS') return <ErrorPage
        message={"Anda sudah mengisi interview. Untuk mengakses pembahasan, silahkan buka Arsip Pertanyaan di homepage"}
        errorCode={401}/>
    const interviewQuestions = await ApiManager.GetInterviewQuestions(abort.signal, authorization ?? "");
    console.log(interviewQuestions.data.questions)
    return <ChallengeInterview userData={user} questions={interviewQuestions.data}/>;
}