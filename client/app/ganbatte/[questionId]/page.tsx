import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect, useParams} from "next/navigation";
import ErrorPage from "@/app/components/pages/ErrorPage";
import GanbattePage from "@/app/ganbatte/[questionId]/ganbatte";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Kuduga AI',
    description: 'platform untuk belajar pemrograman',
};

export default async function Page({
                                       params
                                   }: {
    params: { [key: string]: string | string[] | undefined };
}) {
    const questionId = params?.questionId;

    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    if (Number.isNaN(questionId)) return;

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    const {data} = await ApiManager.GetTreeQuestions(abort.signal, authorization ?? "", Number(questionId));
    // @ts-ignore
    if (!isNaN(data.questions![0].correctAnswer ?? "")) return redirect(`/ganbatte/${questionId}/archive`);
    return <GanbattePage userData={user} questions={data} questionId={Number(questionId)}/>
}
