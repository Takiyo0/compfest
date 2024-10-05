'use client'

import {ApiManager, TopicResponse, UserInfoResponse} from "@/app/managers/api";
import Header from "@/app/components/header";
import React, {useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import {Manrope} from "next/font/google";
import {Image} from "@nextui-org/image";
import {logo} from "@/app/competition/competition";
import {Accordion, AccordionItem, Button} from "@nextui-org/react";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/modal";
import {getCookie} from "cookies-next";
import toast from "react-hot-toast";
import {MdOutlineArrowBack} from "react-icons/md";
import {Utils} from "@/app/managers/utils";
import {Link} from "@nextui-org/link";

const manrope = Manrope({subsets: ["latin"]});

const rules = [{
    title: "Jawab Dengan Sejujurnya",
    description: "Pastikan untuk menjawab setiap pertanyaan dengan kejujuran agar hasilnya akurat."
}, {
    title: "Pengerjaan Akan Diwaktu Untuk Pencatatan Skor",
    description: "Semakin cepat Anda menyelesaikan soal, semakin tinggi skor yang akan didapat."
}, {
    title: "Anda Dapat Mengerjakan Kembali Soal, namun Skor Tidak Akan Mengalami Perubahan",
    description: "Anda bisa mengulang soal kapan saja, tetapi skor yang sudah tercatat tidak akan berubah."
}];

export default function QuestionPage({userData, topic}: {
    userData: UserInfoResponse['data'],
    topic: TopicResponse['data']
}) {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const router = useRouter();
    const params = useParams<{ questionId: string }>()

    const Authorization = getCookie('Authorization');
    let controller = React.useRef(new AbortController());

    const [timers, setTimers] = React.useState<{ id: number, ms: number }[]>([]);

    useEffect(() => {
        const id = setInterval(() => {
            for (let i = 0; i < topic.sessions.length; i++) {
                const t = topic.sessions[i];
                if (t.State == "IN_PROGRESS") {
                    setTimers(timers => {
                        const temp = [...timers];
                        if (temp.find(x => x.id == t.Id)) {
                            temp[temp.findIndex(x => x.id == t.Id)].ms = Date.now() - topic.sessions[i].StartedAt * 1000
                        } else {
                            temp.push({
                                id: topic.sessions[i].Id,
                                ms: Date.now() - topic.sessions[i].StartedAt * 1000
                            })
                        }
                        return temp;
                    });
                }
            }
        }, 1000);

        return () => {
            controller.current.abort();
            clearInterval(id);
        }
    }, []);

    function onPress() {
        if (topic.sessions.length == 0) {
            onOpen();
        } else {
            const latestSession = topic.sessions.find(x => x.IsLatest) || topic.sessions[topic.sessions.length - 1];
            if (latestSession && latestSession.State == "IN_PROGRESS") {
                router.push(`/competition/question/${topic.id}/${latestSession.Id}/${topic.firstQuestionId}`);
            } else {
                startNewSession();
            }
        }
    }

    async function startNewSession() {
        const {
            data,
            statusCode
        } = await ApiManager.StartNewSession(controller.current.signal, Authorization ?? "", topic.id);
        if (statusCode != 200) {
            return toast.error((data as any)?.message ? `Error occured: ${(data as any).message}` : `Failed to create new session. Please refresh and try again later`);
        }

        router.push(`/competition/question/${topic.id}/${data.session.Id}/${topic.firstQuestionId}`);
    }


    return <>
        <Header userInfo={userData} center={true}/>
        <Modal backdrop={"blur"} className={"blue-palette"} isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Konfirmasi Pengerjaan</ModalHeader>
                        <ModalBody>
                            <p>Apakah anda yakin ingin mengerjakan soal ini? Waktu akan mulai dicatat saat Anda menekan
                                tombol Kerjakan!. Pastikan Anda sudah siap untuk
                                mengerjakannya. {topic.sessions.length == 0 ? "Skor akan ditentukan melalui tes sekarang." : "Skor Anda tidak akan berubah."}</p>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Saya belum siap
                            </Button>
                            <Button color="primary" onPress={startNewSession}>
                                Kerjakan!
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
        <main
            className={"blue-palette p-24 box-border flex justify-center overflow-y-auto " + manrope.className}>
            <div className={"mt-8 flex w-full max-w-[1200px]"}>
                <div
                    className={"w-full flex flex-col items-center flex-1 min-h-32 bg-[#5353534d] ml-10 rounded-xl p-5 box-border"}>
                    <div className={"w-full"}>
                        <Button startContent={<MdOutlineArrowBack size={20}/>} variant={"light"}
                                onClick={(_ => router.push(`/competition`))}
                                className={"-ml-3 mt-1"}>Kembali</Button>
                    </div>
                    <div className={"flex items-center"}>
                        <Image src={logo[topic.name]} alt={topic.name} width={200} height={200}/>
                        <div className={"ml-6"}>
                            <div className={"flex items-center"}>
                                <p className={"text-3xl font-bold"}>{topic.name}</p>
                                <div
                                    className={"p-1 pr-2 pl-2 ml-3 h-min w-min bg-" + (topic.difficulty == "EASY" ? "green-500" : topic.difficulty == "MEDIUM" ? "yellow-500" : "red-500") + " rounded-full"}>
                                    <p className={"text-medium"}>{topic.difficulty}</p>
                                </div>
                            </div>
                            <p className={"text-medium text-neutral-400"}>{topic.description}</p>

                            <div>
                                Skor
                                Anda: {topic.sessions.length == 0 ? "0" : topic.sessions.reduce(
                                (a, b) => a + (b.State == "IN_PROGRESS" ? 0 : b.Score), 0)} pts
                            </div>
                        </div>
                    </div>

                    <p className={"text-xl font-bold w-full"}>Peraturan</p>
                    <Accordion>
                        {rules.map((x, i) => {
                            return <AccordionItem
                                title={<p className={"text-medium"}>{i + 1}. {x.title}</p>}
                                key={i}
                            >
                                <p className={"text-medium"}>{x.description}</p>
                            </AccordionItem>
                        })}
                    </Accordion>

                    <div className={"w-full mt-7"}>
                        <div className={"flex justify-between"}>
                            <p className={"text-xl font-bold"}>Sessions</p>
                            <p className={"text-left"}>Total Questions: {topic.totalQuestions}</p>
                        </div>
                    </div>

                    <div className={"w-full min-h-24 items-center justify-center"}>
                        {topic.sessions.length == 0 ? <>
                            <p>Anda belum pernah menjawab soal ini</p>
                        </> : topic.sessions.map((x, i) => {
                            return <>
                                <div
                                    className={"w-full p-3 box-border flex items-center rounded-md border-b-neutral-500 border-b-1"}>
                                    <p>{i + 1}.</p>
                                    <div className={"ml-3"}>
                                        <p className={x.IsLatest ? "text-yellow-200" : ""}>Attempt {x.Attempt}</p>
                                        <p className={"text-neutral-400 text-sm"}>State: {x.State} {x.State == "IN_PROGRESS" ? `Dimulai sejak ${Utils.convertMsToHHMMSS(timers.find(a => a.id == x.Id)?.ms || 0)} yang lalu` : ""}</p>
                                    </div>
                                    <p className={"ml-auto text-sm"}>Skor: {x.Score}pts</p>
                                    <Button color className={"ml-2"} variant={"bordered"} size={"sm"} onClick={() => {
                                        router.push(`/competition/question/${params.questionId}/${x.Id}/${topic.firstQuestionId}`)
                                    }}>
                                        Review
                                    </Button>

                                </div>
                            </>
                        })}
                    </div>


                    <div className={"flex"}>
                        <Button color="primary" onClick={onPress}>
                            {topic.sessions.length == 0 ? "Mulai Kerjakan" : topic.sessions.find(x => x.IsLatest)?.State == "IN_PROGRESS" ? `Lanjutkan Attempt ${topic.sessions.find(x => x.IsLatest)!.Attempt}` : "Kerjakan Ulang (tidak mereset score awal)"}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    </>
}