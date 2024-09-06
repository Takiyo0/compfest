'use client'

import {setCookie} from "cookies-next";

export default function CookieManager({type, value}: { type: 'SET_OAUTH', value: string }) {

    if (type === 'SET_OAUTH') {
        setCookie('oauth_state', value);
    }

    return <></>
}