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
    
    // if user.doneInterview = true
    correctAnswer?: number;
    answerExplanation?: string;
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

### `POST` /user/submit-interview
**[Authentication is required]**

Marks the user's interview as complete.

Response `200 OK`:
```ts
interface SubmitInterviewResponse {
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
    role: "FRONTEND" | "BACKEND" | "FULLSTACK";
    roleLanguages: string[];
    languagesToLearn: string[];
    toolsToLearn: string[];
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


### `GET` /tree
**[Authentication is required]**

Get the tree structure of the user's skill tree.

Response:
```ts
interface Tree {
    ready: boolean;
    skillTree: {
        id: number;
        isRoot: boolean;
        name: string;
        entries: {
            title: string;
            description: string;
        }[];
        finished: boolean;
        child: int[];
    }[];
}
```

### `GET` /tree/:id/questions
**[Authentication is required]**

Get the tree structure of the user's skill tree.

Response:
```ts
interface Tree {
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
```


### `POST` /tree/:id/answer-question
**[Authentication is required]**

Answer the questions in the skill tree entry.

Request:
```ts
interface AnswerQuestions {
    questionId: number;
    answer: number;
}
```

Response:
```ts
interface AnswerQuestions {
    message: string;
}
```

### `GET` /tree/:id/content?entry=id
**[Authentication is required]**

Get the content of the skill tree entry.

Response:
```ts
interface LearnContent {
    ready: boolean;
    entryId: number;
    content?: string;
}
```

### `GET` /tree/archive
**[Authentication is required]**
 
Get all questions in the finished skill tree.

Response:
```ts
interface Archive {
    questions?: {
        id: number;
        content: string;
        choices: string[];
        userAnswer?: number;
        correctAnswer: number;
        answerExplanation: string;
    }[];
}
```

### `POST` /tree/:id/finish
**[Authentication is required]**

Finish the skill tree.

Response:
```ts
interface FinishTree {
    message: string;
}
```

### `POST` /tree/archive
**[Authentication is required]**

Get all questions in the finished skill tree.

Response:
```ts
interface Archive {
    questions?: {
        id: number;
        content: string;
        choices: string[];
        userAnswer?: number;
        correctAnswer: number;
        answerExplanation: string;
    }[];
}
```