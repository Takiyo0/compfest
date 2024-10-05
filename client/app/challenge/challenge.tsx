'use client'

import {UserInfoResponse} from "@/app/managers/api";
import {Avatar, Button} from "@nextui-org/react";
import {Manrope} from "next/font/google";
import {FaGithubAlt} from "react-icons/fa";
import {FaPencilAlt} from "react-icons/fa";
import {useRouter} from "next/navigation";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import React from "react";

const manrope = Manrope({subsets: ["latin"]});

export default function Challenge({userData}: { userData: UserInfoResponse['data'] }) {
    const router = useRouter();

    function GetGreeting(): string {
        const currentHour = new Date().getHours();

        if (currentHour >= 0 && currentHour < 12) {
            return "Selamat Pagi";  // Morning (00:00 - 11:59)
        } else if (currentHour >= 12 && currentHour < 15) {
            return "Selamat Siang"; // Noon (12:00 - 14:59)
        } else if (currentHour >= 15 && currentHour < 18) {
            return "Selamat Sore";  // Afternoon (15:00 - 17:59)
        } else {
            return "Selamat Malam"; // Evening/Night (18:00 and later)
        }
    }

    return <>
        <Header userInfo={userData} center/>
        <main className={"blue-palette min-w-screen min-h-screen flex flex-col items-center pt-10 box-border " + manrope.className}>
            <div className={"mt-20 flex flex-col items-center max-w-96"}>
                <Avatar src={`https://avatars.githubusercontent.com/u/${userData.userId}?v=4`} className={"w-44 h-44"}/>
                <p className={"p-0 mt-5 text-[1.5rem] flex flex-col items-center"}>{GetGreeting()}, <br/><a
                    className={"font-bold gradient-user-1"}> {userData.username}</a></p>
                <p className={"text-center mt-5"}>Silahkan pilih sumber info yang akan kami gunakan untuk membuat Skill
                    Tree
                    Anda</p>
                {/*<Button startContent={<FaGithubAlt size={30}/>} color={"primary"} className={"w-full mt-5 text-[1.1rem]"} onClick={() => router.push("/idk")}>*/}
                {/*    gunakan profil GitHub*/}
                {/*</Button>*/}
                <Button startContent={<FaPencilAlt size={24}/>} color={"primary"}
                        className={"w-full mt-5 text-[1.1rem]"} onClick={() => router.push("/challenge/description")}>
                    deskripsikan skill
                </Button>
            </div>
        </main>
        <Footer/>
    </>
}