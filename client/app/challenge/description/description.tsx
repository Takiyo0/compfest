'use client'
import {ApiManager, UserInfoResponse} from "@/app/managers/api";
import {Manrope} from "next/font/google";
import Select from 'react-select';
import {Button, Checkbox, CheckboxGroup, cn, Slider, SliderValue} from "@nextui-org/react";
import {Radio, RadioGroup} from "@nextui-org/radio";
import React from "react";
import {getCookie} from "cookies-next";
import {useRouter} from "next/navigation";
import Header from "@/app/components/header";
import {MdOutlineNavigateBefore, MdOutlineNavigateNext} from "react-icons/md"
import toast from "react-hot-toast";
import Footer from "@/app/components/footer";
import {motion, AnimatePresence} from "framer-motion";
import {Image} from "@nextui-org/image";

const topLanguages = [
    {
        language: "JavaScript",
        description: "Bahasa pemrograman untuk pengembangan web dan aplikasi berbasis web.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg"
    },
    {
        language: "Python",
        description: "Bahasa yang serbaguna dan mudah dipelajari, populer untuk pengembangan web, data science, dan AI.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg"
    },
    {
        language: "Java",
        description: "Bahasa yang banyak digunakan untuk pengembangan aplikasi skala besar dan Android.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg"
    },
    {
        language: "C++",
        description: "Bahasa pemrograman dengan performa tinggi yang digunakan untuk aplikasi sistem dan game.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg"
    },
    {
        language: "C#",
        description: "Bahasa yang dikembangkan oleh Microsoft, sering digunakan dalam pengembangan aplikasi desktop dan game.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/csharp/csharp-original.svg"
    },
    {
        language: "PHP",
        description: "Bahasa pemrograman server-side yang banyak digunakan untuk pengembangan web dinamis.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/php/php-original.svg"
    },
    {
        language: "TypeScript",
        description: "Bahasa pemrograman berbasis JavaScript dengan penambahan fitur tipe statis.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg"
    },
    {
        language: "Ruby",
        description: "Bahasa yang fokus pada kesederhanaan dan produktivitas, populer untuk pengembangan web dengan Rails.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/ruby/ruby-original.svg"
    },
    {
        language: "Go",
        description: "Bahasa yang cepat dan efisien untuk pengembangan sistem yang mendukung concurrency tinggi.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg"
    },
    {
        language: "Swift",
        description: "Bahasa yang dikembangkan oleh Apple untuk pengembangan aplikasi iOS dan macOS.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/swift/swift-original.svg"
    },
    {
        language: "Rust",
        description: "Bahasa yang fokus pada performa tinggi dan keamanan memori, sering digunakan dalam pengembangan sistem.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-plain.svg"
    },
    {
        language: "Kotlin",
        description: "Bahasa modern yang digunakan untuk pengembangan aplikasi Android, sering digunakan bersama Java.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/kotlin/kotlin-original.svg"
    },
    {
        language: "Dart",
        description: "Bahasa pemrograman yang digunakan dalam framework Flutter untuk aplikasi lintas platform.",
        logoUrl: "https://www.vectorlogo.zone/logos/dartlang/dartlang-icon.svg"
    },
    {
        language: "Perl",
        description: "Bahasa yang fleksibel dan sering digunakan untuk scripting dan pengelolaan sistem.",
        logoUrl: "https://www.vectorlogo.zone/logos/perl/perl-icon.svg"
    },
    {
        language: "Scala",
        description: "Bahasa yang menggabungkan konsep pemrograman fungsional dan berorientasi objek.",
        logoUrl: "https://www.vectorlogo.zone/logos/scala-lang/scala-lang-icon.svg"
    },
    {
        language: "Elixir",
        description: "Bahasa pemrograman yang digunakan untuk aplikasi yang mendukung concurrency besar, seperti sistem telekomunikasi.",
        logoUrl: "https://www.vectorlogo.zone/logos/elixir-lang/elixir-lang-icon.svg"
    },
    {
        language: "Haskell",
        description: "Bahasa fungsional yang kuat, sering digunakan dalam pemrograman akademik dan penelitian.",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Haskell-Logo.svg"
    },
    {
        language: "R",
        description: "Bahasa pemrograman untuk statistik dan analisis data, sering digunakan dalam data science.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/r/r-original.svg"
    },
    {
        language: "Lua",
        description: "Bahasa pemrograman yang ringan dan sering digunakan dalam pengembangan game dan scripting.",
        logoUrl: "https://www.vectorlogo.zone/logos/lua/lua-icon.svg"
    },
    {
        language: "Shell",
        description: "Bahasa scripting yang digunakan untuk otomatisasi tugas sistem operasi di lingkungan Unix/Linux.",
        logoUrl: "https://www.vectorlogo.zone/logos/gnu_bash/gnu_bash-icon.svg"
    },
    {
        language: "MySQL",
        description: "Sistem manajemen basis data relasional yang populer dan open-source.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original-wordmark.svg"
    },
    {
        language: "PostgreSQL",
        description: "Sistem manajemen basis data relasional canggih yang mendukung SQL dan JSON.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original-wordmark.svg"
    },
    {
        language: "MongoDB",
        description: "Basis data NoSQL yang menyimpan data dalam format dokumen berbasis JSON.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original-wordmark.svg"
    },
    {
        language: "Cassandra",
        description: "Sistem manajemen basis data NoSQL yang terdistribusi dan skalabel.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/cassandra/cassandra-original.svg"
    },
    {
        language: "Redis",
        description: "Basis data NoSQL yang berbasis memori, sering digunakan untuk caching dan sesi pengguna.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/redis/redis-original-wordmark.svg"
    },
    {
        language: "Firebase",
        description: "Basis data NoSQL yang digunakan untuk aplikasi seluler dan web, dengan integrasi real-time.",
        logoUrl: "https://www.vectorlogo.zone/logos/firebase/firebase-icon.svg"
    },
    {
        language: "CouchDB",
        description: "Basis data NoSQL yang menyimpan data sebagai dokumen JSON dengan replikasi terdistribusi.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/couchdb/couchdb-original-wordmark.svg"
    },
    {
        language: "Neo4j",
        description: "Basis data graf yang digunakan untuk mengelola data yang terhubung erat, seperti jejaring sosial.",
        logoUrl: "https://www.vectorlogo.zone/logos/neo4j/neo4j-icon.svg"
    },
    {
        language: "CockroachDB",
        description: "Basis data SQL terdistribusi yang mendukung replikasi otomatis dan toleransi kegagalan.",
        logoUrl: "https://www.vectorlogo.zone/logos/cockroachdb/cockroachdb-icon.svg"
    },
    {
        language: "MariaDB",
        description: "Fork dari MySQL, basis data relasional yang kompatibel dengan MySQL dan open-source.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/mariadb/mariadb-original-wordmark.svg"
    },
    {
        language: "InfluxDB",
        description: "Basis data waktu-seri untuk menyimpan data berdasarkan waktu, sering digunakan untuk IoT dan DevOps.",
        logoUrl: "https://www.vectorlogo.zone/logos/influxdata/influxdata-icon.svg"
    }
];

const topTools = [
    {
        tool: "Git",
        description: "Sistem kontrol versi yang digunakan untuk melacak perubahan dalam kode sumber.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original-wordmark.svg"
    },
    {
        tool: "Docker",
        description: "Platform untuk mengembangkan, mengirimkan, dan menjalankan aplikasi dalam kontainer.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original-wordmark.svg"
    },
    {
        tool: "Prometheus",
        description: "Sistem monitoring dan alerting yang mengumpulkan dan menyimpan metrik sebagai data waktu-seri.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/prometheus/prometheus-original.svg"
    },
    {
        tool: "Elasticsearch",
        description: "Sistem pencarian dan analisis yang mendukung pencarian teks dan analitik data besar.",
        logoUrl: "https://www.vectorlogo.zone/logos/elastic/elastic-icon.svg"
    },
    {
        tool: "Kubernetes",
        description: "Sistem orkestrasi untuk otomatisasi penyebaran, penskalaan, dan pengelolaan aplikasi kontainer.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/kubernetes/kubernetes-plain.svg"
    },
    {
        tool: "Jenkins",
        description: "Server otomatisasi open-source untuk mengotomatiskan bagian dari pengembangan perangkat lunak.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/jenkins/jenkins-original.svg"
    },
    {
        tool: "Terraform",
        description: "Alat untuk membangun, mengubah, dan versi infrastruktur dengan aman dan efisien.",
        logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/terraform/terraform-original.svg"
    }
];

const flyUp = (delay: number) => ({
    hidden: {
        opacity: 0,
        bottom: -50
    },
    show: {
        opacity: 1,
        bottom: 0,
        transition: {
            duration: 2,
            ease: [0.6, 0.05, 0.1, 0.9],
            delay
        }
    }
})

const topFrameworks = [
    // Front-End Frameworks
    [
        {
            framework: "React",
            language: "JavaScript",
            description: "Library UI yang cepat dan fleksibel",
            logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg"
        },
        {
            framework: "Vue.js",
            language: "JavaScript",
            description: "Framework progresif untuk membangun antarmuka",
            logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/vuejs/vuejs-original-wordmark.svg"
        },
        {
            framework: "Angular",
            language: "JavaScript",
            description: "Framework untuk aplikasi web dengan skala besar",
            logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/angularjs/angularjs-original.svg"
        },
        {
            framework: "Svelte",
            language: "JavaScript",
            description: "Framework baru tanpa virtual DOM",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Svelte_Logo.svg"
        },
        {
            framework: "Flutter",
            language: "Dart",
            description: "Framework UI untuk aplikasi lintas platform",
            logoUrl: "https://www.vectorlogo.zone/logos/flutterio/flutterio-icon.svg"
        },
        {
            framework: "Ember.js",
            language: "JavaScript",
            description: "Framework untuk aplikasi web ambisius",
            logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/ember/ember-original-wordmark.svg"
        },
        {
            framework: "Preact",
            language: "JavaScript",
            description: "Alternatif React yang lebih ringan",
            logoUrl: "https://cdn.worldvectorlogo.com/logos/preact.svg"
        },
        {
            framework: "Next.js",
            language: "JavaScript",
            description: "Framework untuk aplikasi React dengan rendering server-side",
            logoUrl: "https://cdn.worldvectorlogo.com/logos/nextjs-2.svg"
        },
        {
            framework: "Qt",
            language: "C++",
            description: "Toolkit untuk pengembangan aplikasi grafis",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Qt_logo_2016.svg"
        },
        {
            framework: "Lit",
            language: "JavaScript",
            description: "Framework ringan untuk web components",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Lit_Logo.svg/120px-Lit_Logo.svg.png"
        }
    ],

    // Back-End Frameworks
    [
        {
            framework: "Express.js",
            language: "JavaScript",
            description: "Framework minimalis untuk aplikasi Node.js",
            logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original-wordmark.svg"
        },
        {
            framework: "Django",
            language: "Python",
            description: "Framework tingkat tinggi untuk pengembangan web cepat",
            logoUrl: "https://cdn.worldvectorlogo.com/logos/django.svg"
        },
        {
            framework: "Flask",
            language: "Python",
            description: "Framework ringan untuk pengembangan web",
            logoUrl: "https://www.vectorlogo.zone/logos/pocoo_flask/pocoo_flask-icon.svg"
        },
        {
            framework: "Ruby on Rails",
            language: "Ruby",
            description: "Framework penuh fitur untuk pengembangan aplikasi web",
            logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/rails/rails-original-wordmark.svg"
        },
        {
            framework: "Spring Boot",
            language: "Java",
            description: "Framework untuk aplikasi Java yang cepat dan mudah",
            logoUrl: "https://www.vectorlogo.zone/logos/springio/springio-icon.svg"
        },
        {
            framework: "Laravel",
            language: "PHP",
            description: "Framework elegan untuk pengembangan web PHP",
            logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/laravel/laravel-plain-wordmark.svg"
        },
        {
            framework: "ASP.NET",
            language: "C#",
            description: "Framework untuk aplikasi web dari Microsoft",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Microsoft_.NET_logo.svg"
        },
        {
            framework: "FastAPI",
            language: "Python",
            description: "Framework modern untuk API dengan Python",
            logoUrl: "https://cdn.worldvectorlogo.com/logos/fastapi-1.svg"
        },
        {
            framework: "NestJS",
            language: "JavaScript",
            description: "Framework untuk aplikasi Node.js yang modular dan scalable",
            logoUrl: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nestjs/nestjs-plain.svg"
        },
        {
            framework: "Koa.js",
            language: "JavaScript",
            description: "Framework minimalis dari pembuat Express",
            logoUrl: "https://raw.githubusercontent.com/koajs/logo/master/koa.png"
        }
    ]
];


const manrope = Manrope({subsets: ["latin"]});

const CustomRadio = (props: any) => {
    const {children, ...otherProps} = props;

    return (
        <Radio
            {...otherProps}
            classNames={{
                base: cn(
                    "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                    "flex-row-reverse cursor-pointer max-w-full rounded-lg gap-4 p-4 border-2 border-transparent",
                    "data-[selected=true]:border-primary"
                ),
            }}
        >
            {children}
        </Radio>
    );
};

const CustomCheckbox = ({language, logo, description, className}: {
    language: string,
    logo: string,
    description: string,
    className: string
}) => {
    return (
        <Checkbox
            aria-label={language}
            className={className}
            classNames={{
                base: cn(
                    "inline-flex max-w-md w-full bg-content1 m-0",
                    "hover:bg-content2 items-center justify-start",
                    "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                    "data-[selected=true]:border-primary"
                ),
                label: "w-full",
            }}
            value={language}
        >
            <div className="w-full flex items-center gap-2">
                <Image
                    src={logo}
                    alt={language}
                    className={"w-full h-full"}
                    classNames={{
                        wrapper: "shrink-0 w-16 h-16 max-w-16 mr-3"
                    }}
                />

                <div className="flex flex-col">
                    <p className={"text-lg font-medium text-white"}>
                        {language}
                    </p>
                    <p className={"text-sm text-white"}>
                        {description}
                    </p>
                </div>
            </div>
        </Checkbox>
    );
};

export default function ChallengeDescription({userData}: { userData: UserInfoResponse['data'] }) {
    const abort = React.useRef(new AbortController);
    const authorization = getCookie("Authorization");

    const [submitting, setSubmitting] = React.useState(false);
    const router = useRouter();

    const [stackChoice, setStackChoice] = React.useState("");
    const [stackLanguages, setStackLanguages] = React.useState<string[]>([]);
    const [otherLanguages, setOtherLanguages] = React.useState<string[]>([]);
    const [tools, setTools] = React.useState<string[]>([]);


    const getData = (stack: string) => {
        const frameworks = [];
        switch (stack) {
            case "FRONTEND":
                frameworks.push(...topFrameworks[0]);
                break;
            case "BACKEND":
                frameworks.push(...topFrameworks[1]);
                break;
            case "FULLSTACK":
                frameworks.push(...topFrameworks[0]);
                frameworks.push(...topFrameworks[1]);
                break;
            default:
                break;
        }

        // console.log(`frameworks: ${frameworks} from ${stack}`);
        return frameworks;
    }

    const isAccessed = React.useRef([false, false, false, false]);


    const pages = [{
        label: "first",
        fun: () => {
            return <div className={"w-full flex flex-col items-center relative"}>
                <motion.p variants={flyUp(0.5)}
                          initial="hidden"
                          className={"text-2xl"}
                          animate="show">
                    Pertama-tama, Anda ingin memilih <a className={"font-bold"}>karir</a> apa?
                </motion.p>

                <motion.div variants={flyUp(1)}
                            initial="hidden"
                            animate="show">
                    <RadioGroup className={"mt-4"} onChange={(v) => {
                        // console.log(v.target.value)
                        setStackChoice(v.target.value)
                    }}>
                        <CustomRadio description="Mengembangkan antarmuka pengguna (UI)" value="FRONTEND">
                            Front-End
                        </CustomRadio>
                        <CustomRadio description="Mengelola server dan basis data" value="BACKEND">
                            Back-End
                        </CustomRadio>
                        <CustomRadio description="Pengembangan menyeluruh (Front-End dan Back-End)" value="FULLSTACK">
                            Full-Stack
                        </CustomRadio>
                    </RadioGroup>
                </motion.div>

                <div className={"w-full mt-10 flex justify-end"}>
                    <Button className={"w-fit ml-auto"} color={"primary"} onClick={() => nextPage()}
                            isDisabled={stackChoice === ""}
                            endContent={<MdOutlineNavigateNext size={27} className={"-mr-3"}/>}>
                        Selanjutnya
                    </Button>
                </div>
            </div>
        }
    }, {
        label: "second",
        fun: () => {
            return <>
                <motion.p variants={flyUp(0.5)}
                          initial="hidden"
                          className={"text-2xl"}
                          animate="show">
                    Framework {stackChoice.toLowerCase()} apa yang anda ingin pelajari?
                </motion.p>

                <div>
                    <CheckboxGroup
                        classNames={{
                            wrapper: "w-full gap-2 grid grid-cols-1 justify-center md:grid-cols-2"
                        }}
                        value={stackLanguages}
                        onChange={setStackLanguages}
                    >
                        {getData(stackChoice).map((x, i) => {
                            return <CustomCheckbox className={"ml-auto mr-auto"} key={i} description={x.description}
                                                   language={x.framework}
                                                   logo={x.logoUrl}/>
                        })}
                    </CheckboxGroup>
                </div>

                <div className={"w-full mt-10 flex justify-between"}>
                    <Button className={"w-fit mr-auto"} color={"primary"} onClick={() => prevPage()}
                            startContent={<MdOutlineNavigateBefore size={27} className={"-mr-3"}/>}>
                        Sebelumnya
                    </Button>
                    <Button className={"w-fit ml-auto"} color={"primary"} onClick={() => nextPage()}
                            isDisabled={!stackLanguages.length}
                            endContent={<MdOutlineNavigateNext size={27} className={"-mr-3"}/>}>
                        Selanjutnya
                    </Button>
                </div>
            </>
        }
    }, {
        label: "third",
        fun: () => {
            return <>
                <motion.p variants={flyUp(0.5)}
                          initial="hidden"
                          className={"text-2xl"}
                          animate="show">
                    Bahasa lain apa saja yang ingin Anda pelajari?
                </motion.p>

                <div>
                    <CheckboxGroup
                        classNames={{
                            wrapper: "w-full gap-2 grid grid-cols-1 justify-center md:grid-cols-2"
                        }}
                        value={otherLanguages}
                        onChange={setOtherLanguages}
                    >
                        {topLanguages.map((x, i) => {
                            return <CustomCheckbox className={"ml-auto mr-auto"} key={i} description={x.description}
                                                   language={x.language}
                                                   logo={x.logoUrl}/>
                        })}
                    </CheckboxGroup>
                </div>

                <div className={"w-full mt-10 flex justify-between"}>
                    <Button className={"w-fit mr-auto"} color={"primary"} onClick={() => prevPage()}
                            startContent={<MdOutlineNavigateBefore size={27} className={"-mr-3"}/>}>
                        Sebelumnya
                    </Button>
                    <Button className={"w-fit ml-auto"} color={"primary"} onClick={() => nextPage()}
                            endContent={<MdOutlineNavigateNext size={27} className={"-mr-3"}/>}>
                        Selanjutnya
                    </Button>
                </div>
            </>
        }
    }, {
        label: "four",
        fun: () => {
            return <>
                <motion.p variants={flyUp(0.5)}
                          initial="hidden"
                          className={"text-2xl"}
                          animate="show">
                    Tools lain apa yang Anda ingin kuasai?
                </motion.p>

                <div>
                    <CheckboxGroup
                        classNames={{
                            wrapper: "w-full gap-2 grid grid-cols-1 justify-center md:grid-cols-2"
                        }}
                        value={tools}
                        onChange={setTools}
                    >
                        {topTools.map((x, i) => {
                            return <CustomCheckbox className={"ml-auto mr-auto"} key={i} description={x.description}
                                                   language={x.tool}
                                                   logo={x.logoUrl}/>
                        })}
                    </CheckboxGroup>
                </div>

                <div className={"w-full mt-10 flex justify-between"}>
                    <Button className={"w-fit mr-auto"} color={"primary"} onClick={() => prevPage()}
                            isLoading={submitting}
                            startContent={<MdOutlineNavigateBefore size={27} className={"-mr-3"}/>}>
                        Sebelumnya
                    </Button>
                    <Button className={"w-fit ml-auto"} color={"primary"} onClick={() => sendData()}
                            isLoading={submitting}
                            endContent={<MdOutlineNavigateNext size={27} className={"-mr-3"}/>}>
                        Step Berikutnya
                    </Button>
                </div>
            </>
        }
    }]

    const [page, setPage] = React.useState(0);

    React.useEffect(() => {
        window.scrollTo({top: 0, behavior: "instant"});
        if (isAccessed.current[page]) return;
        isAccessed.current[page] = true;
    }, [page])

    React.useEffect(() => {
        if (stackChoice === "") return;
        setStackLanguages([]);
    }, [stackChoice]);

    React.useEffect(() => {
        const langs: string[] = [];
        stackLanguages.forEach(x => {
            const data = getData(stackChoice).find(y => y.framework === x);
            if (data && !langs.includes(data.language)) langs.push(data.language);
        });
        setOtherLanguages(langs);
    }, [stackLanguages]);

    async function sendData() {
        if (submitting) return;
        setSubmitting(true);
        const {
            statusCode,
            data
        } = await ApiManager.SubmitDescription(abort.current.signal, authorization ?? "", {
            role: stackChoice,
            roleLanguages: stackLanguages,
            languagesToLearn: otherLanguages,
            toolsToLearn: tools
        });
        if (statusCode !== 200) return toast.error(`Something went wrong when processing the request. Please try again later! ${data.message}`, {
            style: {
                borderRadius: '20px',
                background: '#151414',
                color: '#fff',
            },
        })
        // setSubmitting(false)
        router.push("/challenge/interview");
    }

    function prevPage() {
        setPage(x => x - 1);
    }

    function nextPage() {
        setPage(x => x + 1);
    }

    return <>
        <Header userInfo={userData} center={true}/>
        <main
            className={"blue-palette min-w-screen min-h-screen flex flex-col items-center pb-32 pt-20 " + manrope.className}>
            <div className={"flex flex-col gap-10 mt-10 w-[800px] max-w-[90vw]"}>
                {pages[page].fun()}
            </div>
        </main>
        <Footer/>
    </>
}