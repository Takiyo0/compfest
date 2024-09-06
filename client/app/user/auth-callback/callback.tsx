'use client'

import {setCookie} from "cookies-next";
import {ApiManager} from "@/app/managers/api";
import React from "react";

export default function Callback({token}: { token: string }) {
    const interval = React.useRef<NodeJS.Timeout>();
    React.useEffect(() => {
        setCookie('Authorization', ApiManager.Encrypt(token));
        interval.current = setTimeout(() => {
            window.location.href = '/';
        }, 1000);

        return () => clearInterval(interval.current);
    }, []);
    return <></>
}