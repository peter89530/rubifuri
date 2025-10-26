"use client"

import { useState } from "react";
import { RubiFuriCommunicationDocument, RubiFuriServerResponse } from "./handler";
import { v4 as uuid } from "uuid";

export default function Home() {
    let [output, setOutput] = useState<string>("");


    async function createRequest(requestingSentence: string, apiKey: string) {
        setOutput("Making a request through the Yahoo!デベロッパーネットワーク credentials provided...");
        
        // The requestingDocument is required to be passed over to the internally run server if anything is going to work.
        // It contains the sentence (in Kanji) to ルビ振り, a uuid to identify this request (although we could probably do without one)
        // and the most important API Key.
        let requestingDocument: RubiFuriCommunicationDocument = {
            convert: requestingSentence,
            id: uuid(),
            apiKey: apiKey
        };
        
        let response: RubiFuriServerResponse;

        try {
            // made it work by instantiating a secondary client using node, not the browser
            const responseSecondary = await fetch("http://localhost:62263", {
                method: "POST",
                body: JSON.stringify(requestingDocument)
            });

            response = await responseSecondary.json();
            console.assert(response.output !== undefined && response.output !== null);
        } catch(error) {
            console.error(error);
            setOutput("Failed on either the first layer client or the second layer client.");
            return;
        }

        console.log(response.output);
        
        setOutput("Done!");
        try {
            setOutput("Furigana: " + response.output!.flattened);
        } catch {
            console.log(response.output);
        }
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
