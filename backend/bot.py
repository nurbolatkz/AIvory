# This is the Python backend for your Telegram Mini App.
# It uses the python-telegram-bot library to handle bot commands
# and open the web app.

import logging
import os
from dotenv import load_dotenv
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

# Load environment variables from .env file
load_dotenv()

# Set up logging for a clean console output
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logging.getLogger("httpx").setLevel(logging.WARNING)

# You will need to replace these with your actual bot token and web app URL.
# The URL must be an HTTPS URL.
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Sends a message with a button to open the web app."""
    # Create the keyboard button for the web app
    keyboard = [
        [KeyboardButton("Launch TrendRider Mini App", web_app=WebAppInfo(url=WEB_APP_URL))]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    
    # Send the welcome message with the web app button
    await update.message.reply_text(
        "TrendRider-ге қош келдің, досым! 👋 Төмендегі кнопканы басып, Мини аппты аш та, өз контентіңді жарқыратып таста 😉🔥",
        reply_markup=reply_markup
    )
    
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles messages from the web app."""
    message = update.message
    # Check if the message contains web app data
    if message.web_app_data:
        data = message.web_app_data.data
        logging.info(f"Received data from web app: {data}")
        await message.reply_text(f"Thank you for your submission from the mini app! Received: {data}")
    else:
        # For any other text message, just echo it back
        await message.reply_text("I'm a bot for a web app. Please use the button to launch the mini app.")


def main() -> None:
    """Start the bot."""
    # Check if BOT_TOKEN is available
    if not BOT_TOKEN:
        raise ValueError("BOT_TOKEN not found in environment variables. Please check your .env file.")
    
    application = Application.builder().token(BOT_TOKEN).build()

    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    
    # Add a message handler to process data sent from the web app
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    # Run the bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()

# To run this bot:
# 1. Install the required library: `pip install python-telegram-bot python-dotenv`
# 2. Get a bot token from @BotFather on Telegram.
# 3. Replace 'YOUR_BOT_TOKEN_HERE' and 'https://your-mini-app-url.com' with your values in the .env file.
# 4. Run the script: `python bot.py`