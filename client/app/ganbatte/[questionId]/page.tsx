import {getCookie} from "cookies-next";
import {cookies} from "next/headers";
import {ApiManager} from "@/app/managers/api";
import {redirect, useParams} from "next/navigation";
import ErrorPage from "@/app/components/pages/ErrorPage";
import GanbattePage from "@/app/ganbatte/[questionId]/ganbatte";

const sampleData = {
    ready: true,
    questions: [
        {
            id: 1,
            content: "What is the output of the following JavaScript code?\n\n```js\nconsole.log(2 + '2');\n```",
            choices: [
                "22",
                "4",
                "NaN",
                "undefined"
            ],
            correctAnswer: 0,
            answerExplanation: "In JavaScript, the `+` operator when used with a number and a string performs **string concatenation**, so `2 + '2'` results in `'22'`."
        },
        {
            id: 2,
            content: "Which of the following are valid HTTP methods?\n\n1. `GET`\n2. `POST`\n3. `PULL`\n4. `UPDATE`",
            choices: [
                "1 and 2",
                "2 and 4",
                "1, 2, and 4",
                "All of the above"
            ],
            correctAnswer: 2,
            answerExplanation: "`GET`, `POST`, and `UPDATE` are valid HTTP methods. `PULL` is not a valid HTTP method."
        },
        {
            id: 3,
            content: "Which sorting algorithm has the best average-case time complexity?\n\n```text\nA. Merge Sort\nB. Quick Sort\nC. Bubble Sort\nD. Insertion Sort\n```",
            choices: [
                "A",
                "B",
                "C",
                "D"
            ],
            correctAnswer: 0,
            answerExplanation: "Merge Sort has an average-case time complexity of `O(n log n)`, which is better than Bubble Sort and Insertion Sort. Quick Sort can degrade to `O(n^2)` in some cases."
        },
        {
            id: 4,
            content: "In React, what is the purpose of `useEffect` hook?",
            choices: [
                "It directly manipulates the DOM",
                "It runs side effects in a functional component",
                "It forces a component to re-render",
                "It manages state in a component"
            ],
            correctAnswer: 1,
            answerExplanation: "`useEffect` is used to run **side effects** such as data fetching, subscriptions, or manually changing the DOM outside of React."
        },
        {
            id: 5,
            content: "What does SQL stand for?",
            choices: [
                "Structured Query Language",
                "Simple Query Language",
                "Sample Query Language",
                "System Query Language"
            ],
            correctAnswer: 0,
            answerExplanation: "SQL stands for **Structured Query Language** and is used to communicate with databases."
        },
        {
            id: 6,
            content: "What is the difference between `==` and `===` in JavaScript?",
            choices: [
                "`==` compares values and `===` compares both value and type",
                "`===` compares values and `==` compares both value and type",
                "Both compare only values",
                "Both compare value and type"
            ],
            correctAnswer: 0,
            answerExplanation: "The `==` operator performs **type coercion**, meaning it converts the values to the same type before comparing, while `===` compares both value and type directly."
        },
        {
            id: 7,
            content: "Which of the following is a JavaScript library for building user interfaces?",
            choices: [
                "Vue.js",
                "React",
                "Angular",
                "Node.js"
            ],
            correctAnswer: 1,
            answerExplanation: "**React** is a JavaScript library used to build user interfaces. Vue.js and Angular are frameworks, while Node.js is a runtime."
        },
        {
            id: 8,
            content: "What does REST stand for?",
            choices: [
                "Representational State Transfer",
                "Representational System Transport",
                "Remote System Transfer",
                "Remote Service Transport"
            ],
            correctAnswer: 0,
            answerExplanation: "REST stands for **Representational State Transfer**, a set of principles used to design networked applications."
        },
        {
            id: 9,
            content: "Which one is NOT a programming paradigm?\n\n1. Object-oriented programming\n2. Functional programming\n3. Procedural programming\n4. Reactive programming",
            choices: [
                "All are paradigms",
                "Object-oriented programming",
                "Functional programming",
                "Procedural programming"
            ],
            correctAnswer: 0,
            answerExplanation: "All listed paradigms are valid. Object-oriented, functional, procedural, and reactive programming are recognized programming paradigms."
        },
        {
            id: 10,
            content: "In Git, what is the purpose of the `git rebase` command?",
            choices: [
                "It combines multiple commits into one",
                "It moves or combines a sequence of commits to a new base commit",
                "It creates a new branch",
                "It deletes the commit history"
            ],
            correctAnswer: 1,
            answerExplanation: "`git rebase` is used to **move or combine commits** from one branch to another and update the base of the branch."
        },
        {
            id: 11,
            content: "In CSS, which property is used to change the text color of an element?",
            choices: [
                "font-color",
                "text-color",
                "color",
                "background-color"
            ],
            correctAnswer: 2,
            answerExplanation: "The `color` property is used to change the text color of an element."
        },
        {
            id: 12,
            content: "In Python, what does `len()` do?",
            choices: [
                "Returns the number of characters in a string",
                "Returns the length of a list or any iterable",
                "Returns the size of an integer",
                "Returns the number of elements in a dictionary"
            ],
            correctAnswer: 1,
            answerExplanation: "`len()` in Python returns the **length of any iterable**, such as strings, lists, tuples, or dictionaries."
        },
        {
            id: 13,
            content: "What does a `Promise` represent in JavaScript?",
            choices: [
                "An object that represents an asynchronous operation",
                "A callback function",
                "A function that executes immediately",
                "An event listener"
            ],
            correctAnswer: 0,
            answerExplanation: "A `Promise` is an object that represents the eventual completion or failure of an asynchronous operation."
        },
        {
            id: 14,
            content: "Which data structure uses LIFO (Last In, First Out) principle?",
            choices: [
                "Queue",
                "Stack",
                "Array",
                "Linked List"
            ],
            correctAnswer: 1,
            answerExplanation: "**Stack** follows the LIFO principle, where the last item added is the first one to be removed."
        },
        {
            id: 15,
            content: "How do you define a function in Python?\n\n```python\ndef my_function():\n    pass\n```",
            choices: [
                "`function my_function()`",
                "`def my_function():`",
                "`function = my_function()`",
                "`func my_function()`"
            ],
            correctAnswer: 1,
            answerExplanation: "In Python, functions are defined using the `def` keyword, as in `def my_function():`."
        }
    ]
};


export default async function Page({
                                       params
                                   }: {
    params: { [key: string]: string | string[] | undefined };
}) {
    const questionId = params?.questionId;

    const authorization = getCookie("Authorization", {cookies});
    const abort = new AbortController();

    if (Number.isNaN(questionId)) return;

    const {data: user, statusCode} = await ApiManager.getUser(abort.signal, authorization ?? "");
    if (statusCode != 200 || !user.userId) return redirect("/login");
    if (!user.filledSkillInfo || (user.filledSkillInfo && user.interviewQuestionStatus != 'SUCCESS')) return redirect("/challenge/interview");

    const {data} = await ApiManager.GetTreeQuestions(abort.signal, authorization ?? "", Number(questionId));
    return <GanbattePage userData={user} questions={data} questionId={Number(questionId)}/>
}
