'use client'

import {TreeQuestionsResponse, UserInfoResponse} from "@/app/managers/api";
import {Manrope} from "next/font/google";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {Radio, RadioGroup} from "@nextui-org/radio";
import {HiMiniXMark} from "react-icons/hi2";
import {ImCheckmark} from "react-icons/im";
import React from "react";
import {Button} from "@nextui-org/react";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import {MdOutlineArrowBack} from "react-icons/md";
import {useRouter} from "next/navigation";
import {useWindowSize} from "@react-hook/window-size";
import {useCycle, motion} from "framer-motion";
import {LogoComponent} from "@/app/assets/images/logo";

const manrope = Manrope({subsets: ["latin"]});

export default function Archive({userData, questions}: {
    userData: UserInfoResponse['data'],
    questions: TreeQuestionsResponse['data']['questions']
}) {
    const [width, height] = useWindowSize();
    const router = useRouter();
    const [isOpen, cycleOpen] = useCycle(-208, 0);

    return <>
        <Header userInfo={userData} center={true}/>
        <main
            className={"blue-palette min-h-screen pb-32 pt-32 flex justify-center " + manrope.className + (width < 1024 ? " !p-3 !pt-28" : "")}>
            <motion.div
                className={"w-52 h-min mr-5 rounded-xl bg-[#5353534d] p-5 pt-1 pl-4 pr-4 sticky backdrop-blur-3xl top-32 " + (width < 1024 ? ` z-10 !fixed top-28 rounded-bl-none rounded-tl-none` : "")}
                initial={width < 1024 ? {left: isOpen} : {}}
                transition={{
                    duration: .8,
                    ease: [0.25, 0.8, 0.5, 1]
                }}
                animate={width < 1024 ? {left: isOpen} : {}}>
                <div className={"flex mt-3 mb-2"}>
                    <Button startContent={<MdOutlineArrowBack size={20}/>} variant={"light"}
                            onClick={(_ => router.back())}
                            className={"-ml-3 mt-1"}>Kembali</Button>

                    {width < 1024 && <div className={"flex items-center absolute -right-12"}>
                        <LogoComponent viewBox={"0 0 35 28"}
                                       className={"w-12 h-12 pl-3 pr-2 rounded-tr-xl rounded-br-xl bg-[#5353534d] backdrop-blur-3xl"}
                                       onClick={() => cycleOpen()}/>
                    </div>}
                </div>
                <p className={"mb-2"}>Pertanyaan</p>
                <div className={width < 1024 ? "ye" : ""}>
                    {(questions?.length ?? 0) > 0 && questions?.map((x, i) => {
                        const userRight = x.userAnswer === x.correctAnswer;
                        return <Button key={i} color={userRight ? "success" : "danger"} size={"md"} onClick={() => {
                            const target = document.getElementById(`pertanyaan-${i}`);
                            if (target) window.scrollTo({top: target.offsetTop - 100, behavior: "smooth"});
                            cycleOpen();
                        }}
                                       className={"w-full text-left mb-2"}>Pertanyaan {i + 1}</Button>
                    })}
                </div>
            </motion.div>
            <div className={"flex flex-col items-center"}>
                {questions?.map((question, i) => {
                    const userWrongAnswered = question.userAnswer !== question.correctAnswer;
                    return <div id={`pertanyaan-${i}`}
                                className={"flex-1 bg-[#5353534d] rounded-xl p-5 box-border w-full max-w-[1000px] mb-5"}
                                style={width < 1024 ? {zoom: .8} : {}}
                                key={i}>
                        <div>
                            <p className={"mb-3 text-xl"}>Pertanyaan {i + 1}</p>
                            <hr/>
                            <MarkdownPreview source={question.content.trim()}
                                             className={"mt-3"}
                                             style={{backgroundColor: "transparent"}}/>
                            <RadioGroup
                                value={question.userAnswer?.toString() ?? ''}
                                onClick={() => void 0}
                                className={"mt-3"}
                            >
                                {question.choices.map((x, k) => <Radio key={k} className={"max-w-full"}
                                                                       value={k.toString()}>
                                    <div
                                        className={"flex items-center"}>{(k + 10).toString(36).toUpperCase()}. <MarkdownPreview
                                        className={"ml-2"}
                                        style={{
                                            backgroundColor: "transparent",
                                            maxWidth: "calc(100vw - 70px)",
                                            color: userWrongAnswered && k == question.correctAnswer ? "#b2f3b2" : "white"
                                        }}
                                        source={x.trim()}/>
                                        {userWrongAnswered && question.userAnswer === k && <HiMiniXMark
                                            className={"text-red-500 ml-2"} size={20}/>}
                                        {!userWrongAnswered && question.userAnswer === k && <ImCheckmark
                                            className={"text-green-500 ml-2"}/>}
                                    </div>
                                </Radio>)}
                            </RadioGroup>
                        </div>

                        {question.correctAnswer !== undefined &&
                            <div className={"bg-[#6781cf42] w-auto rounded-xl mt-2 p-3 box-border"}>
                                <p><a className={"font-semibold"}> Jawaban yang
                                    benar: </a>{(question.correctAnswer! + 10).toString(36).toUpperCase()}.
                                    <MarkdownPreview source={question.choices[question.correctAnswer!]}
                                                     className={"mt-3"}
                                                     style={{backgroundColor: "transparent", color: "white"}}/>
                                </p>
                                {question.answerExplanation && <>
                                    <p className={"font-semibold mt-2"}>Penjelasan:</p>
                                    <MarkdownPreview source={question.answerExplanation.trim()}
                                                     style={{backgroundColor: "transparent", color: "white"}}/>
                                </>}
                            </div>}
                    </div>
                })}
            </div>
        </main>
        <Footer/>
    </>
}