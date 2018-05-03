async function clearGo( obj ) {
	
    try {
        
        const Discord = require('discord.js');
		let server = obj.message.guild.id;
        let channel = obj.message.channel.id;
        
        console.log('start');
        if (obj.message.member.hasPermission('MANAGE_MESSAGES')) {

            console.log('1');
            let messages = [];
            messages = await obj.message.channel.DownLoadMessages(100);
            await obj.message.channel.DeleteMessages(messages);
    
            console.log('start');
            return obj.success('');
    
        } else {
            return obj.fail('You don\'t have permission to delete messages. :poop:');
        }

    } catch(e) {
        obj.error('clearGo',e);
    }
}

/** EXPORTS **/
module.exports = {
	clearGo: async ( obj ) => { 
		return await clearGo( obj );
	}
}