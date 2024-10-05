import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import CryptoJS from "crypto-js";
import {opt} from "ts-interface-checker";
import {Base} from "postcss-selector-parser";

export class ApiManager {
    public static BaseUrl = "https://api-aic.kuduga.com";
    // public static BaseUrl = "http://localhost:8085";
    public static encryptionKey = "bad7a50445665cb529f402ad7e78650cd9877725b8499e3597c6125e89f32766";

    public static async GetOauthCode() {
        return this.Get<OauthCodeResponse>('user/auth-code');
    }

    public static async SendOauthCode(code: string, state: string) {
        return this.Get<OauthCallbackResponse>(`user/auth-callback?code=${code}&state=${state}`);
    }

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

    public static async SubmitInterview(signal: AbortSignal, token: string): Promise<BaseApiResponse> {
        return this.Post('user/submit-interview', signal, token);
    }

    public static async SubmitTreeQuestion(signal: AbortSignal, token: string, questionId: string): Promise<BaseApiResponse> {
        return this.Post(`tree/${questionId}/finish`, signal, token);
    }

    public static async SendInterviewAnswer(signal: AbortSignal, token: string, questionId: number, answer: number): Promise<BaseApiResponse> {
        return this.Post(`user/questions/${questionId}/answer`, signal, token, {data: {answer}});
    }

    public static async SendTreeQuestionAnswer(signal: AbortSignal, token: string, questionId: number, answer: number): Promise<BaseApiResponse> {
        return this.Post
        (`tree/${questionId}/answer-question`, signal, token, {data: {questionId: questionId, answer}});
    }

    public static async GetTree(signal: AbortSignal, token: string): Promise<TreeResponse> {
        return this.Get<TreeResponse>('tree/', signal, token);
    }

    public static async GetTreeQuestions(signal: AbortSignal, token: string, id: number) {
        return this.Get<TreeQuestionsResponse>(`tree/${id}/questions`, signal, token);
    }

    public static async GetTreeEntryContent(signal: AbortSignal, token: string, treeId: number, entryId: number) {
        return this.Get<TreeEntryResponse>(`tree/${treeId}/content?entryId=${entryId}`, signal, token);
    }

    public static async GetAnsweredQuestions(signal: AbortSignal, token: string) {
        return this.Get<AnsweredQuestionsResponse>('tree/archive', signal, token);
    }

    public static async GetCurrentEvent(signal: AbortSignal, token: string) {
        return this.Get<CurrentEventResponse>(`challenge/current/info`, signal, token);
    }

    public static async GetGroups(signal: AbortSignal, token: string) {
        return this.Get<GroupListResponse>(`challenge/group/`, signal, token);
    }

    public static async GetGroup(signal: AbortSignal, token: string, id: number) {
        return this.Get<GroupResponse>(`challenge/group/${id}`, signal, token);
    }

    public static async GetTopic(signal: AbortSignal, token: string, id: number) {
        return this.Get<TopicResponse>(`challenge/topic/${id}/info`, signal, token);
    }


    public static async StartNewSession(signal: AbortSignal, token: string, id: number) {
        return this.Post<NewSessionResponse>(`challenge/topic/${id}/start-session`, signal, token);
    }

    public static async GetQuestion(signal: AbortSignal, token: string, topicId: number, questionId: number, sessionId: number) {
        return this.Post<WeeklyQuestionResponse>(`challenge/topic/${topicId}/question/${questionId}`, signal, token, {
            data: {sessionId}
        });
    }

    public static async SendQuestionAnswer(signal: AbortSignal, token: string, topicId: number, sessionId: number, answer: number, questionId: number) {
        return this.Post<WeeklyQuestionResponse>(`challenge/topic/${topicId}/answer-question`, signal, token, {
            data: {answer, sessionId, questionId}
        });
    }

    public static async SubmitQuestion(signal: AbortSignal, token: string, topicId: number, sessionId: number) {
        return this.Post<WeeklyQuestionResponse>(`challenge/topic/${topicId}/finish`, signal, token, {
            data: {sessionId}
        });
    }

    private static async Post<T extends BaseApiResponse>(path: string, signal?: AbortSignal, token: string = "", options?: AxiosRequestConfig): Promise<T> {
        let errorData;
        try {
            let selfOptions: AxiosRequestConfig = {
                headers: {
                    Authorization: `Basic ${ApiManager.Decrypt(token)}`
                },
                method: "POST",
                signal
            }

            if (options) selfOptions = {...selfOptions, ...options};
            const response: AxiosResponse<T["data"]> = await axios(`${this.BaseUrl}/${path}`, selfOptions).catch((e) => {
                errorData = e.response.data;
                throw e
            });

            return {
                statusCode: response.status,
                statusText: response.statusText,
                data: response.data
            } as T;
        } catch (e: any) {
            console.error(e);
            if (e.name === 'AbortError') return {
                statusCode: 69,
                statusText: "Got Aborted RIP",
                data: {}
            } as T;

            return {
                statusCode: 500,
                statusText: "Internal Server Error",
                data: errorData ?? {} as T["data"]
            } as T;
        }
    }

    private static async Get<T extends BaseApiResponse>(path: string, signal?: AbortSignal, token: string = "", options?: AxiosRequestConfig): Promise<T> {
        let errorData;
        try {
            let selfOptions: AxiosRequestConfig = {
                headers: {
                    Authorization: `Basic ${ApiManager.Decrypt(token)}`
                },
                signal,
                ...options  // Merge any additional options like params for query strings
            };

            const response: AxiosResponse<T["data"]> = await axios.get(`${this.BaseUrl}/${path}`, selfOptions).catch((e) => {
                errorData = e.response.data;
                throw e
            });

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
                data: errorData ?? {} as T["data"]
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

export interface NewSessionResponse extends BaseApiResponse {
    data: {
        hasStarted: boolean;
        session: TopicSession;
    }
}

export interface WeeklyQuestionResponse extends BaseApiResponse {
    data: {
        choices: string;
        content: string;
        point: number;
        userAnswer?: number;
        questionIds: number[];
        userAnswered: number[];
        id: number;
        serverTime: number;
        firstAccessTime: number;
        answerTime: number;
        questionsWaiting: number[];
        isFinished: boolean;
        score: number;
        sessionFinished: number;
        explanation: string;
        correctAnswer: number;
    }
}

export interface TopicResponse extends BaseApiResponse {
    data: {
        challengeId: number;
        description: string;
        difficulty: "EASY" | "MEDIUM" | "HARD";
        id: number;
        language: string;
        name: string;
        sessions: TopicSession[];
        firstQuestionId: number;
        totalQuestions: number;
    }
}

export interface TopicSession {
    Id: number;
    UserId: number;
    QuestionId: number;
    ChallengeId: number;
    GroupId: number;
    Attempt: number;
    State: string;
    IsLatest: boolean;
    Score: number;
    StartedAt: number;
    FinishedAt: number;
}

export interface AnsweredQuestionsResponse extends BaseApiResponse {
    data: {
        treeId: number;
        treeTitle: string;
        totalQuestions: number;
    }[]
}

export interface GroupListResponse extends BaseApiResponse {
    data: {
        Id: number;
        Name: string;
        Description: string;
        Members: GroupListMember[];
        CreatedAt: number;
    }[]
}

export interface GroupListMember {
    Id: number;
    GroupId: number;
    UserId: number;
    IsLeader: boolean;
}

export interface DetailedGroupMember extends GroupListMember {
    Username: string;
    pointsThisWeek: number;
    QuestionsDone: number[];
}

export interface GroupResponse extends BaseApiResponse {
    data: {
        createdAt: number;
        currentUserPosition: number;
        description: string;
        id: number;
        leaderboard: Leaderboard[];
        members: DetailedGroupMember[];
        name: string;
    }
}

export interface Leaderboard {
    Id: number;
    Name: string;
    UserId: number;
    ChallengeId: number;
    Score: number;
    Languages: any;
    QuestionIds: number[];
}

export interface CurrentEventResponse extends BaseApiResponse {
    data: {
        currentUserPosition: number;
        isReady: boolean;
        leaderboard: Leaderboard[];
        serverTime: string;
        topics: EventTopic[];
        userDone: number;
        userPoints: number;
        week: number;
    }
}

export interface EventTopic {
    Id: number;
    TopicId: number;
    ChallengeId: number;
    Name: string;
    Description: string;
    Language: string;
    Difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface InterviewAnswerResponse extends BaseApiResponse {
    data: {
        message: string;
    }
}

export interface OauthCodeResponse extends BaseApiResponse {
    data: {
        loginUrl: string;
        state: string;
    }
}

export interface OauthCallbackResponse extends BaseApiResponse {
    data: {
        token: string;
    }
}

export interface UserInfoResponse extends BaseApiResponse {
    data: {
        userId: number;
        username: string;
        createdAt: number;
        skillDescription: string;
        doneInterview: boolean;
        filledSkillInfo: boolean;
        interviewQuestionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'QUESTION_NOT_READY' | 'SUCCESS';
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

            correctAnswer?: number;
            answerExplanation?: string;
        }[];
    }
}

export interface TreeResponse extends BaseApiResponse {
    data: {
        ready: boolean;
        skillTree: {
            id: number;
            isRoot: boolean;
            name: string;
            entries: {
                id: number;
                title: string;
                description: string;
            }[];
            finished: boolean;
            child: number[];
        }[];
    }
}

export interface TreeQuestionsResponse extends BaseApiResponse {
    data: {
        ready: boolean;
        questions?: {
            id: number;
            content: string;
            choices: string[];
            userAnswer?: number;

            // if skillTree.finished = true
            correctAnswer?: number;
            answerExplanation?: string;
        }[];
    }
}

export interface TreeEntryResponse extends BaseApiResponse {
    data: {
        ready: boolean;
        entryId: number;
        content?: string;
    }
}