# Lock In - User Profile Dashboard

A modern web application for displaying user profile data, experience points, and learning statistics from a GraphQL API.

## Project Overview

Lock In is a web application that provides users with a comprehensive dashboard to view their profile information, experience points (XP), audit ratios, project success rates, and skills overview. The application authenticates users via a JWT token and fetches data from a GraphQL API.

### Features

- User authentication with JWT
- Profile information display
- XP tracking and visualization
- Audit ratio statistics
- Project success visualization
- Skills overview
- Responsive design with Tailwind CSS

## Project Structure

The project has been organized into a modular structure following JavaScript best practices:

```
/
├── index.html          # Main HTML file
├── style.css           # Basic styling
├── js/                 # JavaScript modules
│   ├── main.js         # Application initialization and event listeners
│   ├── auth.js         # Authentication-related functionality
│   ├── api.js          # API communication and GraphQL queries
│   ├── data.js         # Data processing and transformation
│   ├── utils.js        # Utility functions
│   ├── ui/             # UI rendering modules
│   │   ├── index.js    # UI module exports
│   │   ├── userInfo.js # User information rendering
│   │   ├── xpData.js   # XP data rendering
│   │   ├── auditRatio.js # Audit ratio rendering
│   │   ├── projects.js # Project success rendering
│   │   └── skills.js   # Skills overview rendering
│   └── charts/         # Chart rendering modules
│       ├── index.js    # Charts module exports
│       ├── xpProgress.js # XP progress chart
│       └── projectSuccess.js # Project success chart
└── README.md           # This file
```

## Module Responsibilities

### main.js
- Application initialization
- DOM content loaded event handling
- Login form event listener
- Logout button event listener
- Orchestration of data loading and UI rendering

### auth.js
- JWT token validation
- Login functionality
- Logout functionality
- Token storage and retrieval

### api.js
- GraphQL query definitions
- Fetch API wrapper for GraphQL
- Error handling for API requests

### data.js
- Data processing and transformation
- User data structure creation
- XP calculations
- Project statistics calculations

### utils.js
- Utility functions
- JWT token validation
- Helper methods

### UI Modules
- Render different sections of the dashboard
- Handle UI-specific error states
- Update DOM elements with user data

### Chart Modules
- Render data visualizations
- Handle chart-specific calculations and rendering

## How to Run the Application

1. Clone or download the repository to your local machine
2. Ensure all files maintain their relative paths as shown in the project structure
3. Open the project in a web server (you can use a local development server or any static file server)
4. Access the application through a web browser by navigating to the index.html file

### Using a Local Development Server

If you have Node.js installed, you can use a simple HTTP server:

```bash
# Install a simple HTTP server globally
npm install -g http-server

# Navigate to the project directory
cd path/to/project

# Start the server
http-server

# Access the application at http://localhost:8080
```

Alternatively, you can use Python's built-in HTTP server:

```bash
# Python 3
python3 -m http.server

# Access the application at http://localhost:8000
```

## Authentication

The application uses JWT (JSON Web Token) for authentication. When a user logs in, the application:

1. Sends credentials to the authentication endpoint
2. Receives a JWT token upon successful authentication
3. Stores the token in localStorage
4. Uses the token for subsequent API requests

The token is validated on application startup, and if valid, the user is automatically logged in.
## Contributing
Contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request.
## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.