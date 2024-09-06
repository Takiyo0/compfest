import {LogoComponent} from "@/app/assets/images/logo";

export default function Footer() {
    return <div className={"w-full min-h-64 pt-7"} style={{background: "linear-gradient(0deg, black, transparent)"}}>
        <div className={"flex flex-col items-center justify-center"}>
            <LogoComponent viewBox={"0 0 35 28"} className={"w-32 h-32 mx-auto"}/>
            <h2 className={"text-2xl ml-2 font-semibold text-center text-white"}>Kuduga AI</h2>
        </div>

        <p className={"text-center mt-10 text-[.8rem]"}>Developed with 💗 by Raihan, Akmal, & Arya</p>
    </div>
}