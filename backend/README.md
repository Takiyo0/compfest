# Backend

## API Specification

HTTP API for the backend.

### Base API Path
- ```/```

### Header
- Request must contain `Content-Type: application/json` header if it has a json body.
- If authentication is required, request must contain `Authentication: Basic <token>` where `<token>` is received from the `/user/auth-callback` endpoint.

### Common Responses
- If response code is greater than or equal to 400, response body will contain an error message.
    ```ts
    interface ErrorResponse {
      message: string;
    }
    ```
    The error message will be a string that describes the error. The error message can be shown to the user.

### `GET` /user/auth-code
Generates an authentication code for the user. User must be redirected to the `loginUrl` to authenticate.

Response:
```ts
interface AuthResponse {
  loginUrl: string;
  state: string;
}
```

### `GET` /user/auth-callback
Handles the authentication callback. Token must be saved by the client and sent with every request that requires authentication.

Request:
```
/user/auth-callback?code=string&state=string
```

Response `200 OK`:
```ts
interface AuthCallbackResponse {
  token: string;
}
```

### `POST` /user/logout

**[Authentication is required]**

Logs out the user. After this request, the token will be invalid.

Response `200 OK`:
```ts
interface LogoutResponse {
  message: string;
}
```

### `GET` /user/info

**[Authentication is required]**

Retrieves the user's information based on the token.

Response `200 OK`:
```ts
interface UserInfoResponse {
  userId: number;
  username: string;
  createdAt: number;
  skillDescription: string;
  doneInterview: boolean;
  interviewQuestionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'QUESTION_NOT_READY' | 'SUCCESS';
  skillInfo: SkillInfo; // see `POST` /user/skill-info
}
```

### `GET` /user/questions

**[Authentication is required]**

Retrieves the user's interview questions.

Response (if ready = `200 OK`, if not ready = `202 Accepted`):
```ts
interface UserQuestionsResponse {
  ready: boolean;
  questions?: {
    id: number;
    content: string;
    choices: string[];
    userAnswer?: number;
  }[];
}
```

### `POST` /user/questions/:id/answer 

**[Authentication is required]**

Submits the user's answer to an interview question.

Request:
```ts
interface UserAnswerRequest {
  answer: number;
}
```

Response `200 OK`:
```ts
interface UserAnswerResponse {
  message: string;
}
```

### `POST` /user/skill-description 

**[Authentication is required]**

Updates the user's skill description.

Request:
```ts
interface SkillDescriptionRequest {
  description: string;
}
```

Response `200 OK`:
```ts
interface SkillDescriptionResponse {
  message: string;
}
```

### `POST` /user/skill-info
**[Authentication is required]**

Updates the user's skill info.

Request:
```ts
interface SkillInfo {
    knownLanguages: string[];
    algoDSComfort: number;
    algoExp: boolean;
    useGit: boolean;
    doCodingChalls: boolean;
    knownFw: string[];
    feExp: boolean;
    beExp: boolean;
    fsProficiency: number;
    knownDB: string[];
    testingExp: boolean;
    debugFamiliarity: number;
    teamWorkExp: boolean;
    cloudFamiliarity: number;
    techUpdates: boolean;
}
```

Response `200 OK`:
```ts
interface SkillInfoUpdateResponse {
  message: string;
}
```

### `POST` /assistant/chat
**[Authentication is required]**

Create a new chat conversation with the assistant.

Response:
```ts
interface CreateChatResponse {
  chatId: number;
}
```

### `GET` /assistant/chat/:chatId/prompt?prompt=string&_sseToken=string

Send a message to the assistant.

Response:
```
data: {"content": "string"}

data: {"content": "string"}

data: {"content": "string"}

data: {"content": "string"}

...
```

Response is a stream of messages from the assistant. Each message is a JSON object with a `content` field. Each message is separated by a double newline character. This method is also used by ChatGPT to send messages to the user.

### `GET` /assistant/chat/:chatId/messages
**[Authentication is required]**

Get all messages in a chat conversation.

Response:
```ts
// array of ChatMessage
interface ChatMessage {
  id: number;
  role: 'ASSISTANT' | 'USER';
  content: string;
  createdAt: number;
}
```

### `GET` /assistant/chat/
**[Authentication is required]**

Get all chat conversations.

Response:
```ts
// array of ChatConversation
interface ChatConversation {
  id: number;
  title: string;
}
```