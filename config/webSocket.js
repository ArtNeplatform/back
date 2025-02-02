import expressWs from 'express-ws';
import { response } from './response.js';
import { convertDatesInResult } from './dateFormatter.js'

let webSocketClients = [];

export const initializeWebSocket = (app) => {
    expressWs(app);

    app.ws('/', (ws, req) => {
        console.log('WebSocket 클라이언트가 연결되었습니다.');
        registerWebSocket(ws);
    });
};

export const registerWebSocket = (ws) => {
    webSocketClients.push(ws);

    ws.on('message', (message) => {
        console.log('수신된 메시지:', message);
    });

    ws.on('close', () => {
        console.log('WebSocket 클라이언트가 연결을 종료했습니다.');
        webSocketClients = webSocketClients.filter(client => client !== ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket 오류:', error);
    });
};


export const broadcastToClients = (statusObject, result = null) => {
    const broadcastMessage = response(statusObject, convertDatesInResult(result));
    
    webSocketClients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(broadcastMessage));
        }
    });
};
