async function doSetup( obj ) {

    const content = obj.message.content.split(/\s+/g);
    
    if( content[1] && content[1] === 'help' ) { return obj.help( obj.moduleConfig.help.setup ); }
    
    let result = null;
    try {
        result = await obj.findChannel(obj.message.channel.id);
    } catch(e) {
        return obj.error('doSetup.findChannel', e);
    }

    let spreadsheet = content[1] && content[1] === 'spreadsheet' ? content[2] : ( result[0] && result[0].spreadsheet ? result[0].spreadsheet : null );
    let webhook     = content[1] && content[1] === 'webhook'     ? content[2] : ( result[0] && result[0].webhook ? result[0].webhook : null );
    let modrole     = content[1] && content[1] === 'modrole'     ? content[2] : ( result[0] && result[0].modrole ? result[0].modrole : 'botmods' );
    let language    = content[1] && content[1] === 'language'    ? content[2] : ( result[0] && result[0].language ? result[0].language : 'ENG_US' );
    
    let settings = [ 
        obj.message.channel.id,
        obj.message.channel.name,
        obj.message.guild.id,
        obj.message.guild.name,
        obj.message.guild.region,
        obj.message.guild.memberCount,
        spreadsheet,
        webhook,
        modrole,
        language
    ];
    
    try {
        result = await obj.updateChannel(settings);
    } catch(e) {
        return obj.fail(e);
    }
    
    return obj.success();
                
}


/** EXPORTS **/
module.exports = { 
	doSetup: async ( obj ) => { 
    	return await doSetup( obj ); 
    }
}