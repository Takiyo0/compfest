import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import GroupPage from "@/app/competition/groups/groups";
import ErrorPage from "@/app/components/pages/ErrorPage";
import Header from "@/app/components/header";
import Group from "@/app/competition/groups/[groupId]/group";

export default async function Page({
                                       params
                                   }: {
    params: { [key: string]: string | string[] | undefined };
}) {
    const groupId = params?.groupId;
    if (Number.isNaN(groupId)) return <ErrorPage message={"Invalid group id"} errorCode={500}/>;

    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    const {
        data: group,
        statusCode: sc
    } = await ApiManager.GetGroup(abort.signal, authorization ?? "", Number(groupId));
    if (sc != 200 && !!group) return <ErrorPage
        message={(group as any)?.message ?? "Unknown error occurred. Please try again later"} errorCode={403}/>;
    if (sc != 200 || !group) return <ErrorPage message={"Internal Server Error. Unable to get groups"}
                                               errorCode={500}/>;

    return <Group group={group} userData={user}/>
}