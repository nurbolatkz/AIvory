# AIvory Telegram Bot

This is a Telegram bot that integrates with a React web app. It uses the python-telegram-bot library to handle bot commands and interactions.

## Project Structure

```
AIvory/
├── backend/          # Python Telegram bot
│   ├── bot.py
│   ├── requirements.txt
│   ├── .env
│   └── .gitignore
└── frontend/         # React web app
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── App.css
        ├── TrendRider.js
        ├── index.js
        ├── index.css
        ├── components/
        │   ├── Header.js
        │   ├── TrendingEffectsCarousel.js
        │   ├── UploadSection.js
        │   ├── GenerateButton.js
        │   └── BottomNavigation.js
        └── styles/
            ├── TrendRider.css
            ├── Header.css
            ├── TrendingEffectsCarousel.css
            ├── UploadSection.css
            ├── GenerateButton.css
            └── BottomNavigation.css
```

## Backend Setup

1. Install the required dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

2. The `.env` file in the backend directory should contain your bot token and web app URL:
   ```
   BOT_TOKEN=your_bot_token_here
   WEB_APP_URL=http://localhost:3000
   ```

3. Get a bot token from [@BotFather](https://t.me/BotFather) on Telegram.

4. Replace the placeholder values in your `.env` file with your actual bot token and web app URL.

## Running the Bot

```
cd backend
python bot.py
```

The bot will start and listen for commands on Telegram.

## Frontend Development

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The React app will be available at http://localhost:3000. When developing, you can interact with your Telegram bot to open this web app.

## Component Structure

The frontend is organized into the following components:

1. **TrendRider.js** - Main component that manages state and orchestrates the other components
2. **Header.js** - Top navigation bar with app title and settings
3. **TrendingEffectsCarousel.js** - Horizontal carousel of trending effects
4. **UploadSection.js** - Media upload section with camera/upload options
5. **GenerateButton.js** - Generate button with loading states
6. **BottomNavigation.js** - Tab navigation at the bottom

Each component has its own CSS file in the `styles` directory for better organization and maintainability.

## Styling Approach

The project uses a modular CSS approach with component-specific stylesheets:

- Each component has its own CSS file in the `styles` directory
- Styles are scoped to their respective components
- Modern CSS features like Flexbox, Grid, and gradients are used
- Responsive design principles are applied
- Visual enhancements like shadows, transitions, and animations improve UX

### Key Styling Features

1. **Trending Effects Cards**:
   - Larger, more visually appealing cards (280px wide, 380px tall)
   - Hover effects with elevation and scaling
   - Smooth transitions and animations
   - Platform-specific styling
   - Improved typography and information hierarchy

2. **Upload Section**:
   - Glassmorphism design with backdrop blur
   - Clear visual hierarchy
   - Interactive buttons with hover effects
   - Consistent styling with the overall theme

3. **Generate Button**:
   - Prominent gradient background
   - Animated icon during processing
   - Hover and active states for better feedback
   - Subtle shine animation effect

4. **Navigation**:
   - Modern glass-like appearance
   - Active state highlighting
   - Smooth transitions
   - Consistent icon and text styling

## Deployment

For production deployment, you'll need to:

1. Build the React app:
   ```
   cd frontend
   npm run build
   ```

2. Host the built files on a web server or static hosting service.

3. Update the WEB_APP_URL in your backend [.env](file:///c:/Users/User/Desktop/MyWork/AIvory/backend/.env) file to point to your deployed frontend URL.

4. Deploy your backend Python code to a server with Python support.

This structure separates concerns and makes it easier to manage both the backend and frontend components of your application.