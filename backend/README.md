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

### `POST` /user/auth-callback
Handles the authentication callback. Token must be saved by the client and sent with every request that requires authentication.

Request:
```ts
interface AuthCallbackRequest {
  code: string;
  state: string;
}
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

### `GET` /user/skill-description 

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