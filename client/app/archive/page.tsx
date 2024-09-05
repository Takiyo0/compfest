import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import Archive from "@/app/archive/Archive";

export default async function Page() {
    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (user.interviewQuestionStatus == "IN_PROGRESS") return redirect("/challenge/interview");

    const {data} = await ApiManager.GetAnsweredQuestions(abort.signal, authorization ?? "");

    return <Archive userData={user} data={data}/>;
}