const net = require("net");
const server = net.createServer(); //creates an instance of a server

server.on("connection", (clientToProxySocket) => { //once the connection is established, display message   
    console.log("Client connected to proxy");
    clientToProxySocket.once("data", (data) => { //once the client sends data, start the execution of the proxy servers 
        let isConnectionTLS = data.toString().indexOf("CONNECT") !== -1; //check whether its a connect release

        let serverPort = 80;
        let serverAddress;

        if (isConnectionTLS) {
            serverPort = 443; //default port for https

            serverAddress = data
            .toString().split("CONNECT")[1]
            .split(" ")[1]
            .split(":")[0];
        } else {
            serverAddress = data.toString().split("Host: ")[1].split("\n")[0];
        }

        let proxyToServerSocket = net.createConnection(
            {
                host: serverAddress,
                port: serverPort
            },
            () => {
                console.log("Proxy to server is setup");
            }
        )

        if (isConnectionTLS) {
            clientToProxySocket.write("HTTP/1.1 200 OK\r\n\n"); //send response to client that connection is successful
        } else {
            proxyToServerSocket.write(data); //write data from client request to server
        }

        clientToProxySocket.pipe(proxyToServerSocket); //send data from client to server 
        proxyToServerSocket.pipe(clientToProxySocket);// send data from server to client

        proxyToServerSocket.on("error", (err) => { //check whether that is and error 
            console.log("Proxy to server error");
            console.log(err);
        })

        clientToProxySocket.on("error", (err) => {
            console.log("Client to proxy error");
        })
    })
})

server.on("error", (err) => {
    console.log("Internal server error");
    console.log(err);
})

server.on("close", () => {
    console.log("Client disconnected"); 
})

server.listen(
    {
        host: "0.0.0.0",
        port: 3456, //sets the server to listen for connections on the port 3456
    },
    () => {
        console.log("Server listening on 0.0.0.0:3456");
    }
);