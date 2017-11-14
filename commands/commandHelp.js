(function() {

    module.exports.Help = function( message, messageParts, channel, botSettings ) {

    	if( message.content.toLowerCase() === botSettings.command.help || messageParts[1].toLowerCase() === botSettings.options.me ) {
    		var replyBuilder = require("../utilities/replyBuilder.js");
    		return replyBuilder.replyArray( message, botSettings.success.POSSIBLE_COMMANDS, botSettings.commandList );
    	}
    	    	
    	var help = {};
        var details = messageParts[1].charAt(0) === '-' ? false : true;  
        var sheet = !details ? messageParts[1].substr(1,messageParts[1].length) : messageParts[1];
        
        help[sheet] = {};
        
        var sheetURL = channel.spreadsheet;
        var ruleURL = sheetURL+"?desc="+encodeURIComponent(JSON.stringify(help));
        console.log( sheetURL+"?desc="+JSON.stringify(help) );
        
        var request = require('request');
        request(ruleURL, function (error, response, body) {
          
        	if( typeof(body) === "undefined" || body.length === 0 ) { return; }
		
			try {
			    var body = JSON.parse(body);
			    
			    if( body.response === "error" ) { 

					message.channel.stopTyping(true);
					return message.reply( body.data );
					
			    }
			    
			    var replyBuilder = require("../utilities/replyBuilder.js");			    
			    return replyBuilder.replyArray( message, botSettings.success.POSSIBLE_FIELDS+sheet, body.data[0].fields );
			} catch(e) {
				//JSON Error
			    //console.error(e);
			    //console.error(error);
				message.channel.stopTyping(true);
			    message.reply("I had an error with this request");
			    return;
			}
		
        });
        
    }
    
    module.exports.Self = function( message, messageParts, channel, botSettings ) {

	    var replyBuilder = require("../utilities/replyBuilder.js");			    
	    replyBuilder.replyJSON( message, "your user settings:", message.author );
    	
    }
    
    module.exports.Bot = function( message, messageParts, channel, botSettings ) {

	    var replyBuilder = require("../utilities/replyBuilder.js");			    
	    replyBuilder.replyJSON( message, "your user settings:", client );
    	
    }
    

}());

