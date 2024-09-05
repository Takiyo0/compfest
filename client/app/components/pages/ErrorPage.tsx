import {Manrope} from "next/font/google";

const manrope = Manrope({subsets: ["latin"]});

export default function ErrorPage({message, errorCode}: { message: string, errorCode: number }) {
    return <main
        className={"blue-palette min-w-screen min-h-screen flex flex-col items-center justify-center " + manrope.className}>
        <div>
            <p>{message}</p>
        </div>
    </main>
}