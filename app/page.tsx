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
        
        let response: Response;
        try {
            // made it work by instantiating a client using node, not the browser
            response = await fetch("http://localhost:62263", {
                method: "POST",
                body: JSON.stringify(requestingDocument)
            });
        } catch(error) {
            console.error(error);
            setOutput("Failed on either the first layer client or the second layer client.");
            return;
        }
        
        console.log(await response.json());

        setOutput("Done!");
    }

    return (
        <body>
            <main>
                <h1>ルビ振り Interface</h1>
                <span style={{ textDecoration: "unset", margin: "15px 15px 15px 15px" }}><a href="https://developer.yahoo.co.jp/sitemap/">Webサービス by Yahoo! JAPAN</a></span>
                <p>Note: This open-source project simply aims to create an client side interface for the API.</p>
                <p>Created by Peter Go. </p>


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
