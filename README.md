# WhatsApp Clone Chat Application

A real-time chat application built with Node.js, Express, and Socket.IO that mimics WhatsApp's core features. This application supports private messaging, read receipts, typing indicators, and works seamlessly on both desktop and mobile devices.

## Preview

The application provides a WhatsApp-like interface with the following features:
- **Desktop View**: Two-panel layout with users list and chat area
- **Mobile View**: Responsive design with collapsible sidebar
- **Dark/Light Theme**: Support for both light and dark modes
- **Real-time Updates**: Instant messaging, typing indicators, and read receipts

## Technologies Used

- **Node.js** - Runtime environment
- **Express** (^4.21.2) - Web application framework
- **Socket.IO** (^4.8.1) - Real-time bidirectional event-based communication
- **EJS** (^3.1.10) - Templating engine
- **Express Session** (^1.18.1) - Session management

## Dependencies

```json
{
  "dependencies": {
    "ejs": "^3.1.10",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "socket.io": "^4.8.1"
  },
  "scripts": {
    "start": "node server.js"
  }
}
```

## Project Structure

```
/
├── server.js              # Main application entry point
├── package.json          # Project dependencies and scripts
├── public/              # Static assets
│   ├── css/
│   │   └── style.css    # Application styles
│   └── js/
│       └── chat.js      # Client-side chat functionality
├── views/               # EJS templates
│   ├── login.ejs       # Login page template
│   └── chat.ejs        # Main chat interface template
```

## File Descriptions

### server.js
The main application file that:
- Sets up Express server and middleware
- Configures Socket.IO for real-time communication
- Handles user sessions
- Manages routes
- Implements WebSocket event handlers for:
  - User connections
  - Private messaging
  - Read receipts
  - Typing indicators

### public/css/style.css
Contains all styling for the application, including:
- Light/dark theme support using CSS variables
- Responsive design with mobile-first approach
- WhatsApp-like UI components and animations
- Message bubbles and status indicators
- User list styling and animations
- Typing indicators and notifications
- Profile pictures with dynamic initials

### public/js/chat.js
Client-side JavaScript that handles:
- Socket.IO event listeners and emitters
- Message display and formatting
- Real-time typing indicators with debouncing
- Read receipt management and status updates
- User interface updates and animations
- Mobile responsive behavior and touch events
- Theme switching and persistence

### views/login.ejs
Login page template featuring:
- Clean and simple user name input
- Theme toggle with icon changes
- Responsive design for all devices
- Basic form validation
- Smooth animations and transitions

### views/chat.ejs
Main chat interface template with:
- Online users list with status indicators
- Real-time chat area with message history
- Message input with typing indicator
- Theme toggle in header
- Mobile-responsive navigation
- Status indicators for messages
- Profile pictures with initials

## Features

1. **User Authentication**
   - Session-based user management
   - Name-based user identification
   - Persistent sessions

2. **Real-time Communication**
   - Private messaging between users
   - Instant message delivery
   - Typing indicators with debouncing
   - Read receipts with status updates

3. **UI/UX Features**
   - WhatsApp-like interface
   - Light/dark theme with persistent preference
   - Responsive design for all screen sizes
   - Profile pictures with dynamic initials
   - Message status indicators
   - Real-time online user list
   - Smooth animations and transitions

4. **Mobile Support**
   - Touch-friendly interface
   - Collapsible sidebar with gesture support
   - Adaptive layout for different screens
   - Mobile-optimized input handling
   - Native-like feel on mobile devices

## Implementation Details

### Messaging System
- Uses Socket.IO for real-time message delivery
- Implements message status tracking (sent, delivered, read)
- Maintains chat history during session
- Supports typing indicators with timeout
- Handles message delivery confirmation

### User Interface
- Responsive design using CSS media queries
- Mobile-first approach for better performance
- CSS variables for dynamic theming
- Flexbox layout for responsive components
- Smooth animations and transitions

### Real-time Features
- Typing indicators with smart debouncing
- Instant read receipts with status updates
- Online user status updates in real-time
- Real-time user list updates
- Message delivery confirmation

### Mobile Optimizations
- Touch-friendly buttons and inputs
- Gesture-based navigation
- Adaptive message container sizes
- Mobile-specific event handling
- Performance optimizations for mobile

## Setup and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Access the application:
   - Open http://localhost:3000 in your browser
   - Works on both desktop and mobile devices
   - Test in multiple browsers for real-time features

## Technical Considerations

- Uses in-memory storage for messages and user data
- Session-based user management with Express
- Real-time event handling with Socket.IO
- Responsive design with CSS media queries
- Mobile-first approach to UI/UX
- Performance optimizations for mobile devices
- Cross-browser compatibility
- Touch device support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS and Android)

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
