"use client"

import {ApiManager, InterviewQuestionsResponse, UserInfoResponse} from "@/app/managers/api";
import {Manrope} from "next/font/google";
import Header from "@/app/components/header";
import React from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {Radio, RadioGroup} from "@nextui-org/radio";
import {Button} from "@nextui-org/react";
import {MdOutlineNavigateNext} from "react-icons/md";
import {GrFormPrevious} from "react-icons/gr";
import {Divider} from "@nextui-org/divider";
import {MdDone} from "react-icons/md";
import {getCookie} from "cookies-next";
import toast from "react-hot-toast";

const manrope = Manrope({subsets: ["latin"]});
export default function ChallengeInterview({userData, questions}: {
    userData: UserInfoResponse['data'],
    questions: InterviewQuestionsResponse['data']
}) {
    const [currentQuestion, setCurrentQuestion] = React.useState<number>(Number.isNaN(window.localStorage.getItem("lastQuestion")) ? 0 : Number(window.localStorage.getItem("lastQuestion")));
    const [answers, setAnswers] = React.useState<{
        id: number,
        index: number,
        answer?: number
    }[]>(questions.questions.map((x, i) => ({
        id: x.id,
        index: i,
        answer: Number.isNaN(x.userAnswer) ? undefined : x.userAnswer
    })));
    const [submitting, setSubmitting] = React.useState(false);

    const abort = React.useRef(new AbortController);
    const authorization = getCookie("Authorization");

    async function OnFinish() {
        console.log(answers);
    }

    async function OnNext(currentIndex: number, targetQuestionIndex?: number) {
        const question = questions.questions[currentIndex];
        console.log(targetQuestionIndex);
        if (answers[currentIndex].answer != undefined) {
            setSubmitting(true);
            const {
                statusCode,
                data
            } = await ApiManager.SendInterviewAnswer(abort.current.signal, authorization ?? "", question.id, answers[currentIndex].answer as number);
            setSubmitting(false);
            if (statusCode !== 200) return toast.error(`Server returned: ${statusCode}. Please try again later`);
            console.log(data);
        }
        console.log(answers)
        if (targetQuestionIndex != undefined) setCurrentQuestion(targetQuestionIndex);
        else setCurrentQuestion(x => x + 1);

    }

    function AllAnswered() {
        return !answers.some(x => x.answer == undefined);
    }

    return <>
        <Header userInfo={userData} center={true}/>
        <main
            className={"blue-palette min-w-screen min-h-screen flex flex-col items-center pb-32 pt-20 " + manrope.style}>
            <div className={"mt-16 flex w-[98vw] max-w-[1200px]"}>
                <div
                    className={"bg-[#5353534d] backdrop-blur-3xl w-48 p-1 pb-5 box-content rounded-xl h-fit"}>
                    <h2 className={"text-xl ml-[8px] mt-[3px] mb-[2px]"}>Pertanyaan</h2>
                    <Divider/>
                    <div className={"bg-transparent w-full flex flex-wrap justify-evenly"}>
                        {questions.questions.map((x, i) => <div
                            className={"bg-[#0f1f2d] w-10 h-12 flex items-center justify-center mt-2 rounded select-none hover:scale-105 cursor-pointer transition-all duration-75"}
                            style={{
                                border: `2px solid ${currentQuestion == i ? "gray" : (answers[i].answer == undefined ? "red" : "green")}`
                            }}
                            onClick={() => OnNext(currentQuestion, i)}
                            key={i}>{i + 1}</div>)}
                        {questions.questions.length < 12 && questions.questions.length > 8 && new Array(12 - questions.questions.length).fill(null).map((x, i) =>
                            <div
                                className={"w-10 h-12 invisible"} key={i}></div>)}
                    </div>
                </div>
                <div className={"w-full flex-1 min-h-32 bg-[#5353534d] ml-10 rounded-xl p-5 box-border"}>
                    <div>
                        <p className={"mb-3 text-xl"}>Pertanyaan {currentQuestion + 1}</p>
                        <hr/>
                        <MarkdownPreview source={questions.questions[currentQuestion].content.trim()} className={"mt-3"}
                                         style={{backgroundColor: "transparent"}}/>
                        <RadioGroup
                            value={answers[currentQuestion].answer?.toString() ?? ''}
                            isDisabled={submitting}
                            onChange={(v) => setAnswers((d) => {
                                return d.map(x => x.index == currentQuestion ? {
                                    ...x,
                                    answer: Number(v.target.value)
                                } : x);
                            })}
                        >
                            {questions.questions[currentQuestion].choices.map((x, k) => <Radio key={k}
                                                                                               value={k.toString()}>{(k + 10).toString(36).toUpperCase()}. {x}</Radio>)}
                        </RadioGroup>
                    </div>
                    <div className={"flex mt-7"}>
                        {currentQuestion != 0 &&
                            <Button startContent={<GrFormPrevious size={27} className={"-mr-3 -ml-2"}/>}
                                    onClick={() => setCurrentQuestion(x => x - 1)}>
                                Previous
                            </Button>}
                        <Button className={"ml-auto"} color={"primary"} isLoading={submitting}
                                onClick={() => (currentQuestion == questions.questions.length - 1) ? OnFinish() : OnNext(currentQuestion)}
                                disabled={(currentQuestion == questions.questions.length - 1) ? !AllAnswered() : false}
                                endContent={(currentQuestion == questions.questions.length - 1) ?
                                    <MdDone size={27}/> :
                                    <MdOutlineNavigateNext size={27} className={"-mr-3 -ml-2"}/>}>
                            {(currentQuestion == questions.questions.length - 1) ? "Finish" : "Next"}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    </>
}