import CompetitionPage from "@/app/competition/competition";
import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager, EventTopic} from "@/app/managers/api";
import {redirect} from "next/navigation";
import ErrorPage from "@/app/components/pages/ErrorPage";
import {urlQueryToSearchParams} from "next/dist/shared/lib/router/utils/querystring";
import * as console from "node:console";


export default async function Page() {
    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();


    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    const {data: currentEvent, statusCode: sc} = await ApiManager.GetCurrentEvent(abort.signal, authorization ?? "");
    if (sc != 200 || !currentEvent) return <ErrorPage
        message={"Internal Server Error. Unable to get current competition status"} errorCode={500}/>

    const topics = new Map<string, EventTopic[]>();

    for (const topic of currentEvent.topics) {
        const current = topics.get(topic.Name);
        if (current) current.push(topic);
        else topics.set(topic.Name, [topic]);
    }

    return <CompetitionPage userData={user} currentEvent={currentEvent} topics={topics}/>
}