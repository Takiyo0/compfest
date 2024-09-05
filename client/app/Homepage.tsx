'use client'

import {Manrope} from "next/font/google";
import {IoChatbubbleEllipses, IoMenu} from "react-icons/io5";
import '@xyflow/react/dist/style.css';
import Tree from 'react-d3-tree';
import React, {useCallback, useEffect, useRef, useState} from "react";
import Header from "@/app/components/header";
import {TreeResponse, UserInfoResponse} from "@/app/managers/api";
import {motion, useCycle} from "framer-motion"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter, useDisclosure
} from "@nextui-org/modal";
import {Button, MenuItem, Spinner} from "@nextui-org/react";
import Footer from "@/app/components/footer";
import {GiFamilyTree} from "react-icons/gi";
import {PiQuestionMarkFill} from "react-icons/pi";
import {MdOutlineExtensionOff} from "react-icons/md";
import useQuestionQueue from "@/app/hooks/QuestionQueue";
import {useRouter} from "next/navigation";

const manrope = Manrope({subsets: ["latin"]});

interface Node {
    id: string;
    data: { label: string };
    position: { x: number, y: number };
}

interface RawNodeDatum {
    name: string;
    attributes?: Record<string, string | number | boolean>;
    children?: RawNodeDatum[];
}


function transformToD3Format(skillTree: TreeResponse['data']['skillTree'], rootId: number): RawNodeDatum {
    function findNodeById(id: number): TreeResponse['data']['skillTree'][0] | undefined {
        console.log(skillTree)
        return skillTree.find(node => node.id === id);
    }

    function buildNode(node: TreeResponse['data']['skillTree'][0]): RawNodeDatum {
        const children = node.child.map(childId => {
            const childNode = findNodeById(childId);
            return childNode ? buildNode(childNode) : null;
        }).filter(Boolean) as RawNodeDatum[];

        return {
            name: node.name,
            attributes: {
                id: node.id,
                isRoot: node.isRoot
            },
            children: children.length > 0 ? children : undefined,
        };
    }

    const rootNode = findNodeById(rootId);
    if (!rootNode) {
        throw new Error(`Root node with ID ${rootId} not found.`);
    }

    return buildNode(rootNode);
}

export default function HomePage({data, userData}: {
    data: TreeResponse['data']['skillTree'],
    userData: UserInfoResponse['data']
}) {
    console.log(data);
    const router = useRouter();
    const d3TreeData = transformToD3Format(data, data.find(x => x.isRoot)?.id ?? 777622795);
    const [showTree, setShowTree] = useState(false);
    const [treeTranslate, setTreeTranslate] = useState({x: 0, y: 0});
    const [selectedNode, setSelectedNode] = useState<number | undefined>(undefined);

    const [isOpen, toggleOpen] = useCycle(true, false);
    const [height, setHeight] = useState(1000);
    const containerRef = useCallback((node: HTMLDivElement) => {
        if (node != null) {
            setHeight(node.offsetHeight);
        }
    }, [])

    const treeContainer = useCallback((node: HTMLDivElement) => {
        if (node != null) {
            setTreeTranslate({
                x: (node.getBoundingClientRect().width ?? 0) / 2,
                y: (node.getBoundingClientRect().height ?? 0) / 2 - screen.height / 3,
            })
        }
    }, [])

    useEffect(() => {
        setShowTree(true);
    }, [])
    if (!showTree) return <></>;

    function openQuestion(id: number) {
        if (id == undefined) return;
        setSelectedNode(id);
    }

    return <>
        <Header userInfo={userData} center={true}/>
        <Modal isOpen={!!selectedNode} classNames={{
            base: "bg-primary-900 w-full max-w-[900px]"
        }}>
            <ModalContent>
                <>
                    <ModalHeader
                        className="flex flex-col gap-1">{data.find(x => x.id == selectedNode)?.name}</ModalHeader>
                    <ModalBody className={"flex flex-row"}>
                        <div className={"w-min flex flex-col"}>
                            {data.find(x => x.id === selectedNode)?.entries.map((x, i) => <Button className={""}
                                                                                                  style={{width: "initial"}}
                                                                                                  key={i}>
                                {x.title}
                            </Button>)}
                        </div>
                        <div className={"w-96"}>
                            Hallo world
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={() => setSelectedNode(undefined)}>
                            Close
                        </Button>
                        <Button color="primary" onPress={() => setSelectedNode(undefined)}>
                            Action
                        </Button>
                    </ModalFooter>
                </>
            </ModalContent>
        </Modal>
        <main className={"blue-palette home flex h-screen items-start justify-between p-24 " + manrope.className}>
            <motion.nav
                initial={false}
                animate={isOpen ? "open" : "closed"}
                custom={height}
                ref={containerRef}
                variants={{
                    open: () => {
                        const height = window.innerHeight;
                        return {
                            height: height - height / 6,
                            width: 280,
                            marginRight: 20,
                            borderRadius: 20
                        }
                    },
                    closed: {
                        height: 57,
                        width: 57,
                        marginRight: 20,
                        borderRadius: 20,
                        transition: {delay: .2, duration: .8, ease: [0, 0.71, 0.2, 1.01]}
                    }
                }}
                transition={{
                    duration: 0.8,
                    ease: [0, 0.71, 0.2, 1.01]
                }}
                className={"bg-[#c5cdcd1c] mt-4 p-2 box-border home-nav"}
            >
                <Button isIconOnly className={"p-1 bg-transparent"} onPress={() => toggleOpen()}>
                    <IoMenu size={40}/>
                </Button>
                <motion.div className={"w-full p-4 box-border"} variants={{
                    open: {
                        display: "block",
                        opacity: 1
                    },
                    closed: {
                        display: "none",
                        opacity: 0
                    }
                }}>
                    <p>Navigation</p>
                    <Button startContent={<GiFamilyTree size={20}/>} className={"w-full text-left mt-2"}
                            color={"primary"}
                            variant={"shadow"}>Skill Tree</Button>
                    <Button startContent={<PiQuestionMarkFill size={20}/>} className={"w-full text-left mt-3"}
                            color={"default"} onClick={() => router.push("/archive")}
                            variant={"solid"}>Arsip Pertanyaan</Button>
                    <Button startContent={<IoChatbubbleEllipses size={20}/>} className={"w-full text-left mt-3"}
                            color={"default"} onClick={() => router.push("/chat")}
                            variant={"solid"}>Chat</Button>

                    {/*<div className={"mt-12 flex flex-col items-center"}>*/}
                    {/*    <p className={"self-start mb-2"}>Proses Latar Belakang</p>*/}
                    {/*    {queue.length > 0 ? queue.map((x, i) => <div key={i}*/}
                    {/*                                                 className={"flex items-center mb-2 self-start"}>*/}

                    {/*        <Spinner size={"md"} color="warning"/> <p className={"ml-2"}>{x.treeName}</p>*/}
                    {/*    </div>) : <div*/}
                    {/*        className={"flex flex-col items-center w-36 border-1 border-primary rounded-2xl p-3 mt-7 select-none"}>*/}
                    {/*        <MdOutlineExtensionOff size={60}/>*/}
                    {/*        <p className={"text-[.9rem] text-center mt-3"}>Tidak ada antrian proses latar belakang yang*/}
                    {/*            berjalan. </p>*/}
                    {/*    </div>}*/}
                    {/*</div>*/}
                </motion.div>
            </motion.nav>
            <div ref={treeContainer} id="treeWrapper"
                 className={"text-white bg-[#c5cdcd1c] h-full w-full rounded-3xl mt-4"}>
                <Tree data={d3TreeData}
                      rootNodeClassName="node__root"
                      branchNodeClassName="node__branch"
                      orientation={"vertical"}
                      translate={treeTranslate}
                      nodeSize={{
                          x: 230,
                          y: 180
                      }}
                      renderCustomNodeElement={n => {
                          const data = n.nodeDatum;
                          const isTopRoot = data.name == "Your Skill Tree";
                          console.log(isTopRoot, data.name)
                          return <foreignObject x={isTopRoot ? -100 : -13} y={isTopRoot ? -60 : -35} width={230}
                                                height={80}>
                              <div
                                  className={"w-full h-full flex items-center " + (isTopRoot ? "flex-col-reverse" : "")}>
                                  <div className={"grow-0 w-7 h-7 rounded-full bg-gray-500"}/>
                                  <div onClick={x => openQuestion(data.attributes?.id as number)}
                                       className={"ml-2 h-full w-[90%] bg-[#76b1e530] rounded-xl p-2 box-border hover:scale-95 active:scale-90 " + (isTopRoot ? "h-min mb-3 text-center bg-[#60eef36e]" : "")}>
                                      <h1>{data.name}</h1>
                                  </div>
                              </div>
                          </foreignObject>;
                      }}
                      zoomable={true}
                      collapsible={false}
                      enableLegacyTransitions={true}
                      leafNodeClassName="node__leaf"/>
            </div>
        </main>
        <Footer/>
    </>
}