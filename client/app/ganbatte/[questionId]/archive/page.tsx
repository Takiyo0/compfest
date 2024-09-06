import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import Archive from "@/app/ganbatte/[questionId]/archive/archive";
import Error from "next/error";
import ErrorPage from "@/app/components/pages/ErrorPage";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Kuduga AI',
    description: 'platform untuk belajar pemrograman',
};
export default async function Page({params}: { params: { [key: string]: string | string[] | undefined } }) {
    const questionId = params?.questionId;

    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    if (Number.isNaN(questionId) && questionId !== "interview") return;

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    let d, s;

    if (questionId === "interview") {
        const {
            data,
            statusCode: code
        } = await ApiManager.GetInterviewQuestions(abort.signal, authorization ?? "");
        d = data;
        s = code;
    } else {
        const {
            data,
            statusCode: code
        } = await ApiManager.GetTreeQuestions(abort.signal, authorization ?? "", Number(questionId));
        d = data;
        s = code;
    }

    if (s !== 200) return <ErrorPage message={"Pertanyaan tidak ditemukan"} errorCode={404}/>;
    if (!d.ready) return <ErrorPage message={"Pertanyaan belum di buat"} errorCode={501}/>;
    if (d.questions && Number.isNaN(d.questions[0]?.correctAnswer)) return <ErrorPage message={"Anda belum menjawab pertanyaan ini"}
                                                                         errorCode={400}/>;


    return <Archive userData={user} questions={d.questions}/>
}