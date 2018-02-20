async function arena( obj ) {

    let result, discordId, playerId, playerName, allyCode, playerGuild = null;
    try {
        result = await getRegister( obj );
        if( !result || !result[0] || !result[0].allyCode ) { return obj.fail('The requested user is not registered'); }
    } catch(e) {
        return obj.error('doArena.getRegister',e);
    }
                            
    allycode    = result[0].allyCode;
    playerName  = result[0].playerName;
    
    try {
        result = await fetchPlayer( obj, allycode );
        if( !result || !result[0] || !result[0].pvpProfileList ) { return obj.fail('The requested player or player-unit does have arena data.'); }
        result = result[0].pvpProfileList;
    } catch(e) {
        return obj.error('doArena.fetchPlayer', e);
    }
                
    let squads = {};
    let u = 0;
    
    squads.arena = {};
    squads.arena.rank = result[0].rank;
    if( result.length > 1 ) {
    	    	
	    squads.ships = {};
	    squads.ships.rank = result[1].rank;
    
    }
	
        
    let replyObj = {};
    replyObj.title = playerName+'\'s arena ( '+allycode+' )';
    
    let desc = new Date().toString()+'\n'; //.toISOString().replace(/T/g,' ').replace(/\..*/g,'')+'\n'; 
    desc += '`------------------------------`\n';
    desc += '**Char Arena rank** : `'+squads.arena.rank+'`\n';
    desc += '**Ship Arena rank** : `'+squads.ships.rank+'`\n';
    desc += '`------------------------------`\n';
    desc += 'For details, see:\n';
    desc += '*'+obj.clientConfig.settings.prefix+obj.cmdObj.cmd+' details '+allycode+'*'
    replyObj.description = desc;
    replyObj.fields = [];
    
    return obj.success( replyObj );
                
}

async function arenaUnits( obj ) {

    let result, discordId, playerId, playerName, allyCode, playerGuild = null;
    try {
        result = await getRegister( obj );
        if( !result || !result[0] || !result[0].allyCode ) { return obj.fail('The requested user is not registered'); }
    } catch(e) {
        return obj.error('doArena.getRegister',e);
    }
                            
    allycode    = result[0].allyCode;
    playerName  = result[0].playerName;
    
    try {
        result = await fetchPlayer( obj, allycode );
        if( !result || !result[0] || !result[0].pvpProfileList ) { return obj.fail('The requested player or player-unit does have arena data.'); }
        result = result[0].pvpProfileList;
    } catch(e) {
        return obj.error('doArena.fetchPlayer', e);
    }
                
    let squads = {};
    let u = 0;
    
    squads.arena = {};
    squads.arena.rank = result[0].rank;
    squads.arena.units = [];
    for( u = 0; u < result[0].squad.cellList.length; ++u ) {
        squads.arena.units[result[0].squad.cellList[u].cellIndex] = result[0].squad.cellList[u].unitDefId;
    }
    
    let cnames = null;
    try {
        cnames = await findUnitDefs( obj, squads.arena.units );
    } catch(e) {
        return obj.error('doArena.findUnitDefs', e);
    }

    let snames = null;
    if( result.length > 1 ) {
    	    	
	    squads.ships = {};
	    squads.ships.rank = result[1].rank;
	    squads.ships.units = []; 
	    for( u = 0; u < result[1].squad.cellList.length; ++u ) {
	        squads.ships.units[result[1].squad.cellList[u].cellIndex] = result[1].squad.cellList[u].unitDefId;
	    }
	    
	    try {
	        snames = await findUnitDefs( obj, squads.ships.units ); 
	    } catch(e) {
	        return obj.error('doArena.findUnitDefs', e);
	    }
    
    }
	
        
    let replyObj = {};
    replyObj.title = playerName+'\'s arena ( '+allycode+' )';
    replyObj.description = 'Fetched at: '+( new Date().toISOString().replace(/T/g,' ').replace(/\..*/g,'') );
    replyObj.fields = [];
    
    let positions = [ "L|", "2|", "3|", "4|", "5|", "6|", "B|", "B|", "B|", "B|", "B|" ];
    let i;
    let space = "\u200b";
    
    if( snames ) {

    	let stext = "";
        let si;
        for( si = 0; si < squads.ships.units.length; ++si ) {
        	stext += "`"+positions[si]+"` "+squads.ships.units[si]+"\n";
        }
        for( si = 0; si < snames.length; ++si ) {
        	stext = stext.replace(snames[si].id, snames[si].name);
        }
        stext += "`------------------------------`\n";
    	replyObj.fields.push({ 
            "title":"Ship Arena (Rank: "+squads.ships.rank+")",
            "text":stext,
            "inline":true
        });
    
    }
    
    let atext = "";
    let ai;
    for( ai = 0; ai < squads.arena.units.length; ++ai ) {
    	atext += "`"+positions[ai]+"` "+squads.arena.units[ai]+"\n";
    }
    for( ai = 0; ai < cnames.length; ++ai ) {
    	atext = atext.replace(cnames[ai].id, cnames[ai].name);
    }
    atext += "`------------------------------`\n";
	replyObj.fields.push({ 
        "title":"Char Arena (Rank: "+squads.arena.rank+")",
        "text":atext,
        "inline":true
    });
    
    return obj.success( replyObj );
                
}

async function getRegister( obj ) {
	
	try {
		let registration = null;
	    const DatabaseHandler = require(obj.clientConfig.path+'/utilities/db-handler.js');
	    if( obj.cmdObj.args.discordId ) {
	    	registration = new DatabaseHandler(obj.clientConfig.settings.database, obj.moduleConfig.queries.GET_REGISTER_BY_DID, [obj.cmdObj.args.discordId]);
	    } else {
	    	if( obj.cmdObj.args.allycode ) { 
	        	registration = new DatabaseHandler(obj.clientConfig.settings.database, obj.moduleConfig.queries.GET_REGISTER_BY_ALLYCODE, [obj.cmdObj.args.allycode]);
	        } else {
	        	registration = new DatabaseHandler(obj.clientConfig.settings.database, obj.moduleConfig.queries.GET_REGISTER_BY_PLAYER, ['%'+obj.cmdObj.args.id+'%']);
	        }
	    }
	    
	    try {
	        let result = null;
	        result = await registration.getRows();
	        if( result.length === 0 ) { return false; }
	        return result;
	    } catch(e) {
	    	throw e;
	    }
	} catch(e) {
		obj.error('swgoh.getRegister',e);
	}
}

async function findUnitDefs( obj, units ) {
    
    return new Promise((resolve,reject) => {
        
        //find discordID in lazbot db
        const DatabaseHandler = require(obj.clientConfig.path+'/utilities/db-handler.js');
        const data = new DatabaseHandler(obj.clientConfig.settings.datadb, obj.moduleConfig.queries.GET_UNITNAMES, [units]);
        data.getRows().then((result) => {
            if( result.length === 0 ) { 
                obj.message.react(obj.clientConfig.settings.reaction.ERROR);
                let replyStr = "There was an error retriving your units";
                reject(replyStr);
            
            } else {
                resolve(result);
            }
        }).catch((reason) => {                  
            obj.message.react(obj.clientConfig.settings.reaction.ERROR);                    
            reject(reason);
        });
        
    });
    
}

async function fetchPlayer( obj, allycode ) {
	
	return new Promise( async (resolve, reject) => {
		
		let settings = {};
            settings.path       = process.cwd();
            settings.path       = settings.path.replace(/\\/g,'\/')+'/compiled';
	        settings.hush       = true;
	        settings.verbose    = false;
	        settings.force      = false;
	        
	    let profile, rpc, sql = null;
	            
	    try {
			const RpcService = require(settings.path+'/services/service.rpc.js');
	        rpc = await new RpcService(settings);
	
	        /** Start the RPC Service - with no logging**/
	        await rpc.start(`Fetching ${allycode}...\n`, false);
	        
	    	await obj.message.react(obj.clientConfig.settings.reaction.THINKING);
	        profile = await rpc.Player( 'GetPlayerProfile', { "identifier":parseInt(allycode) } );
	        
	        /** End the RPC Service **/
	        await rpc.end("All data fetched");
	
	    } catch(e) {
	        await rpc.end(e.message);
	        reject(e);
	    }
	    
        resolve([profile]);

	});
	
}


/** EXPORTS **/
module.exports = { 
	arena: async ( obj ) => { 
    	return await arena( obj ); 
    },
	arenaUnits: async ( obj ) => { 
    	return await arenaUnits( obj ); 
    }
}