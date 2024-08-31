'use client'
import {UserInfoResponse} from "@/app/managers/api";
import {Manrope} from "next/font/google";
import Select from 'react-select';
import {Checkbox, CheckboxGroup, Slider, SliderValue} from "@nextui-org/react";
import {Radio, RadioGroup} from "@nextui-org/radio";
import React from "react";
import {getCookie} from "cookies-next";
import {useRouter} from "next/navigation";
import Header from "@/app/components/header";
import {MdOutlineNavigateNext} from "react-icons/md"
import toast from "react-hot-toast";

const programmingLanguages = [
    {value: 'assembly', label: 'Assembly'},
    {value: 'ada', label: 'Ada'},
    {value: 'algol', label: 'ALGOL'},
    {value: 'apl', label: 'APL'},
    {value: 'bash', label: 'Bash'},
    {value: 'basic', label: 'BASIC'},
    {value: 'bcpl', label: 'BCPL'},
    {value: 'c', label: 'C'},
    {value: 'csharp', label: 'C#'},
    {value: 'cpp', label: 'C++'},
    {value: 'clojure', label: 'Clojure'},
    {value: 'cobol', label: 'COBOL'},
    {value: 'coffeescript', label: 'CoffeeScript'},
    {value: 'crystal', label: 'Crystal'},
    {value: 'dart', label: 'Dart'},
    {value: 'delphi', label: 'Delphi'},
    {value: 'elixir', label: 'Elixir'},
    {value: 'elm', label: 'Elm'},
    {value: 'erlang', label: 'Erlang'},
    {value: 'fortran', label: 'Fortran'},
    {value: 'fsharp', label: 'F#'},
    {value: 'go', label: 'Go'},
    {value: 'groovy', label: 'Groovy'},
    {value: 'haskell', label: 'Haskell'},
    {value: 'html', label: 'HTML'},
    {value: 'java', label: 'Java'},
    {value: 'javascript', label: 'JavaScript'},
    {value: 'julia', label: 'Julia'},
    {value: 'kotlin', label: 'Kotlin'},
    {value: 'labview', label: 'LabVIEW'},
    {value: 'lisp', label: 'Lisp'},
    {value: 'lua', label: 'Lua'},
    {value: 'matlab', label: 'MATLAB'},
    {value: 'nim', label: 'Nim'},
    {value: 'objectivec', label: 'Objective-C'},
    {value: 'ocaml', label: 'OCaml'},
    {value: 'pascal', label: 'Pascal'},
    {value: 'perl', label: 'Perl'},
    {value: 'php', label: 'PHP'},
    {value: 'prolog', label: 'Prolog'},
    {value: 'python', label: 'Python'},
    {value: 'r', label: 'R'},
    {value: 'ruby', label: 'Ruby'},
    {value: 'rust', label: 'Rust'},
    {value: 'scala', label: 'Scala'},
    {value: 'scheme', label: 'Scheme'},
    {value: 'shell', label: 'Shell'},
    {value: 'smalltalk', label: 'Smalltalk'},
    {value: 'swift', label: 'Swift'},
    {value: 'tcl', label: 'Tcl'},
    {value: 'typescript', label: 'TypeScript'},
    {value: 'vhdl', label: 'VHDL'},
    {value: 'visualbasic', label: 'Visual Basic'},
    {value: 'zig', label: 'Zig'}
];
const knownFrameworks = [
    // JavaScript/TypeScript Frontend Frameworks
    {value: 'react', label: 'React'},
    {value: 'angular', label: 'Angular'},
    {value: 'vue', label: 'Vue.js'},
    {value: 'svelte', label: 'Svelte'},
    {value: 'nextjs', label: 'Next.js'},
    {value: 'nuxtjs', label: 'Nuxt.js'},

    // JavaScript/TypeScript Backend Frameworks
    {value: 'express', label: 'Express.js'},
    {value: 'nestjs', label: 'NestJS'},
    {value: 'meteor', label: 'Meteor'},
    {value: 'koa', label: 'Koa.js'},

    // Python Frameworks
    {value: 'django', label: 'Django'},
    {value: 'flask', label: 'Flask'},
    {value: 'fastapi', label: 'FastAPI'},
    {value: 'pyramid', label: 'Pyramid'},

    // Java Frameworks
    {value: 'springboot', label: 'Spring Boot'},
    {value: 'hibernate', label: 'Hibernate'},
    {value: 'grails', label: 'Grails'},
    {value: 'struts', label: 'Struts'},

    // PHP Frameworks
    {value: 'laravel', label: 'Laravel'},
    {value: 'symfony', label: 'Symfony'},
    {value: 'zend', label: 'Zend Framework'},
    {value: 'codeigniter', label: 'CodeIgniter'},

    // Ruby Frameworks
    {value: 'rails', label: 'Ruby on Rails'},
    {value: 'sinatra', label: 'Sinatra'},

    // C# Frameworks
    {value: 'aspnetcore', label: 'ASP.NET Core'},
    {value: 'blazor', label: 'Blazor'},

    // C++ Frameworks
    {value: 'qt', label: 'Qt'},
    {value: 'boost', label: 'Boost'},

    // Go Frameworks
    {value: 'gin', label: 'Gin'},
    {value: 'echo', label: 'Echo'},
    {value: 'fiber', label: 'Fiber'},

    // Rust Frameworks
    {value: 'rocket', label: 'Rocket'},
    {value: 'actix', label: 'Actix'},

    // Mobile App Development Frameworks
    {value: 'flutter', label: 'Flutter'},
    {value: 'reactnative', label: 'React Native'},
    {value: 'ionic', label: 'Ionic'},
    {value: 'xamarin', label: 'Xamarin'},

    // CSS Frameworks
    {value: 'bootstrap', label: 'Bootstrap'},
    {value: 'tailwind', label: 'Tailwind CSS'},
    {value: 'foundation', label: 'Foundation'}
];
const commonDatabases = [
    // Relational Databases
    {value: 'mysql', label: 'MySQL'},
    {value: 'postgresql', label: 'PostgreSQL'},
    {value: 'mariadb', label: 'MariaDB'},
    {value: 'oracle', label: 'Oracle Database'},
    {value: 'sqlite', label: 'SQLite'},
    {value: 'mssql', label: 'Microsoft SQL Server'},

    // NoSQL Databases
    {value: 'mongodb', label: 'MongoDB'},
    {value: 'cassandra', label: 'Cassandra'},
    {value: 'couchdb', label: 'CouchDB'},
    {value: 'dynamodb', label: 'DynamoDB'},
    {value: 'neo4j', label: 'Neo4j'},

    // Cloud Databases
    {value: 'firestore', label: 'Firestore'},
    {value: 'rds', label: 'Amazon RDS'},
    {value: 'redshift', label: 'Amazon Redshift'},
    {value: 'bigquery', label: 'Google BigQuery'},
    {value: 'azurecosmosdb', label: 'Azure Cosmos DB'},

    // In-Memory Databases
    {value: 'redis', label: 'Redis'},
    {value: 'memcached', label: 'Memcached'}
];


const questions = [{
    question: "Bahasa pemrograman apa saja yang anda ketahui?",
    id: "knownLanguages",
    answerType: "checkbox",
    checkboxOptions: {
        data: programmingLanguages
    }
}, {
    question: "Seberapa nyaman anda dengan Algorithm dan Data Structure?",
    id: "algoDSComfort",
    answerType: "slider",
    sliderOptions: {
        min: 0,
        max: 4,
        step: 1,
        values: ['sangat tidak nyaman', 'tidak nyaman', 'biasa saja', 'nyaman', 'nyaman sekali']
    }
}, {
    question: "Apakah Anda punya pengalaman algorithm seperti sorting, searching, atau graph algorithm?",
    id: "algoExp",
    answerType: "choices",
    choices: [{
        label: "Ya, saya mempunyai pengalaman algorithm",
        value: "yes"
    }, {
        label: "Tidak, saya tidak mempunyainya",
        value: "no"
    }]
}, {
    question: "Apakah anda menggunakan git sebagai version control? (github, gitlab, gitea, dan lain-lain)",
    id: "useGit",
    answerType: "choices",
    choices: [{
        label: "Ya, saya menggunakan git",
        value: "yes"
    }, {
        label: "Tidak, saya tidak menggunakan git",
        value: "no"
    }]
}, {
    question: "Seberapa sering Anda mengerjakan soal tantangan pemrograman? (seperti leetcode, toki, dan lain-lain)",
    id: "doCodingChalls",
    answerType: "choices",
    choices: [{
        label: "Saya sering mengerjakan",
        value: "often"
    }, {
        label: "Terkadang saya mengerjakannya",
        value: "rare"
    }, {
        label: "Saya tidak pernah mengerjakan soal tantangan",
        value: "never"
    }]
}, {
    question: "Framework mana saja yang anda ketahui dan pernah menggunakannya dari bawah ini?",
    id: "knownFw",
    answerType: "checkbox",
    checkboxOptions: {
        data: knownFrameworks
    }
}, {
    question: "Database apa yang anda ketahui dan pernah menggunakannya?",
    id: "knownDB",
    answerType: "checkbox",
    checkboxOptions: {
        data: commonDatabases
    }
}, {
    // New questions
    question: "Apakah Anda pernah menggunakan metode pengujian seperti unit testing atau integration testing?",
    id: "testingExp",
    answerType: "choices",
    choices: [{
        label: "Ya, saya sering menggunakan testing",
        value: "yes"
    }, {
        label: "Tidak, saya tidak pernah menggunakan testing",
        value: "no"
    }]
}, {
    question: "Seberapa familiar Anda dengan debugging menggunakan tools seperti Chrome DevTools atau GDB?",
    id: "debugFamiliarity",
    answerType: "slider",
    sliderOptions: {
        min: 0,
        max: 4,
        step: 1,
        values: ['sangat tidak familiar', 'tidak familiar', 'biasa saja', 'familiar', 'sangat familiar']
    }
}, {
    question: "Apakah Anda memiliki pengalaman bekerja dalam tim menggunakan tools seperti Jira atau Trello?",
    id: "teamWorkExp",
    answerType: "choices",
    choices: [{
        label: "Ya, saya pernah bekerja dalam tim menggunakan tools tersebut",
        value: "yes"
    }, {
        label: "Tidak, saya belum pernah",
        value: "no"
    }]
}, {
    question: "Seberapa familiar Anda dengan Cloud Computing (seperti AWS, GCP, Azure)?",
    id: "cloudFamiliarity",
    answerType: "slider",
    sliderOptions: {
        min: 0,
        max: 4,
        step: 1,
        values: ['sangat tidak familiar', 'tidak familiar', 'biasa saja', 'familiar', 'sangat familiar']
    }
}, {
    question: "Seberapa sering Anda mengikuti perkembangan teknologi terbaru di dunia pemrograman?",
    id: "techUpdates",
    answerType: "choices",
    choices: [{
        label: "Saya selalu mengikuti perkembangan terbaru",
        value: "often"
    }, {
        label: "Terkadang saya mengikuti perkembangan",
        value: "sometimes"
    }, {
        label: "Saya jarang mengikuti perkembangan teknologi",
        value: "rarely"
    }]
}];


const manrope = Manrope({subsets: ["latin"]});

export default function ChallengeDescription({userData}: { userData: UserInfoResponse['data'] }) {
    const [answers, setAnswers] = React.useState(questions.map((d) => {
        const data = {
            question: d.question,
            id: d.id,
            type: d.answerType,
            value: null as any
        };
        if (d.answerType == "slider") data.value = d.sliderOptions!.min;
        if (d.answerType == "choices") data.value = d.choices![d.choices!.length - 1].value;
        if (d.answerType == "checkbox") data.value = [];

        return data;
    }));
    const [submitting, setSubmitting] = React.useState(false);
    const router = useRouter();
    
    const abort = React.useRef(new AbortController);
    const authorization = getCookie("Authorization");

    async function onSubmit() {
        if (submitting) return;
        setSubmitting(true);

        const {statusCode, data} = await ApiManager.SubmitDescription(abort, authorization, answers);
        if (statusCode !== 200) return // show error toast
        router.push("/challenge/processing");
        
    }
    return <main className={"blue-palette min-w-screen min-h-screen flex flex-col items-center pb-32 " + manrope.style}>
        <div className={"flex flex-col gap-10 mt-10 w-[800px] max-w-[90vw]"}>
            {questions.map((data, index) => {
                const type = data.answerType;

                if (type == "slider") return <div key={index}>
                    <p className={"mb-2"}>{index + 1}. {data.question}</p>
                    <Slider
                        size="md"
                        step={data.sliderOptions!.step}
                        color="foreground"
                        label={"Silahkan geser"}
                        showSteps={true}
                        maxValue={data.sliderOptions!.max}
                        minValue={data.sliderOptions!.min}
                        value={answers[index].value}
                        onChange={(v: any) => {
                            setAnswers(d => {
                                const newAnswers = [...d]; // Create a copy of the array
                                newAnswers[index].value = v; // Update the specific value
                                console.log(newAnswers);
                                return newAnswers; // Return the updated array
                            });
                        }}
                        getValue={(v: SliderValue) => data.sliderOptions!.values![v as number] || v.toString()}
                        className="max-w-md"
                    />
                </div>
                else if (type == "choices") return <div key={index}>
                    <p className={"mb-2"}>{index + 1}. {data.question}</p>
                    <RadioGroup
                        value={answers[index].value}
                        onChange={(v) => setAnswers(d => {
                            const newAnswers = d.map(x => x.id == data.id ? {...x, value: v.target.value} : x);
                            console.log(newAnswers);
                            return newAnswers;
                        })}
                    >
                        {data.choices!.map((x, k) => <Radio key={k} value={x.value}>{x.label}</Radio>)}
                    </RadioGroup>
                </div>
                else if (type == "checkbox") return <div key={index}>
                    <p className={"mb-2"}>{index + 1}. {data.question}</p>
                    <CheckboxGroup
                        orientation={"horizontal"}
                        value={answers.find(x => x.id == data.id)!.value}
                        onValueChange={(v) => setAnswers(d => {
                            const newAnswers = d.map(x => x.id == data.id ? {...x, value: v} : x);
                            console.log(newAnswers);
                            return newAnswers;
                        })}
                    >
                        {data.checkboxOptions!.data.map((x, k) => <Checkbox key={k} value={x.value}>{x.label}</Checkbox>)}
                    </CheckboxGroup>
                </div>
            })}
        </div>
    </main>
}
