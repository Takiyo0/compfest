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

const manrope = Manrope({subsets: ["latin"]});

export default function Archive({userData, questions}: {
    userData: UserInfoResponse['data'],
    questions: TreeQuestionsResponse['data']['questions']
}) {
    const router = useRouter();
    return <>
        <Header userInfo={userData} center={true}/>
        <main
            className={"blue-palette w-auto min-h-screen pb-32 pt-32 flex justify-center " + manrope.className}>
            <div className={"w-52 h-min mr-5 rounded-xl bg-[#5353534d] p-5 pt-1 pl-4 pr-4 sticky top-32"}>
                <Button startContent={<MdOutlineArrowBack size={20}/>} variant={"light"}
                        onClick={(_ => router.push("/"))}
                        className={"-ml-3"}>Kembali</Button>
                <p className={"mb-2"}>Pertanyaan</p>
                {(questions?.length ?? 0) > 0 && questions?.map((x, i) => {
                    const userRight = x.userAnswer === x.correctAnswer;
                    return <Button key={i} color={userRight ? "success" : "danger"} size={"md"} onClick={() => {
                        const target = document.getElementById(`pertanyaan-${i}`);
                        // add 100px offset from top
                        if (target) window.scrollTo({top: target.offsetTop - 100, behavior: "smooth"});
                    }}
                                   className={"w-full text-left mb-2"}>Pertanyaan {i + 1}</Button>
                })}
            </div>
            <div className={"flex flex-col items-center"}>
                {questions?.map((question, i) => {
                    const userWrongAnswered = question.userAnswer !== question.correctAnswer;
                    return <div id={`pertanyaan-${i}`}
                                className={"flex-1 bg-[#5353534d] rounded-xl p-5 box-border w-full max-w-[1000px] mb-5"}
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
                                {question.choices.map((x, k) => <Radio key={k}
                                                                       value={k.toString()}>
                                    <div
                                        className={"flex items-center"}>{(k + 10).toString(36).toUpperCase()}. <MarkdownPreview
                                        className={"ml-2"}
                                        style={{
                                            backgroundColor: "transparent",
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
                                <p><a className={"font-semibold"}> Correct
                                    answer:</a> {(question.correctAnswer! + 10).toString(36).toUpperCase()}. {question.choices[question.correctAnswer!]}
                                </p>
                                {question.answerExplanation && <>
                                    <p className={"font-semibold mt-2"}>Explanation</p>
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