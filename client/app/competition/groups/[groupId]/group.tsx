'use client'

import {GroupListResponse, GroupResponse, UserInfoResponse} from "@/app/managers/api";
import {useRouter} from "next/navigation";
import {useWindowSize} from "@react-hook/window-size";
import {motion, useCycle} from "framer-motion";
import Header from "@/app/components/header";
import {LogoComponent} from "@/app/assets/images/logo";
import {Avatar, Button} from "@nextui-org/react";
import {MdGroups, MdOutlineArrowBack} from "react-icons/md";
import {FaHome, FaTrophy} from "react-icons/fa";
import React from "react";
import {Manrope} from "next/font/google";
import {Image} from "@nextui-org/image";
import {AvatarGroup} from "@nextui-org/avatar";
import {RiVipCrown2Fill} from "react-icons/ri";
import {Divider} from "@nextui-org/divider";

const manrope = Manrope({subsets: ["latin"]});

export default function Group({userData, group}: {
    userData: UserInfoResponse['data'],
    group: GroupResponse['data']
}) {
    const router = useRouter();
    const [width, height] = useWindowSize();
    const [isOpen, cycleOpen] = useCycle(-270, 0);

    return <>
        <Header userInfo={userData} center={true}/>

        <main
            className={"blue-palette p-24 box-border flex justify-center overflow-y-auto " + manrope.className + (width < 1024 ? " !p-3 !pt-14" : "")}>
            <motion.div
                className={"bg-[#5353534d] mt-8 backdrop-blur-3xl w-64 p-1 pb-5 box-content rounded-xl h-fit " + (width < 1024 ? ` z-10 !fixed top-28 rounded-bl-none rounded-tl-none` : "")}
                initial={width < 1024 ? {left: isOpen} : {}}
                transition={{
                    duration: .8,
                    ease: [0.25, 0.8, 0.5, 1]
                }}
                animate={width < 1024 ? {left: isOpen} : {}}>
                {width < 1024 && <div className={"flex items-center absolute -right-12 top-5"}>
                    <LogoComponent viewBox={"0 0 35 28"}
                                   className={"w-12 h-12 pl-3 pr-2 rounded-tr-xl rounded-br-xl bg-[#5353534d] backdrop-blur-3xl"}
                                   onClick={() => cycleOpen()}/>
                </div>}
                <Button startContent={<MdOutlineArrowBack size={20}/>} variant={"light"}
                        onClick={(_ => router.back())}
                        className={"-ml-3 mt-1"}>Kembali</Button>
                <div className={"pl-3 pr-3 box-border"}>
                    <Button startContent={<FaHome size={20}/>} className={"w-full text-left mt-2 justify-start"}
                            onClick={() => router.push("/")}>Beranda</Button>
                    <Button startContent={<FaTrophy size={20}/>} className={"w-full text-left mt-2 justify-start"}
                            onClick={() => router.push("/competition")}>Dashboard Kompetisi</Button>
                    <Button startContent={<MdGroups size={20}/>}
                            className={"w-full text-left mt-2 justify-start"}
                            onClick={() => router.push("/competition/groups")}>Groups</Button>
                </div>
            </motion.div>
            <div className={"mt-8 flex w-full max-w-[1200px]"}>
                <div
                    className={"w-full flex flex-col items-center flex-1 min-h-32 bg-[#5353534d] ml-10 rounded-xl p-5 box-border " + (width < 1024 ? "!ml-0" : "")}>
                    <div
                        className={"flex items-end bg-black w-full p-6 box-border relative min-h-40 pl-36 sm:pl-44 pb-3 mb-14 rounded-lg"}>
                        <Image
                            src={`https://avatars.githubusercontent.com/u/${group.members.find(x => x.IsLeader)?.UserId ?? 0}?v=4`}
                            classNames={{
                                wrapper: "w-36 h-36 sm:w-44 sm:h-44 absolute -bottom-12 left-5"
                            }} className={"rounded-full"}/>
                        <div className={"ml-8 fill-available"}>
                            <p className={"text-lg sm:text-2xl font-bold text-white truncate"}>{group.name}</p>
                            <p className={"text-sm sm:text-medium text-white truncate"}>{group.description}</p>
                            <AvatarGroup isBordered size={"sm"} className={"mt-2"}>
                                {group.members.map((x, i) => <Avatar key={i}
                                                                     src={`https://avatars.githubusercontent.com/u/${x.UserId}?v=4`}/>)}
                            </AvatarGroup>
                        </div>
                    </div>

                    <div className={"flex w-full"}>
                        <div className={"bg-white w-full mr-5"}>

                        </div>
                        <div className={"bg-[#7e8db41f] rounded-lg backdrop-blur-lg w-72 min-h-48 shrink-0 p-3 pl-4 pr-4 box-border"}>
                            <p className={"text-xl font-bold"}>Anggota</p>
                            <div className={"flex justify-between mt-2"}>
                                <p className={"text-sm"}>User</p>
                                <p className={"text-sm"}>Poin Minggu Ini</p>
                            </div>
                            <Divider className={"mt-1"}/>
                            {group.members.map((x, i) => <div key={i} className={"flex items-center mt-2"}>
                                <Image
                                    alt={"Avatar"}
                                    src={`https://avatars.githubusercontent.com/u/${x.UserId}?v=4`}
                                    classNames={{
                                        wrapper: "w-10 h-10 rounded-full mr-2 shrink-0"
                                    }} className={"rounded-full mr-3"}/>
                                <div className={"flex items-center"}>
                                    <p className={"truncate max-w-[150px]"}>{x.Username}</p>
                                    {x.IsLeader && <RiVipCrown2Fill size={20} className={"ml-1"}/>}
                                </div>
                                <p className={"ml-auto shrink-0"}>{x.pointsThisWeek ?? 0} pts</p>
                            </div>)}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </>
}