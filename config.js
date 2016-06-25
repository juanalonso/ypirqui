var config = {};

config.slack_token = "";
config.slack_bot_name = "ypirqui";

//Probability the bot will reply (0.0: never - 1.0: always)
config.bot_random = 0.05;

//Minimum string length for the bot to reply
config.bot_min_string_length = 9;

//If we sush the bot, amount of time in seconds to be active again
config.bot_mute_time = 300;

module.exports = config;