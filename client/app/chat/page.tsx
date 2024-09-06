import {cookies} from "next/headers";
import {getCookie} from "cookies-next";
import {ApiManager, ChatMessagesResponse} from "@/app/managers/api"
import Chat from "@/app/chat/chat";
import {redirect} from "next/navigation";
import ErrorPage from "@/app/components/pages/ErrorPage";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Kuduga AI',
    description: 'platform untuk belajar pemrograman',
};
export default async function Page() {
    const controller = new AbortController();
    const authorization = getCookie("Authorization", {cookies});
    const {data: user, statusCode} = await ApiManager.getUser(controller.signal, authorization ?? "");

    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    let {data, statusCode: code} = await ApiManager.GetChatTopics(controller.signal, authorization ?? "");
    if (!Array.isArray(data) && code != 200) return <ErrorPage
        message={"Unknown response from server is received. Please try again later"} errorCode={500}/>;

    let messages: ChatMessagesResponse['data'] | undefined;
    if (data.length) messages = await ApiManager.GetChatMessages(controller.signal, authorization ?? "", data[0].id).then(x => x.data).catch(() => undefined);

    return <Chat userInfo={user} baseTopics={data} baseMessages={messages}/>
}