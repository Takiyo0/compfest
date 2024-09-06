import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import ErrorPage from "@/app/components/pages/ErrorPage";
import Material from "@/app/material/[treeId]/Material";
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
    const questionId = params?.treeId;

    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    if (Number.isNaN(questionId)) return;

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    const {data, statusCode: code} = await ApiManager.GetTree(abort.signal, authorization ?? "");
    if (code !== 200) return <ErrorPage message={"Terjadi kesalahan pada server. Silahkan coba lagi nanti"}
                                        errorCode={500}/>
    if (!data.ready) return <ErrorPage message={"Skill tree belum di buat. Harap menunggu"}
                                       errorCode={400}/>
    const target = data.skillTree.find(x => x.id === Number(questionId));

    if (!target) return <ErrorPage message={"Skill tree tidak ditemukan"} errorCode={404}/>

    return <Material userData={user} skillTree={target}/>
}