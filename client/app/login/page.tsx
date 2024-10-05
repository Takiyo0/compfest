'use client'

import {Manrope} from "next/font/google";
import {ApiManager} from "@/app/managers/api";
import LoginPage from "@/app/login/LoginPage";

const manrope = Manrope({subsets: ["latin"]});

export default async function Login() {
    const {data, statusCode} = await ApiManager.GetOauthCode();

    return <LoginPage data={data} statusCode={statusCode}/>
}