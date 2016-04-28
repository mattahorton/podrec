'use strict';

const Script = require('smooch-bot').Script;

module.exports = new Script({
    processing: {
        prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('Hey y\'all! I built this bot because some of you have been ' +
             'interested in me providing podcast recommendations. Also, I wanted to ' + 
             'build a bot.')
                .then(() => 'askName');
        }
    },

    askName: {
        prompt: (bot) => bot.say('Just humor me here and type your name so this thing can know what to call you. Feel free to enter something like \'Queen Bey\' or \'Sunshine\' or really whatever you want.'),
        receive: (bot, message) => {
            const name = message.text;
            return bot.setProp('name', name)
                .then(() => bot.say(`Great. That's setlled. What can I do for you, ${name}?`))
                .then(() => 'finish');
        }
    },

    finish: {
        receive: (bot, message) => {
            return bot.getProp('name')
                .then((name) => bot.say(`Sorry ${name}, this bot is pretty ` +
                        'dumb, so you should message me (as in Matt) and ' + 
                        'tell me to make it smarter.'))
                .then(() => 'finish');
        }
    }
});
