import {Manrope} from "next/font/google";

const manrope = Manrope({subsets: ["latin"]});

export default function Home() {
    return (
        <main className={"flex min-h-screen flex-col items-center justify-between p-24 " + manrope.style}>
            halo
        </main>
    );
}
