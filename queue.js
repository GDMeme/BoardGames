export function queue() {    
    connect().then(function(ws) {
        // TODO: server is ready here
    }).catch(function(err) {
        console.error(err);
    });

    // Listen for messages
    ws.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);

    });
};

function connect() {
    return new Promise(function(resolve, reject) {
        var ws = new WebSocket('wss://localhost:8080');
        ws.onopen = function() {
            console.log("Established websocket connection!")
            resolve(ws);
        };
        ws.onerror = function(err) {
            reject(err);
        };
    });
}

// TODO: run start() once a "start game" button is pressed

// TODO: UID only needs to be known server-side