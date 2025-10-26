// handler.ts




// let totalLength = response["result"]["word"].length;

// let furiganaExport = [];
// let furiganaLookupIndex = 0;

// for (let index = 0; index < totalLength; index++) {
//     const word = response["result"]["word"].at(index);

//     if (word["furigana"] === undefined) {
//         try {
//             furiganaExport[furiganaLookupIndex - 1] = furiganaExport[furiganaLookupIndex - 1] + word[furiganaLookupIndex]["surface"];
//         } catch {
//             continue;
//         }
//     } else {
//         furiganaExport[furiganaLookupIndex] = word["furigana"];
//         furiganaLookupIndex += 1;
//     }
// }

// console.log(totalLength);
// console.log(furiganaExport.length);
// furiganaExport.forEach((value) => {
//     console.log(value);
// })

import { createServer } from "http";


// yanked from https://developer.yahoo.co.jp/webapi/jlp/furigana/v2/furigana.html#:~:text=%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89
// the URL looks so long due to Japanese encodeURIComponent. It's just the documentation for the API.
export interface YahooResponse {
    id: string | number,
    jsonrpc: "2.0",
    result: {
        word: Array<{
            surface: string,
            furigana: string,
            roman: string,
            subword: Array<{
                surface: string,
                furigana: string,
                roman: string
            }>
        }>
    }
}


export class RubiFuriServerResponse {
    state: number = 200;
    errored: {
        state: boolean,
        message: string
    } = {
        state: false, 
        message: ""
    }
    input: string = "";
    output?: YahooResponse;
}

export interface RubiFuriCommunicationDocument {
    convert: string,
    id: string,
    apiKey: string
}
interface RubiFuriInterprocessCommunication {
    state: boolean,
    message: object
}


async function processInput(requestDocument: RubiFuriCommunicationDocument): Promise<RubiFuriInterprocessCommunication> {
    const requestEndpoint = "https://jlp.yahooapis.jp/FuriganaService/V2/furigana?";
    
    const query = {
        "id": Math.round(Math.random() * 100),
        "jsonrpc": "2.0",
        "method": "jlp.furiganaservice.furigana",
        "params": {
            "q": requestDocument.convert,
            "grade": 1,
        }
    }
    
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("User-Agent", `Yahoo AppID: ${requestDocument.apiKey}`);
    
    let yahooResponse: Response;
    let yahooResponseParsed: object;
    try {
        yahooResponse = await fetch(requestEndpoint, {
            mode: "no-cors",
            method: "POST",
            body: JSON.stringify(query),
            headers: headers
        });

        yahooResponseParsed = await yahooResponse.json();
    } catch {
        return({
            state: false,
            message: ["Error while contacting the Yahoo Developer Network."]
        });
    }

    return({
        state: true,
        message: yahooResponseParsed
    });
}

const startingPoint = createServer((request, response) => {
    function errorify() {
        respondingTicket.state = 500;
        respondingTicket.errored = {
            state: true,
            message: "Internal Error with Request object."
        };
        respondingTicket.input = body;

        response.end(JSON.stringify(respondingTicket));
    }

    let body: string = "";
    let bodyArray: Uint8Array[] = [];

    let respondingTicket: RubiFuriServerResponse = new RubiFuriServerResponse();

    request.on("data", chunk => {
        bodyArray.push(chunk);
    });
    request.on('end', async () => {
        body = Buffer.concat(bodyArray).toString();

        let processedInput: RubiFuriInterprocessCommunication;
        try {
            processedInput = await processInput(JSON.parse(body) as RubiFuriCommunicationDocument);
        } catch {
            errorify();
            return;
        }

        if (processedInput.state === false) { errorify(); return; }
        respondingTicket.state = 200;
        respondingTicket.errored = {
            state: false,
            message: ""
        };
        respondingTicket.input = body;
        respondingTicket.output = processedInput.message as YahooResponse;

        response.appendHeader("Access-Control-Allow-Origin", "http://localhost:6226");
        response.end(JSON.stringify(respondingTicket));
    });
    request.on('error', err => {
        errorify();
        return;
    });
})

startingPoint.listen(62263);