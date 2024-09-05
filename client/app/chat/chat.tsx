'use client'
import {Manrope} from "next/font/google";
import React, {useEffect} from "react";
import {setCookie, getCookie} from "cookies-next";
import {Avatar, Button, Spinner, Tab, Tabs} from "@nextui-org/react";
import {IoIosSend} from "react-icons/io";
import {MdChat, MdOutlineArrowBack} from "react-icons/md";
import {LogoComponent} from "@/app/assets/images/logo";
import {ApiManager, ChatMessagesResponse, ChatTopicResponse, UserInfoResponse} from "@/app/managers/api";
import MarkdownPreview from '@uiw/react-markdown-preview';
import {FaPencilAlt} from "react-icons/fa";
import {IoIosCreate} from "react-icons/io";
import {
    useWindowSize
} from '@react-hook/window-size'
import {useCycle, motion} from "framer-motion";
import {useRouter} from "next/navigation";
import {QuestionGraphics} from "@/app/assets/images/question";
import Header from "@/app/components/header";

const manrope = Manrope({subsets: ["latin"]});

export default function Chat({userInfo, baseTopics, baseMessages}: {
    userInfo: UserInfoResponse['data'],
    baseTopics: ChatTopicResponse['data'],
    baseMessages?: ChatMessagesResponse['data']
}) {
    const router = useRouter();
    const [width] = useWindowSize();
    const [input, setInput] = React.useState("");
    const [topicData, setTopicData] = React.useState<ChatTopic[]>(baseTopics); // {id: number, title: string}[]
    const [topicId, setTopicId] = React.useState(baseTopics.length > 0 ? baseTopics[0].id : -1); // id number
    const [chats, setChats] = React.useState<ChatMessage[]>(baseMessages != undefined ? baseMessages.map(x => ({
        ...x,
        waiting: false
    })) : []); // {id: number, role: 'ASSISTANT' | 'USER', content: string, createdAt: number}[]
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [chatLoading, setChatLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [navOpen, cycleNavOpen] = useCycle(-320, 0);

    let controller = React.useRef(new AbortController());
    const isNewChat = React.useRef(false);

    const Authorization = getCookie('Authorization');

    React.useEffect(() => console.log(chatLoading), [chatLoading])


    useEffect(() => {
        return () => controller.current.abort();
    }, []);

    function CreateNewChat() {
        if (topicId == -1) return;
        controller.current.abort();
        controller.current = new AbortController();
        setTopicId(-1);
        setInput("");
        setChatLoading(true);
        setChats([]);
        setTimeout(() => setChatLoading(false), 200);
    }

    async function SendMessage(content: string, currentChats: any) {
        let newTopicId;
        if (topicId == -1) {
            const {data, statusCode} = await ApiManager.CreateChatTopic(controller.current.signal, Authorization ?? "");
            if (statusCode != 200) return setError("Unable to create chat");
            isNewChat.current = true;
            setTopicData(x => {
                x.unshift({id: data.chatId, title: "New Chat"});
                return x;
            });
            setTopicId(data.chatId);
            newTopicId = data.chatId;
        }

        setInput("");
        setIsGenerating(true);
        const userChat = {id: -1, role: "USER", content: content, created_at: Math.floor(Date.now() / 1000)}
        let assistantChat = {
            id: -2,
            role: "ASSISTANT",
            content: "",
            created_at: Math.floor(Date.now() / 1000),
            waiting: true
        };
        setChats([userChat, ...currentChats]);
        setTimeout(() => setChats([assistantChat, userChat, ...currentChats]), 200);
        const eventSource = new EventSource(ApiManager.BaseUrl + `/assistant/chat/${newTopicId ?? topicId}/prompt?prompt=${encodeURIComponent(content)}&_sseToken=${ApiManager.Decrypt(Authorization ?? "")}`);

        const onAbort = () => eventSource.close();
        let text = '';
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.stop) {
                eventSource.close();
                setIsGenerating(false);
                controller.current.signal.removeEventListener("abort", onAbort)
                return GetAndParseMessages();
            }
            text += data.content;
            assistantChat.content = text;
            assistantChat.waiting = false;
            setChats([assistantChat, userChat, ...currentChats]);
        }
        controller.current.signal.addEventListener("abort", onAbort);
    }

    async function GetAndParseMessages(loading: boolean = false, id?: number) {
        if (loading) setChatLoading(true);
        const {
            data,
            statusCode
        } = await ApiManager.GetChatMessages(controller.current.signal, Authorization ?? "", id ?? topicId);
        if (statusCode == 200) {
            setChats((data ?? []) as ChatMessage[]);
        }

        setChatLoading(false);
        console.log(statusCode);
    }

    async function changeTopic(id: number) {
        if (isNewChat.current) {
            isNewChat.current = false;
            return console.log("skipped")
        }
        if (id == topicId) return;

        console.log("changing topic");
        controller.current.abort();
        controller.current = new AbortController();
        setChatLoading(true);
        setChats([]);
        setInput("");
        setTopicId(id);
        await GetAndParseMessages(true, id);
    }


    return <>
        <Header userInfo={userInfo} center={true}/>
        <main
            className={"blue-palette w-screen h-dvh h-screen absolute flex flex-col pt-28 items-center overflow-x-hidden " + manrope.className + (width < 1024 ? " !pt-24" : "")}>
            <div
                className={"flex-1 w-screen flex h-full pb-8 pl-5 pr-5 " + (width < 1024 ? `!pl-3 !pr-3 h-screen` : "")}>

                <motion.div
                    className={"flex flex-col bg-[#5353534d] backdrop-blur-3xl w-80 max-w-80 rounded-3xl pt-6 p-3 box-border " + (width < 1024 ? `z-10 absolute rounded-bl-none rounded-tl-none` : "")}
                    initial={width < 1024 ? {left: navOpen} : {}}
                    transition={{
                        duration: .8,
                        ease: [0.25, 0.8, 0.5, 1]
                    }}
                    animate={width < 1024 ? {left: navOpen} : {}}>

                    {width >= 1024 && <>
                        <Button startContent={<MdOutlineArrowBack size={20}/>} variant={"light"}
                                onClick={(_ => router.back())}
                                className={"-ml-3 mt-1 self-start"}>Kembali</Button>
                        <div className={"flex items-center"}>
                            <LogoComponent viewBox={"0 0 35 28"} className={"w-14 h-14 mr-3"}/>
                            <h2 className={"text-2xl font-semibold text-center"}>Kuduga AI</h2>
                        </div>
                    </>}
                    {width < 1024 && <div className={"flex"}>
                        <Button startContent={<MdOutlineArrowBack size={20}/>} variant={"light"}
                                onClick={(_ => router.back())}
                                className={"-ml-3 mt-1"}>Kembali</Button>
                        <div className={"flex items-center absolute -right-12"}>
                            <h2 className={"text-2xl font-semibold text-center mr-3"}>Kuduga AI</h2>
                            <LogoComponent viewBox={"0 0 35 28"}
                                           className={"w-12 h-12 pl-3 pr-2 rounded-tr-xl rounded-br-xl bg-[#5353534d] backdrop-blur-3xl"}
                                           onClick={() => cycleNavOpen()}/>
                        </div>
                    </div>}
                    {/*<h2 className={"text-xl font-semibold mt-4"}>Topics</h2>*/}
                    {/*{topicData.map((topic, index) => {*/}
                    {/*    return <Button radius="lg" key={index} disabled={topicId == topic.id}*/}
                    {/*                   onClick={() => changeTopic(topic.id)}*/}
                    {/*                   className={"mb-1 w-72 align-baseline text-[1rem] pl-2 pr-2 text-left bg-transparent text-white overflow-hidden text-ellipsis whitespace-nowrap block hover:bg-neutral-600 " + (topicId == topic.id ? "bg-[#4a4a98]" : "")}>*/}
                    {/*        {topic.title} ({topic.id})*/}
                    {/*    </Button>*/}
                    {/*})}*/}
                    <Button color={"primary"} className={"mt-4 mb-4 " + (width < 1024 ? "mt-2" : "")}
                            variant={topicId == -1 ? "shadow" : "solid"}
                            startContent={<IoIosCreate size={25}/>}
                            onClick={CreateNewChat}>
                        New Chat
                    </Button>
                    <Tabs aria-label="Options" color="primary" isVertical={true} variant={"light"} className={"w-full"}
                          items={topicData}
                          selectedKey={topicId}
                          onSelectionChange={(d) => changeTopic(d as number)}>
                        {(item) => (
                            <Tab
                                key={item.id}
                                title={
                                    <div
                                        className="mb-1 w-72 align-baseline text-[1rem] pl-2 pr-2 text-left overflow-hidden text-ellipsis whitespace-nowrap block">
                                        {item.title} ({item.id})
                                    </div>
                                }
                            />
                        )}
                    </Tabs>
                </motion.div>

                <div
                    className={"flex flex-col items-center justify-center bg-[#5353534d] ml-5 backdrop-blur-3xl w-full rounded-3xl p-7 box-border " + (width < 1024 ? "!ml-0 !p-2" : "")}
                    style={width < 1024 ? {zoom: .8} : {}}>
                    <div
                        className={"w-full h-12 bg-[#3d47a59c] rounded-2xl pl-3 pr-3 flex items-center " + (width < 1024 ? "ml-0 p-0" : "")}>
                        <div className={"topic flex items-center"}>
                            <MdChat size={26} className={"mr-2"}/>
                            <h2 className={"text-[1.1rem]"}>({topicData?.find(x => x.id == topicId)?.id || "-"}) {topicData?.find(x => x.id == topicId)?.title || "New Chat"}</h2>
                        </div>
                        <div className={"status text-[0.9rem] text-zinc-400 ml-auto flex items-center"}>
                            <div
                                className={`w-2 h-2 rounded-full ${isGenerating ? "bg-yellow-500" : "bg-green-500"} mr-1`}></div>
                            {isGenerating ? "generating" : "idle"}
                        </div>
                    </div>
                    <div
                        className={((chatLoading || !chatLoading && chats.length == 0) ? "items-center justify-center " : "") + "chat-parent flex-1 w-full max-w-[80%] overflow-x-hidden overflow-y-auto mt-5 pr-2 flex flex-col-reverse " + (width < 1024 ? "ml-0 p-0 max-w-full " : "")}>
                        {!chatLoading && chats.length == 0 &&
                            <div className={"flex flex-col items-center w-full max-w-72"}>
                                <QuestionGraphics className={"w-72 h-72"}/>
                                <p className={"text-center"}>Silahkan tanyakan pertanyaan apa saja terkait pemrograman
                                    kepada
                                    Kukira</p>
                            </div>}
                        {chatLoading ? <Spinner size="lg"/> : chats.map((chat, index) => {
                            const time = new Date(chat.created_at * 1000);
                            return <div key={index}
                                        className={"max-w-[70%] w-fit h-min flex items-end mb-5 relative " + (chat.role === "USER" ? "ml-auto " : "") + (width < 1024 ? "max-w-[80%] " : "")}>
                                {chat.role === "ASSISTANT" &&
                                    <Avatar src={""} size={"md"} className={"mr-3 flex-shrink-0"}/>}
                                <div
                                    className={"flex-1 h-min bg-[#8888883b] rounded-3xl flex items-center max-w-full " + (chat.role === "USER" ? "ml-auto user-bubble " : "bot-bubble ")}>
                                    {chat.waiting ? <div id="wave">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div> : <div
                                        className={"rounded-full bg-[#88888800] p-2 pl-4 pr-4 text-white text-[1rem] flex-1 max-w-[-webkit-fill-available] " + (chat.role === "USER" ? "text-right" : "")}>
                                        <MarkdownPreview source={chat.content.trim()}
                                                         style={{backgroundColor: "transparent"}}/>
                                    </div>}
                                    {/*<p*/}
                                    {/*    className={"rounded-full bg-[#88888800] p-2 pl-4 pr-4 text-white text-[1rem] " + (chat.role === "USER" ? "text-right" : "")}>*/}
                                    {/*    {chat.content}*/}
                                    {/*</p>*/}
                                </div>
                                {chat.role === "USER" &&
                                    <Avatar src={""} size={"md"} className={"ml-3 flex-shrink-0"}/>}
                                <p className={`absolute bottom-1 ${chat.role === "USER" ? "-left-10" : "-right-10"} text-[.8rem] text-neutral-400`}>
                                    {time.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2})}:{time.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2})}
                                </p>
                            </div>
                        })
                        }

                    </div>
                    <div
                        className={"mt-auto w-full max-w-[70%] h-14 bg-[#8888883b] rounded-full flex items-center " + (width < 1024 ? "max-w-full" : "")}>
                        <input
                            type="text"
                            disabled={isGenerating}
                            className={"w-full h-full rounded-full bg-[#88888800] p-4 text-white text-[1rem] outline-0 ml-3"}
                            placeholder={"Type here to send a message..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button radius="full" className={"mr-2"} disabled={(input.trim().length == 0) || isGenerating}
                                color={"primary"}
                                startContent={isGenerating ?
                                    <Spinner color="primary" size="sm"/> : (input.trim().length == 0 ?
                                        <FaPencilAlt size={25}/> : <IoIosSend size={30}/>)}
                                onClick={() => SendMessage(input, chats)}>
                            {isGenerating ? "generating" : "send"}
                        </Button>
                    </div>
                </div>
            </div>

        </main>
    </>
}

interface ChatTopic {
    id: number;
    title: string;
}

interface ChatMessage {
    id: number;
    role: 'ASSISTANT' | 'USER';
    content: string;
    created_at: number;
    waiting: boolean;
}
