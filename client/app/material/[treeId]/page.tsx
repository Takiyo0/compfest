import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import ErrorPage from "@/app/components/pages/ErrorPage";
import Material from "@/app/material/[treeId]/Material";

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
    if (!user.userId) return redirect("/login");

    const {data, statusCode: code} = await ApiManager.GetTree(abort.signal, authorization ?? "");
    if (code !== 200) return <ErrorPage message={"Terjadi kesalahan pada server. Silahkan coba lagi nanti"}
                                        errorCode={500}/>
    if (!data.ready) return <ErrorPage message={"Skill tree belum di buat. Harap menunggu"}
                                       errorCode={400}/>
    const target = data.skillTree.find(x => x.id === Number(questionId));
    console.log([Number(questionId), target, data.skillTree])
    if (!target) return <ErrorPage message={"Skill tree tidak ditemukan"} errorCode={404}/>

    return <Material userData={user} skillTree={target}/>
}