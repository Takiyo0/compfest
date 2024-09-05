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
import {MdOutlineArrowBack} from "react-icons/md";
import {useRouter} from "next/navigation";

const manrope = Manrope({subsets: ["latin"]});

export default function Material({userData, skillTree}: {
    userData: UserInfoResponse['data'],
    skillTree: TreeResponse['data']['skillTree'][0]
}) {
    const router = useRouter();
    const [selectedEntry, setSelectedEntry] = React.useState(0);
    const [contents, setContents] = React.useState(new Array(skillTree.entries.length).fill(""));
    const {queue, addQueue, removeQueue} = useQuestionQueue();


    const controller = React.useRef(new AbortController);
    const authorization = getCookie("Authorization");
    const interval = React.useRef<NodeJS.Timeout>();

    React.useEffect(() => {
        if (interval.current) clearInterval(interval.current);

        interval.current = setInterval(async () => {
            console.log("fetching", queue);
            const data = await Promise.all(queue.map(async x => ({
                id: x.entryId,
                data: await ApiManager.GetTreeEntryContent(controller.current.signal, authorization ?? "", skillTree.id, x.entryId)
            })));
            console.log(data);
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
            console.log("abort")
            ref.abort();
            if (interval.current) clearInterval(interval.current);
        }
    }, [])

    React.useEffect(() => {
        const target = skillTree.entries[selectedEntry];
        if (!target) return;
        addToQueue(target.id, selectedEntry);
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

    React.useEffect(() => console.log([contents, selectedEntry]), [contents])

    return <>
        <Header userInfo={userData} center={true}/>
        <main
            className={"pt-28 blue-palette w-screen h-screen p-10 flex items-start justify-center overflow-x-hidden " + manrope.className}>
            <div className={"max-w-[300px] h-min p-4 pt-2 bg-[#5353534d] rounded-xl sticky top-0"}>
                <Button startContent={<MdOutlineArrowBack size={20}/>} variant={"light"}
                        onClick={(_ => router.push("/"))}
                        className={"-ml-3"}>Kembali</Button>
                <h1 className={"ml-2 text-xl font-semibold"}>Materi</h1>
                <Tabs aria-label="Options" color="primary" isVertical={true} variant={"light"} className={"w-full"}
                      selectedKey={selectedEntry}
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
            </div>
            <div className={"max-w-[900px] ml-5 w-full flex flex-col min-h-[90%] h-min p-4 bg-[#5353534d] rounded-xl"}>
                <h1 className={"text-2xl font-semibold"}>{skillTree.name}</h1>
                <h2 className={"text-xl text-gray-400"}>{skillTree.entries[selectedEntry]?.title}</h2>
                <hr className={"border-gray-400 mt-1"}/>
                {!contents[selectedEntry] ? <div className={"flex flex-1 justify-center items-center flex-col"}>
                        <l-helix
                            size="200"
                            speed="2.5"
                            color="#84A1F5"/>
                        <p className={"mt-7 text-2xl"}>Sedang menyiapkan pertanyaan... Estimasi waktu 1-2 menit.
                            Harap menunggu</p>
                    </div> :
                    <MarkdownPreview source={contents[selectedEntry]?.trim() ?? ""}
                                     className={"mt-3"}
                                     style={{backgroundColor: "transparent"}}/>}
            </div>
        </main>
    </>
}