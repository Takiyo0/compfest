'use client'

import {CurrentEventResponse, EventTopic, GroupListResponse, UserInfoResponse} from "@/app/managers/api";
import Header from "@/app/components/header";
import React from "react";
import {Manrope} from "next/font/google";
import {motion, useCycle} from "framer-motion";
import {LogoComponent} from "@/app/assets/images/logo";
import {Avatar, Button, Image} from "@nextui-org/react";
import {MdGroups, MdOutlineArrowBack} from "react-icons/md";
import {FaHome, FaTrophy} from "react-icons/fa";
import {useWindowSize} from "@react-hook/window-size";
import {useRouter} from "next/navigation";
import {Card, CardBody} from "@nextui-org/card";
import {AvatarGroup} from "@nextui-org/avatar";

const manrope = Manrope({subsets: ["latin"]});

export default function GroupPage({userData, groups}: {
    userData: UserInfoResponse['data'],
    groups: GroupListResponse['data']
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
                            className={"w-full text-left mt-2 justify-start"} color={"primary"}
                            variant={"shadow"}>Groups</Button>
                </div>
            </motion.div>
            <div className={"mt-8 flex w-full max-w-[1200px]"}>
                <div
                    className={"w-full flex flex-col items-center flex-1 min-h-32 bg-[#5353534d] ml-10 rounded-xl p-5 box-border " + (width < 1024 ? "!ml-0" : "")}>
                    <p className={"text-2xl font-bold text-white"}>Groups</p>
                    <div className="gap-2 grid grid-cols-1 sm:grid-cols-2 mt-5">
                        {groups.map((item, index) => (
                            <Card shadow="sm" key={index} isPressable className={"bg-[#7e8db41f] backdrop-blur-sm"}>
                                <CardBody className="overflow-visible p-0 flex flex-row">
                                    <Avatar
                                        radius="lg"
                                        alt={item.Name}
                                        className="object-contain !h-32 !w-32"
                                        src={`https://avatars.githubusercontent.com/u/${item.Members.find(x => x.IsLeader)?.UserId ?? 0}?v=4`}
                                    />
                                    <div className={"p-3 box-border h-full flex flex-col w-[77%]"}>
                                        <p className={"text-xl font-bold text-white"}>{item.Name}</p>
                                        <p className={"text-medium text-neutral-500 mb-auto truncate"}>{item.Description ?? "No description set"}</p>
                                        <AvatarGroup isBordered size={"sm"}>
                                            {item.Members.map((x, i) => <Avatar key={i}
                                                                                src={`https://avatars.githubusercontent.com/u/${x.UserId}?v=4`}/>)}
                                        </AvatarGroup>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    </>
}