import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import CryptoJS from "crypto-js";
import {opt} from "ts-interface-checker";

export class ApiManager {
    public static BaseUrl = "https://b7be-180-244-132-141.ngrok-free.app";
    public static encryptionKey = "bad7a50445665cb529f402ad7e78650cd9877725b8499e3597c6125e89f32766";

    public static async getUser(signal: AbortSignal, token: string): Promise<UserInfoResponse> {
        return this.Get<UserInfoResponse>('user/info', signal, token);
    }

    public static async GetChatTopics(signal: AbortSignal, token: string): Promise<ChatTopicResponse> {
        return this.Get<ChatTopicResponse>('assistant/chat/', signal, token);
    }

    public static async CreateChatTopic(signal: AbortSignal, token: string): Promise<NewChatTopicResponse> {
        return this.Post<NewChatTopicResponse>('assistant/chat/', signal, token);
    }

    public static async GetChatMessages(signal: AbortSignal, token: string, id: number): Promise<ChatMessagesResponse> {
        return this.Get<ChatMessagesResponse>(`assistant/chat/${id}/messages`, signal, token);
    }

    public static async SubmitDescription(signal: AbortSignal, token: string, answers: any): Promise<BaseApiResponse> {
        return this.Post('user/skill-info', signal, token, {data: answers});
    }

    public static async GetInterviewQuestions(signal: AbortSignal, token: string): Promise<InterviewQuestionsResponse> {
        return this.Get('user/questions/', signal, token);
    }

    public static async SendInterviewAnswer(signal: AbortSignal, token: string, questionId: number, answer: number): Promise<BaseApiResponse> {
        return this.Post(`user/questions/${questionId}/answer`, signal, token, {data: {answer}});
    }

    private static async Post<T extends BaseApiResponse>(path: string, signal: AbortSignal, token: string = "", options?: AxiosRequestConfig): Promise<T> {
        try {
            let selfOptions: AxiosRequestConfig = {
                headers: {
                    Authorization: `Basic ${ApiManager.Decrypt(token)}`
                },
                method: "POST",
                signal
            }

            if (options) selfOptions = {...selfOptions, ...options};
            const response: AxiosResponse<T["data"]> = await axios(`${this.BaseUrl}/${path}`, selfOptions);

            return {
                statusCode: response.status,
                statusText: response.statusText,
                data: response.data
            } as T;
        } catch (e: any) {
            if (e.name === 'AbortError') return {
                statusCode: 69,
                statusText: "Got Aborted RIP",
                data: {}
            } as T;

            return {
                statusCode: 500,
                statusText: "Internal Server Error",
                data: {}
            } as T;
        }
    }

    private static async Get<T extends BaseApiResponse>(path: string, signal: AbortSignal, token: string = "", options?: AxiosRequestConfig): Promise<T> {
        try {
            let selfOptions: AxiosRequestConfig = {
                headers: {
                    Authorization: `Basic ${ApiManager.Decrypt(token)}`
                },
                signal,
                ...options  // Merge any additional options like params for query strings
            };

            const response: AxiosResponse<T["data"]> = await axios.get(`${this.BaseUrl}/${path}`, selfOptions);

            return {
                statusCode: response.status,
                statusText: response.statusText,
                data: response.data
            } as T;
        } catch (e: any) {
            if (e.name === 'CanceledError') {
                return {
                    statusCode: 69, // Custom status code for aborted requests
                    statusText: "Got Aborted RIP",
                    data: {} as T["data"]  // Empty data
                } as T;
            }

            return {
                statusCode: 500,
                statusText: "Internal Server Error",
                data: {} as T["data"]
            } as T;
        }
    }

    public static Encrypt(text: string): string {
        const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
        const iv = CryptoJS.enc.Utf8.parse(this.encryptionKey);
        const encrypted = CryptoJS.AES.encrypt(text, key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }

    public static Decrypt(text: string): string {
        const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
        const iv = CryptoJS.enc.Utf8.parse(this.encryptionKey);
        const decrypted = CryptoJS.AES.decrypt(text, key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}

export interface BaseApiResponse {
    statusCode: number;
    statusText: string;
    data: any;
}

export interface InterviewAnswerResponse extends BaseApiResponse {
    data: {
        message: string;
    }
}

export interface UserInfoResponse extends BaseApiResponse {
    data: {
        userId: number;
        username: string;
        createdAt: number;
        skillDescription: string;
        doneInterview: boolean;
        interviewQuestionStatus: string;
    }
}

export interface ChatTopicResponse extends BaseApiResponse {
    data: {
        id: number;
        title: string;
    }[]
}

export interface NewChatTopicResponse extends BaseApiResponse {
    data: {
        chatId: number;
    }
}

export interface ChatMessagesResponse extends BaseApiResponse {
    data: {
        id: number;
        role: 'ASSISTANT' | 'USER';
        content: string;
        created_at: number;
    }[]
}

export interface InterviewQuestionsResponse extends BaseApiResponse {
    data: {
        ready: boolean;
        questions: {
            id: number;
            content: string;
            choices: string[];
            userAnswer?: number;
        }[];
    }
}