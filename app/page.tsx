"use client"

import { useState } from "react";
import { v4 as uuid } from "uuid";

export default function Home() {
    let [output, setOutput] = useState<string>("");


    async function createRequest(requestingSentence: string, apiKey: string) {
        setOutput("Making a request through the Yahoo!デベロッパーネットワーク credentials provided...");

        const jsonRpcContents = {
            "id": uuid(),
            "jsonrpc": "2.0",
            "method": "jlp.furiganaservice.furigana",
            "params": {
                "q": requestingSentence,
                "grade": 1
            }
        }

        const headers = new Headers();
        headers.append("Content-Length", `${Buffer.byteLength(JSON.stringify(jsonRpcContents), "utf8")}`);
        headers.append("User-Agent", `Yahoo AppID: ${apiKey}`);

        const results = await fetch("https://jlp.yahooapis.jp/FuriganaService/V2/furigana", {
            mode: "no-cors",
            method: "POST",
            headers: headers,
            body: JSON.stringify(jsonRpcContents),
        });

        console.info(results.json());
    }

    return (
        <main>
            <h1>rubifuri (ルビ振り) Interface</h1>
            <p>Note: A Yahoo!デベロッパーネットワーク Account and Client ID are required to access the API. All usage of the API is subject to the Yahoo!デベロッパーネットワーク利用規約. This project simply aims to create an interface for the API.</p>
            <input id="apiKey" type="password" placeholder="App ID"></input>
            <input id="in" placeholder="Kanji Input"></input>
            <button onClick={(event) => {
                const input = (document.getElementById("in") as HTMLInputElement).value;
                const key = (document.getElementById("apiKey") as HTMLInputElement).value;
                createRequest(input, key);
            }}>Request Furigana</button>
            <p>{output}</p>
        </main>
    );
}
