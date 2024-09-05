"use client"

import {ApiManager, InterviewQuestionsResponse, UserInfoResponse} from "@/app/managers/api";
import {Manrope} from "next/font/google";
import Header from "@/app/components/header";
import React, {useEffect, useState} from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {Radio, RadioGroup} from "@nextui-org/radio";
import {Button} from "@nextui-org/react";
import {MdOutlineNavigateNext} from "react-icons/md";
import {GrFormPrevious} from "react-icons/gr";
import {Divider} from "@nextui-org/divider";
import {MdDone} from "react-icons/md";
import {getCookie} from "cookies-next";
import toast from "react-hot-toast";
import {useRouter} from "next/navigation";
import {useWindowSize} from "@react-hook/window-size";
import {useCycle} from "framer-motion";
import {cookies} from "next/headers";

const manrope = Manrope({subsets: ["latin"]});
export default function ChallengeInterview({userData, questions}: {
    userData: UserInfoResponse['data'],
    questions: InterviewQuestionsResponse['data']
}) {
    const [questionReady, setQuestionReady] = useState(questions.ready);
    const [width, height] = useWindowSize();
    const router = useRouter();
    const [user, setUser] = React.useState<UserInfoResponse['data'] | undefined>(userData);
    const lastQuestion = localStorage.getItem("lastQuestion");
    const [currentQuestion, setCurrentQuestion] = React.useState<number>((Number.isNaN(lastQuestion) || Number(lastQuestion) >= questions.questions?.length) ? 0 : Number(lastQuestion));
    const [answers, setAnswers] = React.useState<{
        id: number,
        index: number,
        answer?: number
    }[]>(questions.questions?.map((x, i) => ({
        id: x.id,
        index: i,
        answer: Number.isNaN(x.userAnswer) ? undefined : x.userAnswer
    })) ?? []);
    const [submitting, setSubmitting] = React.useState(false);
    const interval = React.useRef<NodeJS.Timeout>();
    let controller = React.useRef(new AbortController());
    const isFirst = React.useRef<boolean>(true);

    const Authorization = getCookie('Authorization');

    React.useEffect(() => {
        if (!questionReady) {
            interval.current = setInterval(async () => {
                const {
                    data,
                    statusCode
                } = await ApiManager.GetInterviewQuestions(controller.current.signal, Authorization ?? "");
                if (statusCode == 200) setQuestionReady(data.ready);
            }, 3000);
        } else if (!isFirst) window.location.reload();

        isFirst.current = false;
    }, [questionReady]);


    useEffect(() => {
        async function getLoader() {
            const {helix} = await import('ldrs')
            helix.register()
        }

        getLoader();

        return () => {
            controller.current.abort();
            if (interval.current) clearInterval(interval.current);
        }
    }, [])

    const abort = React.useRef(new AbortController);
    const authorization = getCookie("Authorization");

    async function OnFinish() {
        await OnNext(currentQuestion, undefined, true);
        setSubmitting(true);
        const {statusCode} = await ApiManager.SubmitInterview(abort.current.signal, authorization ?? "");
        if (statusCode !== 200) {
            setSubmitting(false);
            return toast.error(`Server returned: ${statusCode}. Please try again later`);
        }
        router.push('/');
    }

    React.useEffect(() => {
        localStorage.setItem("lastQuestion", currentQuestion.toString());
    }, [currentQuestion])

    async function OnNext(currentIndex: number, targetQuestionIndex?: number, skipNavigate: boolean = false) {
        const question = questions.questions[currentIndex];
        if (answers[currentIndex].answer != undefined) {
            setSubmitting(true);
            const {
                statusCode,
                data
            } = await ApiManager.SendInterviewAnswer(abort.current.signal, authorization ?? "", question.id, answers[currentIndex].answer as number);
            setSubmitting(false);
            if (statusCode !== 200) return toast.error(`Server returned: ${statusCode}. Please try again later`);
        }
        if (!skipNavigate) {
            if (targetQuestionIndex != undefined) setCurrentQuestion(targetQuestionIndex);
            else setCurrentQuestion(x => x + 1);
        }
    }

    function AllAnswered() {
        return !answers.some(x => x.answer == undefined);
    }

    return <>
        <Header userInfo={user} center={true}/>
        {!questionReady ?
            <main className={"flex min-h-screen flex-col items-center justify-center p-24 " + manrope.className}>
                <div className={"flex items-center flex-col"}>
                    <l-helix
                        size="200"
                        speed="2.5"
                        color="#84A1F5"/>
                    <p className={"mt-7 text-2xl"}>Sedang membuat pertanyaan interview Anda. Estimasi waktu 1-2 menit.
                        Harap menunggu</p>
                </div>
            </main> : <main
                className={"blue-palette min-w-screen min-h-screen flex flex-col items-center pb-32 pt-20 " + manrope.className + (width < 1024 ? " pt-10" : "")}>
                <div className={"mt-16 flex w-[98vw] max-w-[1200px] " + (width < 1024 ? "flex-col p-2" : "flex-row")}>
                    <div
                        className={"bg-[#5353534d] backdrop-blur-3xl w-48 p-1 pb-5 box-border rounded-xl h-fit " + (width < 1024 ? "mt-0 w-full" : "")}>
                        <h2 className={"text-xl ml-[8px] mt-[3px] mb-[5px]"}>Pertanyaan</h2>
                        <Divider/>
                        <div className={"bg-transparent w-full flex flex-wrap justify-normal gap-1 p-2"}>
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
                    <div
                        className={"w-full flex-1 min-h-32 bg-[#5353534d] ml-10 rounded-xl p-5 box-border " + (width < 1024 ? "mt-10 ml-0" : "mt-0")}>
                        <div>
                            <p className={"mb-3 text-xl"}>Pertanyaan {currentQuestion + 1}</p>
                            <hr/>
                            <MarkdownPreview source={questions.questions[currentQuestion].content.trim()}
                                             className={"mt-3"}
                                             style={{backgroundColor: "transparent"}}/>
                            <RadioGroup
                                value={answers[currentQuestion].answer?.toString() ?? ''}
                                isDisabled={submitting}
                                className={"mt-3"}
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
            </main>}
    </>
}