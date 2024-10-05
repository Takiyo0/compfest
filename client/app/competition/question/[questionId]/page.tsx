import ErrorPage from "@/app/components/pages/ErrorPage";
import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import QuestionPage from "@/app/competition/question/[questionId]/question";

export default async function Page({
                                       params
                                   }: {
    params: { [key: string]: string | string[] | undefined };
}) {
    const questionId = params?.questionId;
    if (Number.isNaN(questionId)) return <ErrorPage message={"Invalid group id"} errorCode={500}/>;

    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    const {
        data: question,
        statusCode: sc
    } = await ApiManager.GetTopic(abort.signal, authorization ?? "", Number(questionId));
    if (statusCode != 200) return <ErrorPage
        message={"Unknown error occurred while fetching topic data. Please try again later"} errorCode={500}/>

    return <QuestionPage userData={user} topic={question}/>
}