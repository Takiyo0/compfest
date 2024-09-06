import {Manrope} from "next/font/google";
import AIProcessing from "@/app/AIProcessing";
import HomePage from "@/app/Homepage";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import { Metadata } from 'next';

const manrope = Manrope({subsets: ["latin"]});


export const metadata: Metadata = {
    title: 'Kuduga AI',
    description: 'platform untuk belajar pemrograman',
};

export default async function Home() {
    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    const {data} = await ApiManager.GetTree(abort.signal, authorization ?? "");

    return data.ready ? <HomePage data={data.skillTree} userData={user}/> : <AIProcessing userData={user}/>;
}