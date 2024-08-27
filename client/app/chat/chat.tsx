'use client'
import {Manrope} from "next/font/google";
import React, {useEffect} from "react";
import {setCookie} from "cookies-next";
import Header from "@/app/components/header";
import {Button} from "@nextui-org/react";
import {IoIosSend} from "react-icons/io";

const manrope = Manrope({subsets: ["latin"]});

export default function Chat({userInfo}: { userInfo: any }) {
    const [input, setInput] = React.useState("");
    const [topicData, setTopicData] = React.useState([{
        name: "Why someone is trying to shot Trump"
    }, {
        name: "How C++ works"
    }, {
        name: "How to use React State"
    }]);

    useEffect(() => {
        setCookie('authorization', 'thisisatesttoken')
    }, [])

    return <main
        className={"min-w-screen min-h-screen pt-8 flex flex-col items-center " + manrope.style}>
        <Header userInfo={userInfo}/>
        <div className={"flex-1 w-[90vw] max-w-[120rem] flex h-full mt-10 mb-20 pl-5 pr-5"}>

            <div
                className={"flex flex-col bg-[#6e6e6e4d] backdrop-blur-3xl w-80 max-w-80 rounded-3xl pt-6 p-3 box-border"}>
                <h2 className={"text-3xl text-center font-semibold mb-6"}>Chat</h2>
                {topicData.map((topic, index) => {
                    return <Button radius="lg" key={index} className={"mb-3 w-72 align-baseline text-[1.1rem] pl-2 pr-2 text-left bg-[#adadad5e] text-white overflow-hidden text-ellipsis whitespace-nowrap block"}>
                        {topic.name}
                    </Button>
                })}
            </div>
            <div
                className={"flex items-center justify-center bg-[#6e6e6e4d] ml-5 backdrop-blur-3xl w-full rounded-3xl p-7 box-border"}>
                <div className={""}>

                </div>
                <div className={"mt-auto w-full max-w-[70%] h-14 bg-[#8888883b] rounded-full flex items-center"}>
                    <input
                        type="text"
                        className={"w-full h-full rounded-full bg-[#88888800] p-4 text-white text-[1rem] outline-0 ml-3"}
                        placeholder={"Type here to send a message..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button radius="full" className={"mr-2"} startContent={<IoIosSend size={30}/>}>
                        Send
                    </Button>
                </div>
            </div>
        </div>

    </main>
}