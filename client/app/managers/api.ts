import axios from "axios";
import CryptoJS from "crypto-js";

export class ApiManager {
    public static BaseUrl = "https://367c-180-244-132-226.ngrok-free.app";
    public static encryptionKey = "bad7a50445665cb529f402ad7e78650cd9877725b8499e3597c6125e89f32766";

    public static async getUser(token: string): Promise<UserInfoResponse> {
        try {
            const response = await axios.get(`${this.BaseUrl}/user/info`, {
                headers: {
                    Authorization: `Basic ${ApiManager.Decrypt(token)}`
                }
            });

            return {
                statusCode: response.status,
                statusText: response.statusText,
                data: response.data
            }
        } catch (e) {
            return {
                statusCode: 500,
                statusText: "Internal Server Error",
                data: {} as any
            }
        }
    }

    public static async GetChatTopics(signal: AbortSignal, token: string): Promise<ChatTopicResponse> {
        try {
            const response = await axios.get(`${this.BaseUrl}/assistant/chat/`, {
                headers: {
                    Authorization: `Basic ${ApiManager.Decrypt(token)}`
                },
                signal
            });

            return {
                statusCode: response.status,
                statusText: response.statusText,
                data: response.data
            }
        } catch (e) {
            return {
                statusCode: 500,
                statusText: "Internal Server Error",
                data: []
            }
        }
    }


    public static async GetChatMessages(signal: AbortSignal, token: string, id: number): Promise<ChatMessagesResponse> {
        try {
            const response = await axios.get(`${this.BaseUrl}/assistant/chat/${id}/messages`, {
                headers: {
                    Authorization: `Basic ${ApiManager.Decrypt(token)}`
                },
                signal
            });

            return {
                statusCode: response.status,
                statusText: response.statusText,
                data: response.data
            }
        } catch (e) {
            return {
                statusCode: 500,
                statusText: "Internal Server Error",
                data: []
            }
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

interface BaseApiResponse {
    statusCode: number;
    statusText: string;
    data: any;
}

interface UserInfoResponse extends BaseApiResponse {
    data: {
        userId: number;
        username: string;
        createdAt: number;
        skillDescription: string;
    }
}

interface ChatTopicResponse extends BaseApiResponse {
    data: {
        id: number;
        title: string;
    }[]
}

interface ChatMessagesResponse extends BaseApiResponse {
    data: {
        id: number;
        role: 'ASSISTANT' | 'USER';
        content: string;
        created_at: number;
    }[]
}
