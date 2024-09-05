'use client'

import {ApiManager, TreeResponse, UserInfoResponse} from "@/app/managers/api";
import {Button, Tab, Tabs} from "@nextui-org/react";
import React from "react";
import {Manrope} from "next/font/google";
import useQuestionQueue from "@/app/hooks/QuestionQueue";
import {getCookie} from "cookies-next";
import toast from "react-hot-toast";
import MarkdownPreview from "@uiw/react-markdown-preview";
import Header from "@/app/components/header";
import {MdOutlineArrowBack, MdQuiz, MdReviews} from "react-icons/md";
import {useRouter} from "next/navigation";
import {motion, useCycle} from "framer-motion";
import {useWindowSize} from "@react-hook/window-size";
import {LogoComponent} from "@/app/assets/images/logo";
import Footer from "@/app/components/footer";

const manrope = Manrope({subsets: ["latin"]});

export default function Material({userData, skillTree}: {
    userData: UserInfoResponse['data'],
    skillTree: TreeResponse['data']['skillTree'][0]
}) {
    const [width, height] = useWindowSize();
    const router = useRouter();
    const [isOpen, cycleOpen] = useCycle(-300, 0);
    const [selectedEntry, setSelectedEntry] = React.useState(0);
    const [contents, setContents] = React.useState(new Array(skillTree.entries.length).fill(""));
    const {queue, addQueue, removeQueue} = useQuestionQueue();


    const controller = React.useRef(new AbortController);
    const authorization = getCookie("Authorization");
    const interval = React.useRef<NodeJS.Timeout>();

    React.useEffect(() => {
        if (interval.current) clearInterval(interval.current);

        interval.current = setInterval(async () => {
            const data = await Promise.all(queue.map(async x => ({
                id: x.entryId,
                data: await ApiManager.GetTreeEntryContent(controller.current.signal, authorization ?? "", skillTree.id, x.entryId)
            })));

            const readyData = data.filter(x => x.data.statusCode === 200 && x.data.data.ready);
            if (readyData.length > 0) {
                setContents(x => {
                    const temp = [...x];
                    readyData.forEach(x => temp[x.id] = x.data.data.content);
                    return temp;
                });
                readyData.map(x => removeQueue(x.id));
            }
        }, 3000);
    }, [queue]);

    React.useEffect(() => {
        async function getLoader() {
            const {helix} = await import('ldrs')
            helix.register()
        }

        getLoader();

        const ref = controller.current;
        return () => {
            // ref.abort();
            if (interval.current) clearInterval(interval.current);
        }
    }, [])

    React.useEffect(() => {
        const target = skillTree.entries[selectedEntry];
        if (!target) return;
        addToQueue(target.id, selectedEntry);
        if (isOpen == 0) cycleOpen();
    }, [selectedEntry]);

    async function addToQueue(id: number, index: number) {
        if (contents[index] != "") return;
        if (queue.find(x => x.entryId == id)) return;
        const {
            data,
            statusCode
        } = await ApiManager.GetTreeEntryContent(controller.current.signal, authorization ?? "", skillTree.id, id);
        if (statusCode != 200) return toast.error("Received code other than 200. Please try again later");
        console.log(`Data is ${data.ready ? "ready" : "not ready"}`);
        if (data.ready) {
            setContents(x => {
                const temp = [...x];
                temp[index] = data.content;
                return temp;
            });
        } else addQueue({entryId: id, status: "PROCESSING"});
    }

    React.useEffect(() => console.log([contents, selectedEntry]), [contents]);

    return <>
        <Header userInfo={userData} center={true}/>
        <main
            className={"pt-28 blue-palette max-w-full w-screen min-h-screen h-auto p-10 flex items-start justify-center overflow-x-hidden " + manrope.className + (width < 1024 ? " !p-3 !pt-28" : "")}>
            <motion.div
                className={"max-w-[300px] h-min p-4 pt-2 bg-[#5353534d] rounded-xl backdrop-blur-3xl sticky top-0 " + (width < 1024 ? ` z-10 !fixed top-28 rounded-bl-none rounded-tl-none` : "")}
                initial={width < 1024 ? {left: isOpen} : {}}
                transition={{
                    duration: .8,
                    ease: [0.25, 0.8, 0.5, 1]
                }}
                animate={width < 1024 ? {left: isOpen} : {}}>
                <div className={"flex"}>
                    <Button startContent={<MdOutlineArrowBack size={20}/>} variant={"light"}
                            onClick={(_ => router.back())}
                            className={"-ml-3 mt-1"}>Kembali</Button>

                    {width < 1024 && <div className={"flex items-center absolute -right-12"}>
                        <h2 className={"text-2xl font-semibold text-center mr-3"}>Kuduga AI</h2>
                        <LogoComponent viewBox={"0 0 35 28"}
                                       className={"w-12 h-12 pl-3 pr-2 rounded-tr-xl rounded-br-xl bg-[#5353534d] backdrop-blur-3xl"}
                                       onClick={() => cycleOpen()}/>
                    </div>}
                </div>
                <h1 className={"ml-2 text-xl font-semibold"}>{skillTree.finished ? "Ayo review hasil Anda" : "Siap mengerjakan soal?"}</h1>
                <Button className={"w-full mt-2 mb-3"} color={"primary"}
                        onPress={() => router.push(`/ganbatte/${skillTree.id}${skillTree.finished ? "/archive" : ""}`)}
                        startContent={skillTree.finished ? <MdReviews size={25}/> : <MdQuiz
                            size={25}/>}>{skillTree.finished ? "Review hasil" : "Kerjakan Latihan Soal"}</Button>
                <h1 className={"ml-2 text-xl font-semibold"}>Materi</h1>
                <Tabs aria-label="Options" color="primary" isVertical={true} variant={"light"} className={"w-full"}
                      selectedKey={selectedEntry}
                      classNames={{
                          tabList: width < 1024 ? "ye" : ""
                      }}
                      items={skillTree.entries.map(x => ({id: x.id, title: x.title}))}
                      onSelectionChange={(d) => setSelectedEntry(d as number)}>
                    {(item: any) => {
                        const index = skillTree.entries.findIndex(x => x.id === item.id);
                        return <Tab
                            key={index}

                            title={
                                <div
                                    className="mb-1 w-64 align-baseline text-[.9rem] pl-2 pr-2 text-left overflow-hidden text-ellipsis whitespace-nowrap block">
                                    {item.title} ({item.id})
                                </div>
                            }
                        />
                    }}
                </Tabs>
            </motion.div>
            <div
                className={"max-w-[900px] ml-5 w-full flex flex-col min-h-[90vh] h-min p-4 box-border bg-[#5353534d] rounded-xl " + (width < 1024 ? ` !ml-0` : "")}
                style={width < 1024 ? {zoom: .9} : {}}>
                <h1 className={"text-2xl font-semibold"}>{skillTree.name}</h1>
                <h2 className={"text-xl text-gray-400"}>{skillTree.entries[selectedEntry]?.title}</h2>
                <hr className={"border-gray-400 mt-1"}/>
                {!contents[selectedEntry] ? <div className={"flex flex-1 justify-center items-center flex-col"}>
                        <l-helix
                            size="200"
                            speed="2.5"
                            color="#84A1F5"/>
                        <p className={"mt-7 text-2xl text-center"}>Sedang menyiapkan materi... Estimasi waktu 1-2 menit.
                            Harap menunggu</p>
                    </div> :
                    <MarkdownPreview source={contents[selectedEntry]?.trim() ?? ""}
                                     className={"mt-3"}
                                     style={{backgroundColor: "transparent"}}/>}
            </div>
        </main>
        <Footer/>
    </>
}