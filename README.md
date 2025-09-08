# AIvory Telegram Bot

This is a Telegram bot that integrates with a web app. It uses the python-telegram-bot library to handle bot commands and interactions.

## Setup

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Create a `.env` file in the project root with your bot token and web app URL:
   ```
   BOT_TOKEN=your_bot_token_here
   WEB_APP_URL=https://your-web-app-url.com
   ```

3. Get a bot token from [@BotFather](https://t.me/BotFather) on Telegram.

4. Replace the placeholder values in your `.env` file with your actual bot token and web app URL.

## Running the Bot

```
python bot.py
```

The bot will start and listen for commands on Telegram.