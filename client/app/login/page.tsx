﻿'use client'

import {LogoComponent} from "@/app/assets/images/logo";
import {Manrope} from "next/font/google";
import {Button} from "@nextui-org/react";
import {FaGithub} from "react-icons/fa";
import {useEffect} from "react";
import {setCookie} from "cookies-next";
import {ApiManager} from "@/app/managers/api";

const manrope = Manrope({subsets: ["latin"]});

export default function Login() {
    useEffect(() => {
        setCookie('Authorization', ApiManager.Encrypt("MTo3QldETlhjaTRuTERNa1huQWoyWThPelR6Qk53UjRyVXF4a05mS2tKTWJ1RlJ1MnJpRWZXeUFhRjJaY0pEUHJx"));
    }, [])
    return <main
        className={"w-screen h-screen " + manrope.className}>
        <div
            className={"bg-[#00000052] w-[90vw] max-w-xl relative left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 rounded-3xl shadow-2xl drop-shadow-2xl"}>
            <LogoComponent viewBox={"0 0 35 28"} className={"w-28 h-28 mx-auto"}/>
            <h1 className={"text-3xl font-semibold text-center mt-2"}>Kuduga AI</h1>
            <h3 className={"text-center mt-2 text-xl"}>Identify your core skills and interests</h3>
            <div className={"min-h-32 w-full max-w-96 ml-auto mr-auto flex items-center"}>
                <Button color="primary" className={"w-full text-[1.1rem] h-12"} startContent={<FaGithub size={30}/>}>
                    Login with GitHub
                </Button>
            </div>
        </div>
    </main>
}