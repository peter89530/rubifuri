"use client"

import { useState } from "react";
import { RubiFuriCommunicationDocument } from "./handler";
import { v4 as uuid } from "uuid";

export default function Home() {
    let [output, setOutput] = useState<string>("");


    async function createRequest(requestingSentence: string, apiKey: string) {
        setOutput("Making a request through the Yahoo!デベロッパーネットワーク credentials provided...");

        let requestingDocument: RubiFuriCommunicationDocument = {
            convert: requestingSentence,
            id: uuid(),
            apiKey: apiKey
        }
        
        const response = await fetch("http://localhost:62263", {
            method: "POST",
            body: JSON.stringify(requestingDocument)
        })

        // This will never work because of browser security issues. Yahoo is returning a perfectly fine response, but JS can never access a cross-origin response body. You can use devtools to view it tho
        console.log(await response.json());
        setTimeout(() => {
            console.log(response);
        },1000);

        // .then((results) => {
        //     if (results.status === 401) {
        //         setOutput("There was an Authentication failure. The error code is 401.");
        //         return;
        //     }
    
            
        //     console.log(results.headers);
        //     console.log(results.arrayBuffer());
        //     console.log(results.text());
        //     console.log(results.json());
        //     console.log(results.bytes());
        // }).then((readOutput) => {
        //     if (!readOutput.done) {
        //         setOutput("There was a response processing error.");
        //         return;
        //     }
            
        //     setOutput("Done!");
        //     console.info(readOutput.value);
        // }).catch((error) => {
        //     if (error)
        //     setOutput("The Yahoo!デベロッパーネットワーク denied your request or responded with a malformed response.");
        //     console.error(error);
        // })
    }

    return (
        <body>
            <main>
                <h1>rubifuri (ルビ振り) Interface</h1>
                <p>Note: This open-source project simply aims to create an client side interface for the API.</p>

                <span style={{ textDecoration: "unset", margin: "15px 15px 15px 15px" }}><a href="https://developer.yahoo.co.jp/sitemap/">Webサービス by Yahoo! JAPAN</a></span>

                <input id="apiKey" type="password" placeholder="App ID"></input>
                <input id="in" placeholder="Kanji Input"></input>
                <button onClick={(event) => {
                    const input = (document.getElementById("in") as HTMLInputElement).value;
                    const key = (document.getElementById("apiKey") as HTMLInputElement).value;
                    console.log(input, key);
                    createRequest(input, key);
                }}>Request Furigana</button>
                <p>{output}</p>
            </main>
        </body>
    );
}
