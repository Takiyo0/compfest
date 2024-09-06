import {NextResponse} from "next/server";
import osu from "node-os-utils";

export async function GET(request: Request) {
    const cpuUsage = await osu.cpu.usage();
    return NextResponse.json({
        message: "Hohoho I'm so healthy thank you for caring me", stats: {
            memoryUsage: process.memoryUsage().rss / 1024 / 1024,
            cpuUsage
        }
    });
}