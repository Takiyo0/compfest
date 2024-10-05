'use client'

import {AnsweredQuestionsResponse, UserInfoResponse} from "@/app/managers/api";
import Header from "@/app/components/header";
import {Button} from "@nextui-org/react";
import {motion, useCycle} from "framer-motion";
import {IoMenu} from "react-icons/io5";
import {GiFamilyTree} from "react-icons/gi";
import {PiQuestionMarkFill} from "react-icons/pi";
import Footer from "@/app/components/footer";
import React, {useCallback, useState} from "react";
import {Manrope} from "next/font/google";
import {useRouter} from "next/navigation";
import {FaDotCircle, FaQuestion} from "react-icons/fa";
import {FaEye} from "react-icons/fa6";
import {IoChatbubbleEllipses} from "react-icons/io5";
import {useWindowSize} from "@react-hook/window-size";
import {IoIosTrophy} from "react-icons/io";
import ButtonNavigation from "@/app/components/buttonNavigation";

const manrope = Manrope({subsets: ["latin"]});

export default function Archive({userData, data}: {
    userData: UserInfoResponse['data'],
    data: AnsweredQuestionsResponse['data']
}) {
    const router = useRouter();
    const [isOpen, toggleOpen] = useCycle(true, false);
    const [height, setHeight] = useState(1000);
    const [width] = useWindowSize();
    const containerRef = useCallback((node: HTMLDivElement) => {
        if (node != null) {
            setHeight(node.offsetHeight);
        }
    }, []);

    React.useEffect(() => {
        if (width < 1024 && isOpen) toggleOpen();
    }, [width])

    return <>
        <Header userInfo={userData} center={true}/>
        <main
            className={"blue-palette flex h-screen home archive-home items-start justify-center p-24 " + manrope.className + (width < 1024 ? " !p-3 !pt-24" : "")}>
            <motion.nav
                initial={false}
                animate={isOpen ? "open" : "closed"}
                custom={height}
                ref={containerRef}
                variants={{
                    open: () => {
                        const height = window.innerHeight;
                        return {
                            height: height - height / 6,
                            width: 280,
                            marginRight: 20,
                            borderRadius: 20
                        }
                    },
                    closed: {
                        height: 57,
                        width: 57,
                        marginRight: 20,
                        borderRadius: 20,
                        transition: {delay: .2, duration: .8, ease: [0, 0.71, 0.2, 1.01]}
                    }
                }}
                transition={{
                    duration: 0.8,
                    ease: [0, 0.71, 0.2, 1.01]
                }}
                className={"bg-[#c5cdcd1c] mt-4 p-2 box-border z-10 " + (width < 1024 ? "absolute left-3 backdrop-blur-3xl z-10" : "")}
            >
                <Button isIconOnly className={"p-1 bg-transparent"} onPress={() => toggleOpen()}>
                    <IoMenu size={40}/>
                </Button>
                <motion.div className={"w-full p-4 box-border"} variants={{
                    open: {
                        display: "block",
                        opacity: 1
                    },
                    closed: {
                        display: "none",
                        opacity: 0
                    }
                }}>
                    <p>Navigation</p>
                    {[
                        {
                            name: "Skill Tree",
                            isActive: false,
                            redirectTo: "/",
                            icon: <GiFamilyTree size={20}/>
                        },
                        {
                            name: "Arsip Pertanyaan",
                            isActive: true,
                            redirectTo: "/archive",
                            icon: <PiQuestionMarkFill size={20}/>
                        },
                        {
                            name: "Kompetisi",
                            isActive: false,
                            redirectTo: "/competition",
                            icon: <IoIosTrophy size={20}/>
                        },
                        {
                            name: "Chat",
                            isActive: false,
                            redirectTo: "/chat",
                            icon: <IoChatbubbleEllipses size={20}/>
                        }].map((x, i) => (
                        <ButtonNavigation key={i} name={x.name} active={x.isActive} redirectTo={x.redirectTo}
                                          icon={x.icon}/>))}
                </motion.div>
            </motion.nav>
            <div
                className={"archive text-white bg-[#c5cdcd1c] h-full w-full max-w-[900px] rounded-3xl mt-4 p-6 box-border "}>
                <h1 className={"text-xl " + (width < 1024 ? "ml-10" : "")}>Arsip Pertanyaan</h1>
                {[{treeId: 'interview', treeTitle: "Pertanyaan Interview", totalQuestions: 12}, ...data].map((x, i) =>
                    <div key={i}
                         className={"bg-[#3d47a59c] h-auto p-2 pl-4 pr-4 rounded-2xl mt-4 flex items-center"}
                         style={width < 1024 ? {
                             zoom: .9
                         } : {}}>
                        <p className={"text-3xl mr-5"}>{i + 1}</p>
                        <div className={"flex-1"}>
                            <p>{x.treeTitle}</p>
                            <div>
                                <div className={"flex items-center"}>
                                    <FaQuestion size={15}/>
                                    <FaDotCircle className={"mr-1 ml-1"} size={7}/>
                                    <p>{x.totalQuestions}</p>
                                </div>
                            </div>
                        </div>
                        <Button startContent={<FaEye/>} className={"ml-auto z-0"} variant={"light"}
                                onClick={() => router.push(`/ganbatte/${x.treeId}/archive`)}>
                            Review
                        </Button>
                    </div>)}
            </div>
        </main>
        <Footer/>
    </>
}