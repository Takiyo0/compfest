import Image from "next/image";
import {LogoComponent} from "@/app/assets/images/logo";

export default function Header({userInfo, center = false}: { userInfo: any, center?: boolean }) {
    return (<div
        className={"header w-[95vw] max-w-[70rem] h-14 bg-[#ffffff4d] backdrop-blur-3xl pl-5 pr-5 flex items-center relative rounded-full ml-20 mr-20" + (center ? " left-1/2 -translate-x-1/2" : "")}>
        <div className={"flex items-center justify-center"}>
            <LogoComponent viewBox={"0 0 35 28"} className={"w-12 h-12 mx-auto"}/>
            <h2 className={"text-2xl ml-2 font-semibold text-center"}>Konfig AI</h2>
        </div>
    </div>)
}