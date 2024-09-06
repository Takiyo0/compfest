import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import ErrorPage from "@/app/components/pages/ErrorPage";
import {ApiManager} from "@/app/managers/api";
import Callback from "@/app/user/auth-callback/callback";

export default async function Page({
                                       searchParams,
                                   }: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const state = searchParams.state as string;
    const code = searchParams.code as string;
    if (!state || !code) return <ErrorPage message={"Haha what are you doing here. Get out"} errorCode={401} hideBack/>;

    const stateCookie = getCookie('oauth_state', {cookies});
    if (state != stateCookie) return <ErrorPage message={"Mismatch. Please go back home"} errorCode={401} hideBack/>;

    const {data, statusCode} = await ApiManager.SendOauthCode(code, state);
    console.log([data, code, state])
    if (statusCode != 200) return <ErrorPage message={"Unexpected response from server. Please try again later"}
                                             errorCode={500} hideBack/>;

    return <Callback token={data.token}/>
}