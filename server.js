const express = require('express');
const WebSocket = require('ws');

// Create an Express server
const app = express();
const server = app.listen(3000, () => console.log('Server running on port 3000'));

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

// Store player data
let players = {};

// Handle new player connections
wss.on('connection', (ws) => {
    // Generate a unique player ID (use it to track this player)
    const playerId = generatePlayerId();
    players[playerId] = { x: 100, y: 100, jump: false };  // Initial position

    // Send initial data to the new player
    ws.send(JSON.stringify({ type: 'initial', players }));

    // Handle messages from the client (e.g., player movement or jumping)
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'move') {
            // Update player position
            players[playerId] = { ...players[playerId], x: data.x, y: data.y };
        } else if (data.type === 'jump') {
            // Update jump status
            players[playerId].jump = data.jump;
        }

        // Broadcast updated player data to all connected clients
        broadcastPlayers();
    });

    // Handle player disconnection
    ws.on('close', () => {
        delete players[playerId];
        broadcastPlayers();
    });
});

// Broadcast player data to all clients
function broadcastPlayers() {
    const playerData = Object.values(players);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'players', players: playerData }));
        }
    });
}

// Function to generate a unique player ID
function generatePlayerId() {
    return Math.random().toString(36).substr(2, 9); // Random string for player ID
}
