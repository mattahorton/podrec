'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;
const GoogleSpreadsheets = require('google-spreadsheets');

const scriptRules = require('./script.json');

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            console.log('chat started');
            
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
                .then(() => bot.say(`Great. That's settled. Just say HIT ME to get a recommendation.`))
                .then(() => 'speak');
        }
    },
    
    submitPod: {
        receive: (bot, message) => {
            let upperText = message.text.trim().toUpperCase();
            
            if (upperText === "YOU KNOW IT") {
                return bot.say(`Great! Show me the pod.`).then(() => 'parsePod');
            }
            
            return bot.say(`Wrong. Thanks for playing.`).then(() => 'speak');
        }
    },
    
    parsePod: {
        receive: (bot, message) => {
            if(message.text.indexOf('http://pca.st/') === 0) {
                return bot.say('I\'ll add it to the list!').then(() => 'speak');
            }
            
            return bot.say('I don\'t know what to do with that.').then(() => 'speak');
        }
    },


    speak: {
        receive: (bot, message) => {
            
            console.log('New message');

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }
                
                if (upperText === "BIG LOVE") {
                    return bot.say(`What did Liz say?`).then(() => 'submitPod');
                }
                
                
                
                if (upperText === "HIT ME") {
                    return GoogleSpreadsheets({
                        key: '1raJIBkoqcEdXgi_NXEF5AvJC1L09Laz78s32o3kFm8c'
                    }, function(err, spreadsheet) {
                        console.log(err);
                        spreadsheet.worksheets[0].cells({}, function(err, cells) {
                            // Cells will contain a 2 dimensional array with all cell data in the 
                            // range requested. 
                            
                            let intString = '' + randomIntInc(2,_.size(cells['cells']));
                            console.log(intString);
                            
                            let episode = cells['cells']['2']['1']['value'];
                            let podcast = cells['cells']['2']['2']['value'];
                            let url = cells['cells']['2']['3']['value'];
                            let image = cells['cells']['2']['4']['value'];
                            
                            let message = 'Check out ' + episode + ' from ' + podcast + "! " + 
                            "%[Check it out](" + url + ")";
                            
                            var p = Promise.resolve();
                            
                            p = p.then(function() {
                                return bot.say("![Podcast logo](" + image +")");
                            });
                            
                            p = p.then(function() {
                                return bot.say(message.trim());
                            });
                            
                            return p.then(() => 'speak');
                        });
                    });
                }

                if (!_.has(scriptRules, upperText)) {
                    return bot.say(`I didn't understand that.`).then(() => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        console.log(line);
                        return bot.say(line);
                    });
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});