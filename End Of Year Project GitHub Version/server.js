// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: 8080 });

// let clients = []; // Track all connected clients
// let scores = { X: 0, O: 0 }; // Initialize scores for X and O

// let game = {
//     board: Array(9).fill(null),
//     currentPlayer: 'X',
//     winner: null
// };

// function resetGame() {
//     game.board = Array(9).fill(null);
//     game.currentPlayer = 'X';
//     game.winner = null;
//     broadcastGameState();
// }

// function checkWinner() {
//     const winningCombinations = [
//         [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
//         [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
//         [0, 4, 8], [2, 4, 6]             // diagonals
//     ];

//     for (let combo of winningCombinations) {
//         const [a, b, c] = combo;
//         if (game.board[a] && game.board[a] === game.board[b] && game.board[a] === game.board[c]) {
//           console.log(`Winner found: ${game.board[a]}`); // Add this for debugging
//             return game.board[a];
//         }
//     }

//     if (!game.board.includes(null)) return 'Tie'; // No spaces left
//     return null;
// }

// function broadcastGameState() {
//     const state = {
//         type: 'gameState',
//         board: game.board,
//         currentPlayer: game.currentPlayer,
//         winner: game.winner,
//         scores // Include scores in the game state broadcast
//     };
//     clients.forEach(client => client.send(JSON.stringify(state)));
// }


// function broadcastMessage(message, senderWs) {
//   clients.forEach(client => {
//       if (client !== senderWs && client.readyState === WebSocket.OPEN) {
//           client.send(JSON.stringify({ type: 'chat', message: message }));
//       }
//   });
// }

// wss.on('connection', function connection(ws) {
//     if (clients.length >= 2) {
//         ws.send(JSON.stringify({ type: 'error', message: 'Room full' }));
//         ws.close();
//         return;
//     }

//     ws.playerSymbol = clients.length === 0 ? 'X' : 'O';
//     clients.push(ws);

//   // Inform the client of their assigned symbol
//   ws.send(JSON.stringify({ type: 'info', message: `Welcome! You are '${ws.playerSymbol}'.` }));

//   ws.on('message', function incoming(data) {
//     const msg = JSON.parse(data);

//     if (msg.type === 'move') {
//       if (ws.playerSymbol === game.currentPlayer) {
//           const position = parseInt(msg.index);
//           if (!isNaN(position) && game.board[position] === null) {
//               // Update the board with the current player's move
//               game.board[position] = game.currentPlayer;
//               console.log("Current board state:", game.board);
//               // Now, check for a winner or a tie
//               const winner = checkWinner();
              
//               if (winner) {
//                   game.winner = winner;
//                   if (winner !== 'Tie') {
//                       console.log(`Winner found: ${winner}`); // Debugging
//                       scores[winner] += 1; // Update score for the winner
//                       console.log(`Scores updated: X - ${scores.X}, O - ${scores.O}`);
//                   } else {
//                       console.log('The game is a tie.');
//                   }

//                   // Reset the game after a short delay
//                   setTimeout(() => {
//                       resetGame();
//                       console.log("Game reset.");
//                   }, 3000);
//               } else {
//                   // No winner yet, switch the current player
//                   game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
//               }

//               // Broadcast the updated game state after every move
//               broadcastGameState();
//           }
//       } else {
//           ws.send(JSON.stringify({ type: 'error', message: 'Not your turn.' }));
//       }
//   }
//     // Handle chat messages
//     else if (msg.type === 'chat') {
//       broadcastMessage(msg.message, ws);
//     }
//   });

//   ws.on('close', () => {
//     clients = clients.filter(client => client !== ws);
//     if (clients.length < 2 && game.winner) {
//       resetGame(); // Reset the game if a player leaves
//     }
//   });
// });

// console.log('Server started on ws://63.33.41.169:8080');






const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

class GameSession {
    constructor(id) {
        this.id = id;
        this.clients = [];
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.scores = { X: 0, O: 0 };
    }

    addClient(client) {
        if (this.clients.length < 2) {
            this.clients.push(client);
            client.playerSymbol = this.clients.length === 1 ? 'X' : 'O';
            client.session = this; // Reference to the session
            this.sendMessageToAll(`Player ${client.playerSymbol} has joined the game.`);
            if (this.clients.length === 2) {
                this.startGame();
            }
            return true;
        }
        return false;
    }

    removeClient(client) {
        // Remove the client from the session
        this.clients = this.clients.filter(c => c !== client);
    
        // Notify remaining clients (if any) about the disconnection
        this.sendMessageToAll(`Player ${client.playerSymbol} has disconnected.`);
    
        // Additional logic here to handle the game after disconnection, e.g., auto-win for the remaining player
        if (this.clients.length === 1) {
            // Assuming you want to end the game and declare the remaining player as the winner
            this.winner = this.clients[0].playerSymbol;
            this.broadcastGameState();
        }
    }

    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X'; // Or consider alternating the starting player
        this.winner = null;
        this.broadcastGameState();
    }
    

    startGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.winner = null;
        this.broadcastGameState();
    }

    handleMessage(client, message) {
        const msg = JSON.parse(message);

        if (msg.type === 'move' && client.playerSymbol === this.currentPlayer) {
            this.handleMove(client, parseInt(msg.index));
        } else if (msg.type === 'chat') {
            const chatMessage = JSON.stringify({
                type: 'chat',
                message: `[${client.playerSymbol}]: ${msg.message}`
            });
            this.sendMessageToAll(chatMessage, client); // Pass the sender as the second argument
        }
        
    }

    handleMove(client, index) {
        if (!this.winner && this.board[index] === null) {
            this.board[index] = client.playerSymbol;
            this.checkWinner();
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.broadcastGameState();
        }
    }

    checkWinner() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];
        for (let line of lines) {
            const [a, b, c] = line;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winner = this.board[a];
                this.scores[this.winner] += 1;
                this.broadcastGameState();
                setTimeout(() => this.resetGame(), 3000); // Reset after 3 seconds
                return;
            }
        }
        if (!this.board.includes(null) && !this.winner) {
            this.winner = 'Tie';
            this.broadcastGameState();
            setTimeout(() => this.resetGame(), 3000); // Reset after 3 seconds
        }
    }
    

    broadcastGameState() {
        const state = {
            type: 'gameState',
            board: this.board,
            currentPlayer: this.currentPlayer,
            winner: this.winner,
            scores: this.scores
        };
        this.sendMessageToAll(JSON.stringify(state));
    }

    sendMessageToAll(message, sender = null) {
        this.clients.forEach(client => {
            if (client !== sender) { // Check if the client is not the sender
                client.send(message);
            }
        });
    }
    
}

class SessionManager {
    constructor() {
        this.sessions = [];
        this.nextSessionId = 1;
    }

    findOrCreateSession() {
        let session = this.sessions.find(session => session.clients.length < 2);
        if (!session) {
            session = new GameSession(this.nextSessionId++);
            this.sessions.push(session);
        }
        return session;
    }
}

const sessionManager = new SessionManager();

wss.on('connection', function connection(ws) {
    const session = sessionManager.findOrCreateSession();
    if (!session.addClient(ws)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Could not join a session. Try again later.' }));
        ws.close();
        return;
    }

    ws.on('message', function incoming(message) {
        session.handleMessage(ws, message);
    });

    ws.on('close', () => {
        if (ws.session) {
            ws.session.removeClient(ws);
            
            // If after removal, the session has no clients, you might want to remove the session itself
            if (ws.session.clients.length === 0) {
                sessionManager.sessions = sessionManager.sessions.filter(session => session.id !== ws.session.id);
            }
        }
    });
});

console.log('Server started on Local');
