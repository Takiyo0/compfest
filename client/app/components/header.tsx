"use client"

import {LogoComponent} from "@/app/assets/images/logo";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";
import {User} from "@nextui-org/user";
import {useWindowSize} from "@react-hook/window-size";
import {deleteCookie} from "cookies-next";
import {router} from "next/client";
import {useRouter} from "next/navigation";

export default function Header({userInfo, center = false}: { userInfo: any, center?: boolean }) {
    const [width] = useWindowSize();
    const router = useRouter();

    function logout() {
        deleteCookie('Authorization');
        window.location.href = '/login';
    }

    return (
        <div
            className={
                "blue-palette header w-[95vw] max-w-[70rem] z-50 mt-7 h-14 bg-gradient-to-r from-[#4a4a98] via-[#5252b9] to-[#9d9dd8] backdrop-blur-3xl pl-5 pr-5 flex items-center fixed rounded-full shadow-lg shadow-[#00000033] " +
                (center ? " left-1/2 -translate-x-1/2" : "")
            }
            style={{
                ...{
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 15px rgba(0, 0, 0, 0.1), 0 20px 25px rgba(0, 0, 0, 0.1)"
                }, ...width < 1024 ? {zoom: 1} : {}
            }}
        >

            <div className={"flex items-center justify-center"}>
                <LogoComponent viewBox={"0 0 35 28"}
                               className={width < 1024 ? "w-10 h-10 mx-auto" : "w-12 h-12 mx-auto"}/>
                <h2 className={`text-${width < 1024 ? "xl" : "2xl"} ml-2 font-semibold text-center text-white`}>Kuduga
                    AI</h2>
            </div>
            <Dropdown placement="bottom-start" className={"bg-primary-900"}>
                <DropdownTrigger>
                    <User
                        as="button"
                        avatarProps={{
                            className: width < 1024 ? "w-8 h-8" : "",
                            isBordered: true,
                            src: userInfo ? `https://avatars.githubusercontent.com/u/${userInfo.userId}?v=4&size=64` : undefined,
                        }}
                        className="transition-transform ml-auto"
                        name={userInfo ? userInfo.username : "Not signed in"}
                    />
                </DropdownTrigger>
                <DropdownMenu aria-label="User Actions" variant="flat" color={"primary"}>
                    {userInfo ? <DropdownItem key="profile" className="h-14 gap-2">
                        <p className="font-bold">Signed in as</p>
                        <p className="font-bold">{userInfo.username}</p>
                    </DropdownItem> : <DropdownItem key="profile" className="h-14 gap-2">
                        <p className="font-bold">Currently not</p>
                        <p className="font-bold">Signed in</p>
                    </DropdownItem>}
                    <DropdownItem key="home" onClick={() => router.push("/")}>
                        Beranda
                    </DropdownItem>
                    <DropdownItem key="archive" onClick={() => router.push("/archive")}>
                        Arsip Pertanyaan
                    </DropdownItem>
                    <DropdownItem key="chat" onClick={() => router.push("/chat")}>
                        Chat
                    </DropdownItem>
                    <DropdownItem key="logout" color="danger" onClick={logout}>
                        Log Out
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    )
}
