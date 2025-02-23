const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Session middleware with more secure settings for production
app.use(session({
    secret: 'whatsapp_clone_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Set views directory explicitly for Vercel
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files with explicit path
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Store online users
const onlineUsers = new Map(); // Map(userId => {id, name, socketId})
const privateChats = new Map(); // Map(roomId => Set(userId))

// Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/chat');
    } else {
        res.render('login');
    }
});

app.post('/login', (req, res) => {
    const { username } = req.body;
    if (username) {
        req.session.user = {
            id: Date.now().toString(),
            name: username
        };
        res.redirect('/chat');
    } else {
        res.redirect('/');
    }
});

app.get('/chat', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('chat', { 
        user: {
            id: req.session.user.id,
            name: req.session.user.name
        }
    });
});

// Add logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Socket.IO handlers
io.on('connection', (socket) => {
    let userId;

    socket.on('user_connected', (user) => {
        if (user && user.id) {
            userId = user.id;
            onlineUsers.set(userId, {
                id: user.id,
                name: user.name,
                socketId: socket.id
            });
            
            // Broadcast online users list to everyone
            io.emit('users_list', Array.from(onlineUsers.values()));
        }
    });

    socket.on('private_message', ({ to, message }) => {
        const toUser = onlineUsers.get(to);
        if (toUser) {
            const messageId = Date.now().toString();
            socket.to(toUser.socketId).emit('private_message', {
                from: userId,
                message,
                messageId
            });
            // Send delivery status back to sender
            socket.emit('message_status', {
                messageId,
                status: 'delivered'
            });
        }
    });

    socket.on('message_read', ({ from, messageId }) => {
        const fromUser = onlineUsers.get(from);
        if (fromUser) {
            socket.to(fromUser.socketId).emit('message_status', {
                messageId,
                status: 'read'
            });
        }
    });

    socket.on('typing', ({ to }) => {
        const toUser = onlineUsers.get(to);
        if (toUser) {
            socket.to(toUser.socketId).emit('user_typing', { from: userId });
        }
    });

    socket.on('stop_typing', ({ to }) => {
        const toUser = onlineUsers.get(to);
        if (toUser) {
            socket.to(toUser.socketId).emit('user_stop_typing', { from: userId });
        }
    });

    socket.on('disconnect', () => {
        if (userId) {
            onlineUsers.delete(userId);
            io.emit('users_list', Array.from(onlineUsers.values()));
        }
    });
});

// Handle Vercel serverless environment
if (process.env.VERCEL) {
    module.exports = app;
} else {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
