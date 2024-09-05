import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect} from "next/navigation";
import Archive from "@/app/archive/Archive";

export default async function Page() {
    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");

    if (!user.userId) return redirect("/login");

    return <Archive userData={user}/>;
}