import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import GroupPage from "@/app/competition/groups/groups";
import ErrorPage from "@/app/components/pages/ErrorPage";

export default async function Page() {
    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();


    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    const {data: groups, statusCode: sc} = await ApiManager.GetGroups(abort.signal, authorization ?? "");
    if (sc != 200 || !groups) return <ErrorPage message={"Internal Server Error. Unable to get groups"} errorCode={500}/>;

    return <GroupPage userData={user} groups={groups}/>
}