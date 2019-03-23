var SlackBot = require('slackbots');
var config = require('../config.js');

var mutedChannels = [];

//Mysterious chunk of code required for the bot to run on heroku
//If left out, the conecction breaks after one minute with
//the dreaded Error R10 (Boot timeout) -> Web process failed to 
//bind to $PORT within 60 seconds of launch

var http = require('http');
http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.send('it is running\n');
}).listen(process.env.PORT || 5000);
//Mysterious chunk of code required for the bot to run on heroku


var bot = new SlackBot({

    token: process.env.slack_token || config.slack_token,
    name: config.slack_bot_name

});


bot.on('start', function() {

    var self = this;

    //get bot's data
    this.bot_full_data = this.users.filter(function(user) {
        return user.name === self.name;
    })[0];

    //some global helpers
    this.bot_id_as_user = this.bot_full_data.id;
    this.bot_id_as_mention = '<@' + this.bot_full_data.id + '>';
    this.bot_name = this.bot_full_data.name;
    this.bot_real_name = this.bot_full_data.real_name;
    this.bot_id = this.bot_full_data.profile.bot_id;
    this.params = {
        icon_url: this.bot_full_data.profile.image_48
    };

    console.log('- BOT   - ' + this.bot_name + ' ' + this.bot_id_as_user + '-' + this.bot_id);

    //bot.postMessageToChannel('general', 'Holiiiiiiii!', this.params);

});


bot.on('message', function(message) {

    //Some helpers, for future development (ha!)
    if (message.type === 'hello') {
        console.log('- HELLO - Connection successful');
        return;
    }

    if (message.type === 'member_joined_channel') {
        console.log('- MJC   - Member joined channel');
        unmuteBotFromChannel(message.channel.id);
        return;
    }

    if (message.type === 'group_left') {
        console.log('- GL    - Group left');
        unmuteBotFromChannel(message.channel.id);
        return;
    }

    if (message.type === 'channel_joined') {
        console.log('- CJ    - Channel joined');
        unmuteBotFromChannel(message.channel.id);
        return;
    }

    if (message.type === 'channel_left') {
        console.log('- CL    - Channel left');
        unmuteBotFromChannel(message.channel);
        return;
    }

    if (message.type === 'presence_change') {
        console.log('- PCHNG - ' + message.user + ': ' + message.presence + (message.user === this.bot_id_as_user ? ' **' : ''));
        return;
    }

    if (message.type === 'error' && message.error.code == 3) {
        //console.log('- ERROR - ERROR 3');
        return;
    }

    if (message.type === 'reconnect_url') {
        return;
    }

    if (message.type === 'desktop_notification') {
        return;
    }

    if (message.type === 'user_typing') {
        return;
    }

    if (message.type === 'file_shared') {
        return;
    }

    if (message.type === 'file_public') {
        return;
    }

    if (message.type === 'file_comment_added') {
        return;
    }

    if (message.type === 'file_change') {
        return;
    }

    if (message.type === 'reaction_added') {
        return;
    }

    if (message.type === 'reaction_removed') {
        return;
    }

    if (message.type === 'user_change') {
        return;
    }

    if (message.type === 'group_joined') {
        return;
    }

    if (message.type === 'team_join') {
        return;
    }

    if (message.type === 'channel_created') {
        return;
    }

    //End of helpers


    if (message.type !== 'message') {

        //logging unexpected message types
        console.log(message);

    } else {

        //It is a channel message
        if (typeof message.subtype === 'undefined' && (message.channel[0] === 'C' || message.channel[0] === 'G')) {

            console.log('- MSG   - ' + message.user /*+ ': ' + message.text*/);
            //console.log(message);

            var isMuted = false;
            var timestamp = new Date().getTime() / 1000;

            if (message.channel in mutedChannels) {

                if (mutedChannels[message.channel] > timestamp) {
                    isMuted = true;
                } else {
                    unmuteBotFromChannel(message.channel)
                }
            }

            var bot_response = '';

            //If someone mentioned the bot...
            if (message.text.search(this.bot_id_as_mention) != -1) {

                //... we check for other mentions ...
                user_mentions = message.text.match(/<@[A-Z0-9]+>/g);

                //... and add them to the response not including Ypirquí
                for (user_mention of user_mentions) {
                    if (user_mention !== this.bot_id_as_mention) {
                        bot_response += user_mention + ' ';
                    }
                }

                if (message.text == '<@' + this.bot_id_as_user + '> calla') {
                    mutedChannels[message.channel] = config.bot_mute_time + timestamp;
                    //console.log(timestamp);
                    //console.log(mutedChannels);
                }

                //... Other mentions or not, we add a string of 'ñis' to the response
                number_of_syllables = Math.floor(Math.random() * 3) * 3 + 2;

                for (f = 0; f < number_of_syllables; f++) {
                    bot_response += 'ñi';
                }

                bot.postMessage(message.channel, bot_response, this.params);


            } else
            //If nobody mentioned the bot, maybe she will taunt at you
            if (!isMuted && Math.random() > (1-config.bot_random) && message.text.length >= config.bot_min_string_length) {
                bot_response = ypirquiEncode(message.text);
                bot.postMessage(message.channel, bot_response, this.params);
                console.log('- REPLY - ' + bot_response);
            }

        } else {

            //Possibly a lot of interesting things to explore in this branch

        }

    }

});


bot.on('open', function() {

    console.log('- OPEN  - Websocket opened');

});


bot.on('close', function() {

    console.log('- CLOSE - Websocket closed');

});


function ypirquiEncode(text) {

    //WHY CAN I NOT ESCAPE THE PIPE?!?!?!
    regexp = new RegExp('<@[a-z0-9]+>|<!channel>|<!everyone>|<!here[|]@here>|\:[a-z_-]+\:(\:skin-tone-[0-9]\:)?|qu[aeiou]|c[aou]|gu[ei]|g[aou]|gü|z[aeou]|[aeouáéóú]', 'g');
    return text.toLowerCase().replace(regexp, ypirquiSubs);

}


function ypirquiSubs(match) {

    //console.log(match);

    if (match[0] === ':') {
        return ':eggplant:';
    }

    if (match[0] === '<') {
        if (match[1] === '@') {
            return match.toUpperCase();
        }
        return match;
    }

    switch (match) {
        case 'a':
        case 'e':
        case 'o':
        case 'u':
            return 'i';
        case 'á':
        case 'é':
        case 'ó':
        case 'ú':
            return 'í';
        case 'gue':
        case 'gui':
        case 'ga':
        case 'go':
        case 'gu':
        case 'gü':
            return 'gui';
        case 'que':
        case 'qui':
        case 'ca':
        case 'co':
        case 'cu':
            return 'qui';
        case 'qua':
        case 'quo':
        case 'quu':
            return 'quii';
        case 'za':
        case 'ze':
        case 'zo':
        case 'zu':
            return 'ci';
    }
    return '=';
}


function unmuteBotFromChannel(channel_id) {
    //if (channel_id in mutedChannels) {
    delete mutedChannels[channel_id];
    //}
    //console.log(mutedChannels);
}