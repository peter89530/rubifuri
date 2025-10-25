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
    output: object = {};
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
        respondingTicket.output = processedInput.message;

        response.end(JSON.stringify(respondingTicket));
    });
    request.on('error', err => {
        errorify();
        return;
    });
})

startingPoint.listen(62263);