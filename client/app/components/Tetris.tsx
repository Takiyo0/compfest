'use client';

import Tetris from "react-tetris";
import React from "react";
import {Button, Kbd} from "@nextui-org/react";
import {FaPlay} from "react-icons/fa6";
import {useWindowSize} from "@react-hook/window-size";

export default function TetrisGame({...props}) {
    const [width] = useWindowSize();

    React.useEffect(() => {
        window.addEventListener("keydown", function (e) {
            if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);
    }, [])
    return <Tetris
        keyboardControls={{
            down: 'MOVE_DOWN',
            left: 'MOVE_LEFT',
            right: 'MOVE_RIGHT',
            space: 'HARD_DROP',
            z: 'FLIP_COUNTERCLOCKWISE',
            x: 'FLIP_CLOCKWISE',
            up: 'FLIP_CLOCKWISE',
            p: 'TOGGLE_PAUSE',
            c: 'HOLD',
            shift: 'HOLD'
        }}
    >
        {({
              Gameboard,
              PieceQueue,
              points,
              linesCleared,
              state,
              controller
          }) => (
            <div className={"mt-6 relative rounded-xl p-2 box-border"}>
                <div className={"flex"}>
                    {width >= 1024 && <div className={"mr-6 mt-24"}>
                        Shortcuts: <br/>
                        <div className={"mb-1"}>
                            <Kbd keys={["space"]}></Kbd> instant place
                        </div>
                        <div className={"mb-1"}>
                            <Kbd keys={["up"]}></Kbd> flip clockwise
                        </div>
                        <div className={"mb-1"}>
                            <Kbd keys={["left"]}></Kbd> move left
                        </div>
                        <div className={"mb-1"}>
                            <Kbd keys={["right"]}></Kbd> move right
                        </div>
                        <div className={"mb-1"}>
                            <Kbd keys={["down"]}></Kbd> move down
                        </div>
                    </div>}
                    <div>
                        <div className={"flex justify-between mb-2"}>
                            <p>Points: {points}</p>
                            <p>Lines Cleared: {linesCleared}</p>
                        </div>
                        <div className={"flex"}>
                            <Gameboard/>
                            <div className={"w-10"}/>
                            <PieceQueue/>
                        </div>
                        {state === 'LOST' && (
                            <div
                                className={"absolute rounded-xl top-0 left-0 right-0 bottom-0 flex backdrop-blur-sm flex-col justify-center items-center z-10 bg-black/50"}>
                                <h2 className={"text-2xl font-bold mb-2"}>Game Over</h2>
                                <Button color={"primary"} onClick={controller.restart}>New game</Button>
                            </div>
                        )}
                        {state === 'PAUSED' && (
                            <div
                                className={"absolute rounded-xl top-0 left-0 right-0 bottom-0 flex backdrop-blur-sm flex-col justify-center items-center z-10 bg-black/50"}>
                                <h2 className={"text-2xl font-bold mb-2"}>Game is paused</h2>
                                <Button color={"primary"} onClick={controller.resume}>Resume</Button>
                            </div>
                        )}
                        <div className={"flex justify-between"}>
                            <div className={"relative mt-3 h-36 w-36 flex items-center justify-center"}>
                                <div
                                    className={"h-36 w-36 rounded-full bg-transparent border-solid border-gray-400 border-1"}/>
                                <div className={"w-10 h-32 absolute bg-gray-500"}/>
                                <div className={"w-10 h-32 absolute rotate-90 bg-gray-500"}/>
                                <div className={"button-click w-9 h-9 absolute top-3 z-10"}
                                     onClick={controller.hardDrop}/>
                                <div className={"button-click w-9 h-9 absolute left-3 z-10"}
                                     onClick={controller.moveLeft}/>
                                <div className={"button-click w-9 h-9 absolute right-3 z-10"}
                                     onClick={controller.moveRight}/>
                                <div className={"button-click w-9 h-9 absolute bottom-3 z-10"}
                                     onClick={controller.moveDown}/>
                            </div>
                            <div className={"relative mt-16 w-10 h-10"}>
                                <div className={"w-12 h-8 flex flex-col rotate-[-35deg] items-center"}>
                                    <div className={"button-click bg-gray-600 w-12 h-5 rounded-xl mb-1"}
                                         onClick={controller.pause}/>
                                    <FaPlay className={"fill-gray-500"}/>
                                </div>
                            </div>
                            <div className={"w-28 h-28 mt-6 relative items-center justify-center flex"}>
                                <div className={"w-12 h-28 rotate-[60deg] rounded-3xl"} style={{
                                    boxShadow: "0px 0px 15px 3px rgba(148,148,148,1)"
                                }}/>
                                <div className={"button-click bg-red-800 w-10 h-10 absolute top-5 right-2 rounded-full"}
                                     onClick={controller.flipCounterclockwise}/>
                                <div
                                    className={"button-click bg-red-800 w-10 h-10 absolute bottom-5 left-2 rounded-full"}
                                    onClick={controller.flipClockwise}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </Tetris>
}