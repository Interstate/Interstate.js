var interstate = require( './lib/interstate/index' )({

	consumerKey:	'',
	consumerSecret:	'',
	redirectUri:	''

});

interstate.setAccessToken( '<ACCESS_TOKEN>' );

interstate.fetch( 'account/verify', function( err, resp ) {

	if( !err ) {
		
		console.log( 'Valid token/account', resp );
	
	} else {
		
		console.log( 'Error', err );
	
	}

});