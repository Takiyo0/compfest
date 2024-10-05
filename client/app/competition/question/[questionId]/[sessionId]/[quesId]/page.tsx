import ErrorPage from "@/app/components/pages/ErrorPage";
import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import q from "refractor/lang/q";
import {Utils} from "@/app/managers/utils";
import QuestionFilling from "@/app/competition/question/[questionId]/[sessionId]/[quesId]/question";

export default async function Page({
                                       params
                                   }: {
    params: { [key: string]: string | string[] | undefined };
}) {
    const questionId = params?.questionId;
    const sessionId = params?.sessionId;
    const qId = params?.quesId;
    if (Number.isNaN(questionId) || Number.isNaN(sessionId) || Number.isNaN(qId)) return <ErrorPage
        message={"Invalid session Id or question Id"}
        errorCode={500}/>;

    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    const {
        data: question,
        statusCode: sc
    } = await ApiManager.GetQuestion(abort.signal, authorization ?? "", Number(questionId), Number(qId), Number(sessionId));
    if (statusCode != 200) return <ErrorPage message={"Unable to get question ID"} errorCode={401}/>

    let parsed: string[] | undefined;
    try {
        parsed = JSON.parse(question.choices);
    } catch (e) {
        return <ErrorPage message={"Unable to parse the choices. Please report to admin immediately"} errorCode={500}/>
    }

    const newChoices = parsed!.map((content, i) => ({id: i + 1, content}));
    Utils.shuffleArray(newChoices);

    return <QuestionFilling userData={user} question={question} shuffledChoices={newChoices}/>
}