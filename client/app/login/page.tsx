import {Manrope} from "next/font/google";
import {ApiManager} from "@/app/managers/api";
import LoginPage from "@/app/login/LoginPage";
import CookieManager from "@/app/components/cookie";

const manrope = Manrope({subsets: ["latin"]});

export default async function Login() {
    const {data, statusCode} = await ApiManager.GetOauthCode();

    return <>
        {statusCode == 200 && <CookieManager type={"SET_OAUTH"} value={data.state}/>}
        <LoginPage data={data} statusCode={statusCode}/>
    </>
}