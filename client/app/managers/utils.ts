import {UserInfoResponse} from "@/app/managers/api";
import ErrorPage from "@/app/components/pages/ErrorPage";

export class Utils {
    static shuffleArray(array: any) {
        for (let i = array.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    static convertMsToHHMMSS(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes % 60).padStart(2, '0');
        const formattedSeconds = String(seconds % 60).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
}