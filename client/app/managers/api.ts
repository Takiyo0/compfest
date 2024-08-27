import axios from "axios";
import CryptoJS from "crypto-js";

export class ApiManager {
    public static BaseUrl = "http://localhost:3020";
    public static encryptionKey = "bad7a50445665cb529f402ad7e78650cd9877725b8499e3597c6125e89f32766";

    public static async getUser(token: string): Promise<UserInfoResponse> {
        try {
            const response = await axios.get(`${this.BaseUrl}/user/info`, {
                headers: {
                    Authorization: `Bearer ${ApiManager.Decrypt(token)}`
                },
                /**
                 * This function is a callback function that is used to validate the HTTP status code of the response.
                 * It will always return true, which means that no matter what the status code is, the response will be considered valid.
                 *
                 * @return {boolean} Returns true always.
                 */
                validateStatus: (): boolean => true // Always consider the response as valid.
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

    private static Encrypt(text: string): string {
        const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
        const iv = CryptoJS.enc.Utf8.parse(this.encryptionKey);
        const encrypted = CryptoJS.AES.encrypt(text, key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    }

    private static Decrypt(text: string): string {
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