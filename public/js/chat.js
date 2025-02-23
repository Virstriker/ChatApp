// Initialize Socket.IO with proper configuration for Vercel
const socket = io(window.location.origin, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

let selectedUser = null;
const chatMessages = new Map(); // Store messages for each user
let typingTimeout;

// DOM Elements
const usersList = document.getElementById('usersList');
const chatArea = document.getElementById('chatArea');
const chatTemplate = document.getElementById('chatTemplate');

// Connect to Socket.IO and send user data
socket.on('connect', () => {
    socket.emit('user_connected', currentUser);
});

// Get initials from name
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Update users list when receiving updated list from server
socket.on('users_list', (users) => {
    usersList.innerHTML = '';
    users.forEach(user => {
        if (user.id !== currentUser.id) { // Don't show current user in the list
            const userElement = document.createElement('div');
            userElement.className = `user-item${selectedUser?.id === user.id ? ' active' : ''}`;
            userElement.dataset.userId = user.id;
            
            // Create profile picture with initials
            const profilePic = document.createElement('div');
            profilePic.className = 'profile-pic';
            profilePic.textContent = getInitials(user.name);
            
            // Create name span
            const nameSpan = document.createElement('span');
            nameSpan.textContent = user.name;
            
            // Create notification indicator
            const notificationDot = document.createElement('span');
            notificationDot.className = 'notification-indicator';
            
            userElement.appendChild(profilePic);
            userElement.appendChild(nameSpan);
            userElement.appendChild(notificationDot);
            
            userElement.onclick = () => selectUser(user);
            usersList.appendChild(userElement);
        }
    });
});

// Handle typing indicator
function setupTypingHandler() {
    const messageInput = document.getElementById('messageInput');
    if (!messageInput || !selectedUser) return;

    messageInput.addEventListener('input', () => {
        clearTimeout(typingTimeout);
        socket.emit('typing', { to: selectedUser.id });

        typingTimeout = setTimeout(() => {
            socket.emit('stop_typing', { to: selectedUser.id });
        }, 1000);
    });

    messageInput.addEventListener('blur', () => {
        clearTimeout(typingTimeout);
        socket.emit('stop_typing', { to: selectedUser.id });
    });
}

// Create typing indicator element
function createTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    document.querySelector('.chat-area').appendChild(typingDiv);
    return typingDiv;
}

// Handle receiving private messages
socket.on('private_message', ({ from, message, messageId }) => {
    const messages = getMessages(from);
    messages.push({
        from,
        message,
        type: 'received',
        messageId
    });
    
    if (selectedUser && selectedUser.id === from) {
        displayMessages(messages);
        // Send read receipt
        socket.emit('message_read', { from, messageId });
    } else {
        // Add notification indicator
        const userElement = document.querySelector(`[data-user-id="${from}"]`);
        if (userElement) {
            userElement.classList.add('has-notification');
        }
    }
});

// Handle message status updates
socket.on('message_status', ({ messageId, status }) => {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;

    const messageStatus = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageStatus) {
        messageStatus.textContent = status === 'delivered' ? '✓✓' : '✓✓';
        if (status === 'read') {
            messageStatus.classList.add('read-tick');
        }
    }
});

// Handle typing indicators
socket.on('user_typing', ({ from }) => {
    if (selectedUser && selectedUser.id === from) {
        const typingIndicator = document.querySelector('.typing-indicator') || 
            createTypingIndicator();
        typingIndicator.textContent = `${selectedUser.name} is typing...`;
        typingIndicator.style.display = 'block';
    }
});

socket.on('user_stop_typing', ({ from }) => {
    if (selectedUser && selectedUser.id === from) {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }
});

// Handle connection errors
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
});

// Select a user to chat with
function selectUser(user) {
    selectedUser = user;
    
    // Clear notification
    const userElement = document.querySelector(`[data-user-id="${user.id}"]`);
    if (userElement) {
        userElement.classList.remove('has-notification');
    }
    
    // Update active state in users list
    document.querySelectorAll('.user-item').forEach(el => {
        el.classList.toggle('active', el.dataset.userId === user.id);
    });

    // Set up chat area
    chatArea.innerHTML = chatTemplate.innerHTML;

    // On mobile, hide the sidebar after selecting a user
    if (window.innerWidth <= 768) {
        document.querySelector('.sidebar').classList.remove('show');
    }
    
    // Update chat header
    const chatHeader = document.getElementById('chatHeader');
    chatHeader.innerHTML = `
        <button class="back-button" onclick="showUsersList()">←</button>
        <div class="profile-pic">${getInitials(user.name)}</div>
        <span>${user.name}</span>
    `;
    
    // Set up message input handlers
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    const sendMessage = () => {
        const message = messageInput.value.trim();
        if (message && selectedUser) {
            const messageId = Date.now().toString();
            // Send message to server
            socket.emit('private_message', {
                to: selectedUser.id,
                message,
                messageId
            });
            
            // Add message to local storage and display
            const messages = getMessages(selectedUser.id);
            messages.push({
                message,
                type: 'sent',
                messageId
            });
            displayMessages(messages);
            
            // Clear input
            messageInput.value = '';
            
            // Clear typing indicator
            clearTimeout(typingTimeout);
            socket.emit('stop_typing', { to: selectedUser.id });
        }
    };
    
    sendButton.onclick = sendMessage;
    messageInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };
    
    // Set up typing handler
    setupTypingHandler();
    
    // Display existing messages
    displayMessages(getMessages(user.id));
}

// Get messages for a specific user
function getMessages(userId) {
    if (!chatMessages.has(userId)) {
        chatMessages.set(userId, []);
    }
    return chatMessages.get(userId);
}

// Display messages in the chat area
function displayMessages(messages) {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    messages.forEach(msg => {
        const messageContainer = document.createElement('div');
        messageContainer.className = `message-container ${msg.type}`;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${msg.type}`;
        messageElement.textContent = msg.message;
        
        const statusElement = document.createElement('div');
        statusElement.className = 'message-status';
        if (msg.type === 'sent') {
            statusElement.dataset.messageId = msg.messageId;
            statusElement.textContent = '✓'; // Single tick by default
        }
        
        messageContainer.appendChild(messageElement);
        messageContainer.appendChild(statusElement);
        messagesContainer.appendChild(messageContainer);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
