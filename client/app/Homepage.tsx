'use client'

import {Manrope} from "next/font/google";
import {IoChatbubbleEllipses, IoMenu} from "react-icons/io5";
import '@xyflow/react/dist/style.css';
import Tree from 'react-d3-tree';
import React, {useCallback, useEffect, useState} from "react";
import Header from "@/app/components/header";
import {TreeResponse, UserInfoResponse} from "@/app/managers/api";
import {motion, useCycle} from "framer-motion"
import {Button} from "@nextui-org/react";
import Footer from "@/app/components/footer";
import {GiFamilyTree} from "react-icons/gi";
import {PiQuestionMarkFill} from "react-icons/pi";
import {useRouter, useSearchParams} from "next/navigation";
import {useWindowSize} from "@react-hook/window-size";
import {IoIosTrophy} from "react-icons/io";
import ButtonNavigation from "@/app/components/buttonNavigation";

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
    function limitChildrenTo(node: RawNodeDatum, maxChildren: number) {
        if (node.name != "Kuduga AI" && node.children && node.children.length > maxChildren) {
            const previousLength = node.children.length;
            node.children = node.children.slice(0, maxChildren - 1);
            node.children.push({
                name: "dan " + (previousLength - maxChildren) + " lainnya"
            })
        }

        return node;
    }

    function findNodeById(id: number): TreeResponse['data']['skillTree'][0] | undefined {
        return skillTree.find(node => node.id === id);
    }

    function buildNode(node: TreeResponse['data']['skillTree'][0]): RawNodeDatum {
        // Map child IDs to their corresponding node structure
        const children = node.child.map(childId => {
            const childNode = findNodeById(childId);
            return childNode ? buildNode(childNode) : null;
        }).filter(Boolean) as RawNodeDatum[];

        // Include the entries as individual child nodes
        const entryChildren = node.entries.map(entry => ({
            name: entry.title,
            attributes: {
                description: entry.description,
                id: entry.id,
                parentId: node.id
            },
            children: undefined
        }));

        // Add entries as children if any exist
        const allChildren = [...children, ...entryChildren];

        return {
            name: node.name,
            attributes: {
                id: node.id,
                isRoot: node.isRoot
            },
            children: allChildren.length > 0 ? allChildren : undefined,
        };
    }

    // Create a top-level root node for "Kuduga AI"
    const kudugaRoot: RawNodeDatum = {
        name: "Kuduga AI",
        attributes: {},
        children: []
    };

    const rootNode = findNodeById(rootId);
    if (!rootNode) {
        throw new Error(`Root node with ID ${rootId} not found.`);
    }

    const t = [{
        n: "1",
        children: [{
            n: "2",
            children: [{
                n: "3",
                children: [{
                    n: "4",
                    children: undefined
                }, {
                    n: "7",
                    children: undefined
                }, {
                    n: "8",
                    children: undefined
                }]
            }, {
                n: "6",
                children: undefined
            }]
        }, {
            n: "5",
            children: undefined
        }]
    }]

    const languageNodes = [buildNode(rootNode)];
    kudugaRoot.children = moveFirstIndexToTop(languageNodes).map(x => limitChildrenTo(x, 3));

    return kudugaRoot;
}

function moveFirstIndexToTop(nodes: RawNodeDatum[]): RawNodeDatum[] {
    const result: RawNodeDatum[] = [];

    function moveFirstChildToFront(node: RawNodeDatum): RawNodeDatum {
        if (node.children && node.children.length > 0) {
            const firstChild = node.children[0];

            // Only move the first child if it has children
            if (firstChild.children && firstChild.children.length > 0) {
                const otherChildren = node.children.slice(1);

                const processedFirstChild = moveFirstChildToFront(firstChild);

                result.push(processedFirstChild);

                return {
                    ...node,
                    children: otherChildren.length > 0 ? otherChildren : undefined
                };
            }
        }

        return node;
    }

    nodes.forEach(node => {
        const processedNode = moveFirstChildToFront(node);
        result.push(processedNode);
    });

    return result;
}

export default function HomePage({data, userData}: {
    data: TreeResponse['data']['skillTree'],
    userData: UserInfoResponse['data']
}) {
    const router = useRouter();
    const d3TreeData = transformToD3Format(data, data.find(x => x.isRoot)?.id ?? 777622795);
    const [showTree, setShowTree] = useState(false);
    const [treeTranslate, setTreeTranslate] = useState({x: 0, y: 0});

    const [width] = useWindowSize();
    const [isOpen, toggleOpen] = useCycle(true, false);
    const [height, setHeight] = useState(1000);
    const containerRef = useCallback((node: HTMLDivElement) => {
        if (node != null) {
            setHeight(node.offsetHeight);
        }
    }, [])

    React.useEffect(() => {
        if (width < 1024 && isOpen) toggleOpen();
    }, [width])

    const treeContainer = useCallback((node: HTMLDivElement) => {
        if (node != null) {
            setTreeTranslate({
                x: (screen.width - (node.getBoundingClientRect().width ?? 0)) / 5,
                y: (screen.height - (node.getBoundingClientRect().height ?? 0)) / 2,
            });
        }
    }, [])

    useEffect(() => {
        setShowTree(true);
    }, [])
    if (!showTree) return <></>;

    function openQuestion(id: number, parentId?: number) {
        if (id == undefined) return;
        if (parentId != undefined) {
            router.push(`/material/${parentId}?child=${id}`);
        } else router.push(`/material/${id}`);
    }

    return <>
        <Header userInfo={userData} center={true}/>
        <main
            className={"blue-palette home flex h-screen items-start justify-between p-24 " + manrope.className + (width < 1024 ? " !p-3 !pt-24" : "")}>
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
                className={"bg-[#c5cdcd1c] mt-4 p-2 box-border " + (width < 1024 ? "absolute left-3 backdrop-blur-3xl z-10" : "")}
            >
                <Button isIconOnly className={"p-1 bg-transparent"} onPress={() => toggleOpen()}>
                    <IoMenu size={40}/>
                </Button>
                <motion.div className={"w-full p-4 pt-0 box-border"} variants={{
                    open: {
                        display: "block",
                        opacity: 1
                    },
                    closed: {
                        display: "none",
                        opacity: 0
                    }
                }}>
                    <p>Navigasi</p>
                    {[
                        {
                            name: "Skill Tree",
                            isActive: true,
                            redirectTo: "/",
                            icon: <GiFamilyTree size={20}/>
                        },
                        {
                            name: "Arsip Pertanyaan",
                            isActive: false,
                            redirectTo: "/archive",
                            icon: <PiQuestionMarkFill size={20}/>
                        },
                        {
                            name: "Kompetisi",
                            isActive: false,
                            redirectTo: "/competition",
                            icon: <IoIosTrophy size={20}/>
                        },
                        {
                            name: "Chat",
                            isActive: false,
                            redirectTo: "/chat",
                            icon: <IoChatbubbleEllipses size={20}/>
                        }].map((x, i) => (
                        <ButtonNavigation key={i} name={x.name} active={x.isActive} redirectTo={x.redirectTo}
                                          icon={x.icon}/>))}
                </motion.div>
            </motion.nav>
            <div ref={treeContainer} id="treeWrapper"
                 className={"text-white bg-[#c5cdcd1c] h-full w-full rounded-3xl mt-4"}>
                <Tree data={d3TreeData}
                      rootNodeClassName="node__root"
                      branchNodeClassName="node__branch"
                      pathFunc={"diagonal"}
                      depthFactor={400}
                      orientation={"horizontal"}
                      translate={treeTranslate}
                      separation={{siblings: 0.3, nonSiblings: 0.4}}
                      zoom={.7}
                      nodeSize={{
                          x: 400,
                          y: 180
                      }}
                      renderCustomNodeElement={n => {
                          const data = n.nodeDatum;
                          const isParent = data.children && data.children.length != 0;
                          return <foreignObject x={isParent ? -110 : -13} y={isParent ? -65 : -20}
                                                width={isParent ? 230 : 400}
                                                height={isParent ? 80 : 40}>
                              <div
                                  className={"w-full h-full flex items-center " + (isParent ? "flex-col-reverse" : "")}>
                                  <div className={"grow-0 w-7 h-7 rounded-full bg-gray-500"}/>
                                  <div
                                      onClick={x => openQuestion(data.attributes?.id as number, !isParent ? (data.attributes?.parentId as number) : undefined)}
                                      className={"ml-2 h-full w-[90%] bg-[#76b1e530] rounded-xl p-2 box-border hover:scale-95 active:scale-90 " + (isParent ? "h-min mb-3 text-center bg-[#60eef36e]" : "")}>
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