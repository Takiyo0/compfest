'use client'

import {UserInfoResponse} from "@/app/managers/api";
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
import { IoChatbubbleEllipses } from "react-icons/io5";

const manrope = Manrope({subsets: ["latin"]});

export default function Archive({userData}: { userData: UserInfoResponse['data'] }) {
    const router = useRouter();
    const [isOpen, toggleOpen] = useCycle(true, false);
    const [height, setHeight] = useState(1000);
    const containerRef = useCallback((node: HTMLDivElement) => {
        if (node != null) {
            setHeight(node.offsetHeight);
        }
    }, []);

    return <>
        <Header userInfo={userData} center={true}/>
        <main
            className={"blue-palette flex h-screen home archive-home items-start justify-center p-24 " + manrope.className}>
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
                className={"bg-[#c5cdcd1c] mt-4 p-2 box-border home-nav z-10"}
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
                    <Button startContent={<GiFamilyTree size={20}/>} className={"w-full text-left mt-2"}
                            color={"default"} onClick={() => router.push("/")}
                            variant={"shadow"}>Skill Tree</Button>
                    <Button startContent={<PiQuestionMarkFill size={20}/>} className={"w-full text-left mt-3"}
                            color={"primary"}
                            variant={"solid"}>Arsip Pertanyaan</Button>
                    <Button startContent={<IoChatbubbleEllipses size={20}/>} className={"w-full text-left mt-3"}
                            color={"default"} onClick={() => router.push("/chat")}
                            variant={"solid"}>Chat</Button>
                </motion.div>
            </motion.nav>
            <div
                className={"archive text-white bg-[#c5cdcd1c] h-full w-full max-w-[900px] rounded-3xl mt-4 p-6 box-border"}>
                <h1 className={"text-xl"}>Arsip Pertanyaan</h1>
                <div className={"bg-[#3d47a59c] h-16 p-2 pl-4 pr-4 rounded-2xl mt-4 flex items-center"}>
                    <p className={"text-3xl mr-5"}>1</p>
                    <div>
                        <p>Pertanyaan Interview</p>
                        <div>
                            <div className={"flex items-center"}>
                                <FaQuestion size={15}/>
                                <FaDotCircle className={"mr-1 ml-1"} size={7}/>
                                <p>14</p>
                            </div>
                        </div>
                    </div>
                    <Button startContent={<FaEye/>} className={"ml-auto z-0"} variant={"light"}>
                        Review
                    </Button>
                </div>
            </div>
        </main>
        <Footer/>
    </>
}