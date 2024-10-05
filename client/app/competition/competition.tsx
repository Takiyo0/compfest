'use client'

import {Trophy} from "@/app/assets/images/trophy";
import Header from "@/app/components/header";
import React from "react";
import {CurrentEventResponse, EventTopic, UserInfoResponse} from "@/app/managers/api";
import {Manrope} from "next/font/google";
import {useWindowSize} from "@react-hook/window-size";
import {motion, useCycle} from "framer-motion";
import {Card, CardBody, CardFooter} from "@nextui-org/card";
import {Image} from "@nextui-org/image";
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/table";
import {User} from "@nextui-org/user";
import {LogoComponent} from "@/app/assets/images/logo";
import {Button} from "@nextui-org/react";
import {MdGroups, MdOutlineArrowBack} from "react-icons/md";
import {Divider} from "@nextui-org/divider";
import {router} from "next/client";
import {GiFamilyTree} from "react-icons/gi";
import {useRouter} from "next/navigation";
import {FaHome, FaTrophy} from "react-icons/fa";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/modal";
import ButtonNavigation from "@/app/components/buttonNavigation";

export const logo: { [key: string]: string } = {
    "React": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    "Vue": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
    "Angular": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg",
    "Svelte": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg",
    "Next.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
    "jQuery": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg",
    "Ruby on Rails": "https://upload.wikimedia.org/wikipedia/commons/6/62/Ruby_On_Rails_Logo.svg",
    "Django": "https://www.djangoproject.com/m/img/logos/django-logo-negative.svg",
    "Laravel": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Laravel.svg",
    "ASP.NET Core": "https://upload.wikimedia.org/wikipedia/commons/e/ee/.NET_Core_Logo.svg",
    "Express.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
    "Flask": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
    "FastAPI": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg",
    "Fastify": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastify/fastify-original.svg",
    "Symfony": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/symfony/symfony-original.svg",
    "CakePHP": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cakephp/cakephp-original.svg",
    "Spring Boot": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg",
    "JavaScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    "Python": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    "Go": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
    "Java": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
    "PHP": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
    "C#": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
    "Swift": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
    "Ruby": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Ruby_logo.png",
    "C": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
    "C++": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
    "TypeScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
    "HTML": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    "CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
    "Rust": "https://upload.wikimedia.org/wikipedia/commons/d/d5/Rust_programming_language_black_logo.svg",
    "Perl": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/perl/perl-original.svg"
}

const manrope = Manrope({subsets: ["latin"]});

export default function CompetitionPage({userData, currentEvent, topics}: {
    userData: UserInfoResponse['data'],
    currentEvent: CurrentEventResponse['data'],
    topics: Map<string, EventTopic[]>
}) {
    const [width, height] = useWindowSize();
    const [isOpen, cycleOpen] = useCycle(-270, 0);
    const [countdown, setCountdown] = React.useState("");
    const [selectedName, setSelectedName] = React.useState("");

    const router = useRouter();

    React.useEffect(() => {
        const now = new Date(currentEvent.serverTime);
        const nextWeekTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()));

        const updateCountdown = () => {
            const now = new Date();
            const timeLeft = nextWeekTime.getTime() - now.getTime();

            if (timeLeft <= 0) {
                setCountdown(`Week ${currentEvent.week} has ended!`);
                clearInterval(intervalId);
                return;
            }

            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            setCountdown(`${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };

        updateCountdown();
        const intervalId = setInterval(updateCountdown, 1000);

        return () => clearInterval(intervalId);
    }, [currentEvent]);

    const leaderboard = currentEvent.leaderboard.map((x, i) => ({
        Id: x.Id,
        Rank: i + 1,
        UserId: x.UserId,
        Name: x.Name,
        QuestionIds: x.QuestionIds,
        AnsweredQuestions: x.QuestionIds.length,
        TopLanguage: (Object.entries(x.Languages) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0],
        Score: x.Score
    }))

    const renderCell = React.useCallback((user: any, columnKey: any) => {
        const cellValue = user[columnKey];

        switch (columnKey) {
            case "rank":
                return (
                    <p>#{user.Rank}</p>
                );

            case "name":
                return (
                    <User
                        avatarProps={{radius: "lg", src: `https://avatars.githubusercontent.com/u/${user.UserId}?v=4`}}
                        description={<p
                            className={"text-medium " + (user.UserId == userData.userId ? "text-green-400" : "text-white")}>{user.Name} {user.UserId == userData.userId ? "(You)" : ""}</p>}
                        name={cellValue}
                    />
                );
            case "topLang":
                return (
                    <p>{user.TopLanguage}</p>
                );

            case "ansQuestions":
                return (
                    <p>{user.AnsweredQuestions} questions</p>
                );

            case "score":
                return (
                    <p>{user.Score}</p>
                );

            default:
                return cellValue;
        }
    }, []);

    return <>
        <Header userInfo={userData} center={true}/>
        <Modal
            backdrop="blur"
            className={"blue-palette bg-[#272438]"}
            isOpen={selectedName !== ""}
            onOpenChange={a => !a && setSelectedName("")}
            motionProps={{
                variants: {
                    enter: {
                        y: 0,
                        opacity: 1,
                        transition: {
                            duration: 0.3,
                            ease: "easeOut",
                        },
                    },
                    exit: {
                        y: 20,
                        opacity: 0,
                        transition: {
                            duration: 0.2,
                            ease: "easeIn",
                        },
                    },
                }
            }}
        >
            <ModalContent>
                {(onClose) => {
                    const tops = topics.get(selectedName);
                    return <>
                        <ModalHeader className="flex flex-col gap-1 text-2xl">{selectedName}</ModalHeader>
                        <ModalBody>
                            {tops?.map((x, i) => (
                                <Card className={"w-full bg-[#444d7a]"} key={i} isPressable
                                      onPress={() => router.push(`/competition/question/${x.Id}`)}>
                                    <CardBody className="flex flex-col gap-1">
                                        <div className={"flex items-center"}>
                                            <p className={"text-xl"}>{x.Name}</p>
                                            <div
                                                className={"p-1 pr-2 pl-2 ml-3 h-min bg-" + (x.Difficulty == "EASY" ? "green-500" : x.Difficulty == "MEDIUM" ? "yellow-500" : "red-500") + " rounded-full"}>
                                                <p className={"text-xs"}>{x.Difficulty}</p>
                                            </div>
                                        </div>
                                        <div className={"flex items-center"}>
                                            <Image alt={x.Language} src={logo[x.Language as string] ?? ""}
                                                   className={"w-7 h-7 rounded-full mr-2"}/>
                                            <p>{x.Language}</p>
                                        </div>
                                    </CardBody>
                                </Card>))}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </>
                }}
            </ModalContent>
        </Modal>
        <main
            className={"blue-palette p-24 box-border flex justify-center overflow-y-auto " + manrope.className + (width < 1024 ? " !p-3 !pt-14" : "")}>
            <motion.div
                className={"bg-[#5353534d] mt-8 backdrop-blur-3xl w-64 p-1 pb-5 box-content rounded-xl h-fit " + (width < 1024 ? ` z-10 !fixed top-28 rounded-bl-none rounded-tl-none` : "")}
                initial={width < 1024 ? {left: isOpen} : {}}
                transition={{
                    duration: .8,
                    ease: [0.25, 0.8, 0.5, 1]
                }}
                animate={width < 1024 ? {left: isOpen} : {}}>
                {width < 1024 && <div className={"flex items-center absolute -right-12 top-5"}>
                    <LogoComponent viewBox={"0 0 35 28"}
                                   className={"w-12 h-12 pl-3 pr-2 rounded-tr-xl rounded-br-xl bg-[#5353534d] backdrop-blur-3xl"}
                                   onClick={() => cycleOpen()}/>
                </div>}
                <Button startContent={<MdOutlineArrowBack size={20}/>} variant={"light"}
                        onClick={(_ => router.back())}
                        className={"-ml-3 mt-1"}>Kembali</Button>
                <div className={"pl-3 pr-3 box-border"}>
                    {[{
                        name: "Beranda",
                        isActive: false,
                        redirectTo: "/",
                        icon: <FaHome size={20}/>
                    }, {
                        name: "Dashboard Kompetisi",
                        isActive: true,
                        redirectTo: "/",
                        icon: <FaTrophy size={20}/>
                    }].map((x, i) => (
                        <ButtonNavigation key={i} name={x.name} active={x.isActive} redirectTo={x.redirectTo}
                                          icon={x.icon}/>))}
                </div>
            </motion.div>
            <div className={"mt-8 flex w-full max-w-[1200px]"}>
                <div
                    className={"w-full flex flex-col items-center flex-1 min-h-32 bg-[#5353534d] ml-10 rounded-xl p-5 box-border " + (width < 1024 ? "!ml-0" : "")}>
                    <div className={"flex w-full p-5 box-border"}>
                        <div className={""}>
                            <Trophy className={"w-72 h-72"}/>
                            <p className={"text-xl text-center"}>
                                {currentEvent.isReady ? <>Kompetisi Minggu ke-<a
                                    className="font-bold text-blue-300 text-3xl">{currentEvent.week}</a> telah
                                    dibuka!<br/>Berakhir
                                    pada {countdown}</> : `Sedang dalam persiapan Kompetisi Minggu ke-${currentEvent.week}.`}
                            </p>
                        </div>
                        <div className={"w-full bg-[#7e8db41f] backdrop-blur-sm ml-6 rounded-2xl pt-5 box-border"}>
                            <p className={"text-xl font-bold pl-5"}>Global Leaderboard</p>
                            <Table className={" bg-transparent"} classNames={{
                                table: "bg-transparent",
                                base: "bg-transparent",
                                wrapper: "bg-transparent shadow-none",
                                th: "text-white bg-[#4051c047]"
                            }}>
                                <TableHeader columns={[{name: "Rank", uid: "rank"}, {
                                    name: "User",
                                    uid: "name"
                                }, {name: "Top Language", uid: "topLang"}, {
                                    name: "Answered Questions",
                                    uid: "ansQuestions"
                                }, {
                                    name: "Score",
                                    uid: "score"
                                }]}>
                                    {(column) => (
                                        <TableColumn key={column.uid}
                                                     align={column.uid === "actions" ? "center" : "start"}>
                                            {column.name}
                                        </TableColumn>
                                    )}
                                </TableHeader>
                                <TableBody items={leaderboard} emptyContent={<div className={"flex flex-col items-center"}>
                                    <FaTrophy className={"h-24 w-24"}/>
                                    <p>Ayo bantu isi leaderboard ini!</p>
                                </div>}>
                                    {(item: any) => (
                                        <TableRow key={item.Id}>
                                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="gap-2 grid grid-cols-2 sm:grid-cols-4 mt-12 p-3">
                        {Array.from(topics.values()).map((tops: EventTopic[], index) => {
                            const first = tops[0];
                            return <Card shadow="sm" key={index} isPressable
                                         className={"bg-[#7e8db41f] backdrop-blur-sm"}
                                         onPress={() => setSelectedName(first.Name)}>
                                <CardBody className="overflow-visible p-0 w-full flex items-center">
                                    <Image
                                        radius="lg"
                                        alt={first.Name}
                                        className="w-full object-contain p-3 box-border h-[140px]"
                                        src={logo[first.Name as string] ?? undefined}
                                    />
                                </CardBody>
                                <CardFooter className="text-small justify-between flex-col text-white">
                                    <b className={"text-xl"}>{first.Name}</b>
                                    <p className="text-white">{first.Description}</p>
                                </CardFooter>
                            </Card>
                        })}
                    </div>

                    {/*<div className={"w-full"}>*/}
                    {/*    <p className={"text-2xl"}>Languages</p>*/}
                    {/*    {Array.from(topics.values()).map((tops: EventTopic[], i) => {*/}
                    {/*        const f = tops[0];*/}
                    {/*        return <div key={i}*/}
                    {/*                    className={"bg-[#3d47a59c] h-auto p-2 pl-4 pr-4 rounded-2xl mt-4 flex items-center"}*/}
                    {/*                    style={width < 1024 ? {*/}
                    {/*                        zoom: .9*/}
                    {/*                    } : {}}>*/}
                    {/*            <p>{f.Name}</p>*/}
                    {/*        </div>*/}
                    {/*    })}*/}
                    {/*</div>*/}
                </div>
            </div>
        </main>
    </>
}