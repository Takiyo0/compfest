'use client'

import {ApiManager, TopicResponse, UserInfoResponse, WeeklyQuestionResponse} from "@/app/managers/api";
import Header from "@/app/components/header";
import {Manrope} from "next/font/google";
import MarkdownPreview from "@uiw/react-markdown-preview";
import React, {useRef} from "react";
import {Radio, RadioGroup} from "@nextui-org/radio";
import {Divider} from "@nextui-org/divider";
import {Utils} from "@/app/managers/utils";
import {LogoComponent} from "@/app/assets/images/logo";
import {Button} from "@nextui-org/react";
import {MdOutlineArrowBack} from "react-icons/md";
import {motion} from "framer-motion";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/modal";
import {IoWarning} from "react-icons/io5";
import {router} from "next/client";
import {useParams, useRouter} from "next/navigation";
import {getCookie} from "cookies-next";
import toast from "react-hot-toast";
import {FaArrowLeft, FaCheck, FaClock, FaCross} from "react-icons/fa";
import {ImCross} from "react-icons/im";
import Footer from "@/app/components/footer";

const manrope = Manrope({subsets: ["latin"]});

const ch = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function QuestionFilling({userData, question, shuffledChoices}: {
    userData: UserInfoResponse['data'],
    question: WeeklyQuestionResponse['data'],
    shuffledChoices: { id: number, content: string }[]
}) {
    const router = useRouter();
    const params = useParams<{ questionId: string; sessionId: string, quesId: string }>()
    const [duration, setDuration] = React.useState(0);
    const [targetQuestionIndex, setTargetQuestionIndex] = React.useState<number | undefined>(undefined);
    const [submitModal, setSubmitModal] = React.useState(false);
    const [answer, setAnswer] = React.useState<number | undefined>(question.userAnswer);
    const nowRef = useRef(Date.now() / 1000);

    const Authorization = getCookie('Authorization');
    let controller = React.useRef(new AbortController());

    React.useEffect(() => {
        const firstAccess = (question.firstAccessTime || Date.now() / 1000) * 1000;
        const updateDuration = () => {
            const now = Date.now();
            const diff = Math.max(0, now - firstAccess);
            setDuration(diff);
        };

        updateDuration();

        const interval = setInterval(updateDuration, 1000);

        return () => clearInterval(interval);
    }, [question.firstAccessTime]);

    const index = question.questionIds.findIndex(x => x == question.id);

    function questionSelectionSelected(idx: number) {
        if (idx == index) return;
        if (window.localStorage.getItem(`weeklynotified`)) {
            return onNextPress(question.questionIds[idx]);
        }
        if (question.isFinished) return;
        window.localStorage.setItem(`weeklynotified`, 'true');
        setTargetQuestionIndex(idx);
    }

    async function onNextPress(targetQuestion: number, fromModal: boolean = false) {
        if (answer != undefined && !question.isFinished) {
            const {statusCode} = await ApiManager.SendQuestionAnswer(controller.current.signal, Authorization ?? "", Number(params.questionId), Number(params.sessionId), answer, Number(params.quesId));
            if (statusCode != 200) return toast.error("Server returned error. Please try again later");
        }
        router.push(`/competition/question/${params.questionId}/${params.sessionId}/${targetQuestion}`);
        router.refresh();
    }

    async function submitAnswer() {
        if (question.isFinished) return;
        if (!question.userAnswer && answer != undefined) {
            const {statusCode} = await ApiManager.SendQuestionAnswer(controller.current.signal, Authorization ?? "", Number(params.questionId), Number(params.sessionId), answer, Number(params.quesId));
            if (statusCode != 200) return toast.error("Server returned error. Please try again later");
        }
        if (!question.userAnswer && !answer) return toast.error("Anda belum menjawab soal terakhir");

        setSubmitModal(true);
    }

    async function realSubmit() {
        if (question.isFinished) return;
        const {statusCode} = await ApiManager.SubmitQuestion(controller.current.signal, Authorization ?? "", Number(params.questionId), Number(params.sessionId));
        if (statusCode != 200) return toast.error("Server returned error. Please try again later");

        router.push(`/competition/question/${params.questionId}`);
        router.refresh();
    }

    return <>
        <Header userInfo={userData} center/>

        <Modal backdrop={"blur"} className={"blue-palette"} isOpen={submitModal}
               onClose={() => setTargetQuestionIndex(undefined)}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Konfirmasi Submit</ModalHeader>
                        <ModalBody className={"flex flex-col items-center"}>
                            <IoWarning color={"yellow"} className={"w-28 h-28"}/>
                            <p className={"text-center"}>
                                Anda akan mensubmit pekerjaan Anda. Apakah Anda yakin?
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Tidak
                            </Button>
                            <Button color="primary"
                                    onClick={() => realSubmit()}>
                                Ya
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>

        <Modal backdrop={"blur"} className={"blue-palette"} isOpen={targetQuestionIndex != undefined}
               onClose={() => setTargetQuestionIndex(undefined)}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Konfirmasi Pengerjaan</ModalHeader>
                        <ModalBody className={"flex flex-col items-center"}>
                            <IoWarning color={"yellow"} className={"w-28 h-28"}/>
                            <p className={"text-center"}>
                                Pertanyaan {index + 1} belum Anda jawab dan timer
                                pertanyaan {targetQuestionIndex! + 1} akan terus berjalan di
                                belakang. Apakah Anda yakin?
                            </p>
                            <p className={"text-sm text-neutral-400"}>
                                Pesan ini tidak akan muncul lagi
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Batalkan
                            </Button>
                            <Button color="primary"
                                    onClick={() => onNextPress(question.questionIds[targetQuestionIndex!], true)}>
                                Pergi ke pertanyaan {targetQuestionIndex! + 1}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>

        <main
            className={"blue-palette p-2 xl:p-24 pt-28 box-border flex flex-col-reverse xl:flex-row justify-center overflow-y-auto " + manrope.className}
            style={{
                minHeight: "calc(100vh - 256px)"
            }}>
            <div
                className={"bg-[#5353534d] backdrop-blur-3xl w-full mt-6 xl:mt-0 xl:w-64 p-3 pt-0 pb-5 box-border rounded-xl h-fit"}>
                <Button color={"default"} className={"mt-3 mr-3 justify-start"} startContent={<FaArrowLeft size={20}/>}
                        size={"sm"} variant={"ghost"}
                        onPress={() => {
                            router.push(`/competition/question/${params.questionId}`);
                            router.refresh();
                        }}>
                    Kembali
                </Button>
                <p className={"text-xl font-bold"}>Pertanyaan</p>
                <div className={"gap-2 grid grid-cols-12 xl:grid-cols-6 mt-2"}>
                    {question.questionIds.map((x, i) => {
                        // #cfcfcf2e blm jawab
                        // #00ff0540 udah jawab
                        const userAnswered = question.userAnswered[i];
                        const isCurrent = x == question.id;
                        const isWaiting = question.questionsWaiting[i];

                        return <div key={i} onClick={() => questionSelectionSelected(i)}
                                    className={"h-12 flex items-center justify-center outline-2 relative outline-neutral-500 cursor-pointer select-none hover:scale-95 active:scale-90 ease-in-out transition-size outline rounded-md " + (isCurrent ? "bg-[#1e1e1e66]" : userAnswered ? "bg-[#00ff0540]" : "bg-[#cfcfcf2e]")}>
                            {i + 1}
                            {(isWaiting && !userAnswered) ?
                                <FaClock color={"yellow"} className={"absolute -top-1 -right-1"}/> : <></>}
                        </div>
                    })}
                </div>
            </div>
            <div className={"flex w-full max-w-[1200px] h-min"}>
                <div
                    className={"w-full flex flex-col items-center flex-1 min-h-32 bg-[#5353534d] xl:ml-10 rounded-xl p-5 box-border"}>
                    <div className={"flex xl:items-end flex-col xl:flex-row items-center xl:justify-between w-full"}>
                        <p className={"text-2xl font-bold"}>Pertanyaan {index + 1}</p>
                        <div>
                            <p className={"text-center xl:text-right"}>Base point: {question.point} pts</p>
                            <p className={"text-center xl:text-right text-sm text-neutral-400"}>Initial
                                Time: {new Date((question.firstAccessTime || nowRef.current) * 1000).toLocaleString()}</p>
                            {question.userAnswer == undefined &&
                                <p className={"text-center xl:text-right text-sm text-neutral-400"}>
                                    Waktu pertanyaan: {Utils.convertMsToHHMMSS(duration)}
                                </p>}
                            {question.userAnswer != undefined &&
                                <p className={"text-center xl:text-right text-sm text-neutral-400"}>
                                    Selesai dalam: {Utils.convertMsToHHMMSS(question.answerTime * 1000)}
                                </p>}
                        </div>
                    </div>
                    <Divider/>
                    <MarkdownPreview source={question.content?.trim() ?? ""}
                                     className={"mt-3 w-full"}
                                     style={{backgroundColor: "transparent", fontSize: "1.15rem", color: "white"}}/>
                    <div className={"w-full mt-3"}>
                        <RadioGroup
                            value={answer?.toString()}
                            onChange={(v) => {
                                if (question.userAnswered[index]) return;
                                setAnswer(Number(v.target.value));
                            }}
                            // isDisabled={question.userAnswered[index] == 1}
                        >
                            {shuffledChoices.map(({content, id}, i) => {
                                let color = "text-white";
                                let showCheckMark = false;
                                let showCrossMark = false;
                                if (question.isFinished) {
                                    if (question.userAnswer == id && question.correctAnswer == id) {
                                        color = "text-green-400";
                                        showCheckMark = true;
                                    }
                                    if (question.userAnswer == id && question.correctAnswer != id) {
                                        color = "text-red-400";
                                        showCrossMark = true;
                                    }
                                    if (question.userAnswer != id && question.correctAnswer == id) {
                                        color = "text-green-400";
                                        showCheckMark = true;
                                    }
                                }
                                return <Radio key={i} value={id.toString()}>
                                    <p className={color + " flex items-center"}>{ch[i]}. {content}{showCheckMark ?
                                        <FaCheck color={"green"} className={"ml-3 shrink-0"}/> : <></>} {showCrossMark ?
                                        <ImCross color={"red"} className={"ml-3 shrink-0"}/> : <></>}</p>

                                </Radio>
                            })}
                        </RadioGroup>
                    </div>

                    <div className={"flex justify-between mt-7 w-full"}>
                        <Button
                            className={(question.questionIds[index - 1] == undefined) ? "hidden" : ""}
                            isDisabled={!question.questionIds[index - 1]}
                            onClick={() => onNextPress(question.questionIds[index - 1])}>
                            Sebelumnya
                        </Button>
                        <Button
                            className={"ml-auto " + ((question.isFinished && question.questionIds[index + 1] == undefined) ? "hidden" : "")}
                            color={"primary"}
                            onClick={() => question.questionIds[index + 1] != undefined ? onNextPress(question.questionIds[index + 1]) : submitAnswer()}
                        >
                            {question.questionIds[index + 1] != undefined ? "Selanjutnya" : "Submit"}
                        </Button>
                    </div>

                    {question.isFinished && question.explanation != undefined &&
                        <div className={"w-full mt-5 bg-[#5353534d] rounded-md p-4 box-border"}>
                            <p>Penjelasan:</p>
                            <MarkdownPreview source={question.explanation?.trim() ?? ""}
                                             className={"mt-3 w-full"}
                                             style={{
                                                 backgroundColor: "transparent",
                                                 fontSize: "1rem",
                                                 color: "white"
                                             }}/>
                        </div>}
                </div>
            </div>
        </main>

        <Footer/>
    </>
}