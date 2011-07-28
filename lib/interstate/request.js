var sys			= require( 'sys' );
var http		= require( 'http' );
var https		= require( 'https' );
module.exports = function( parent ) {

	var self	= this;
	this.params	= {
	
		object:	'',
		method:	'',
		parent:	parent,
		post:	{},
		get:	{},
		verb:	false
		
	};
	
	this.request = function( object, method ) {
		
		self.params.object	= object;
		self.params.method	= method;
		self.params.post	= {};
		self.params.get		= {};
		self.params.verb	= false;
		
		return self;
		
	};
	
	this.verb = function( verb ) {
		
		self.params.verb = verb;
		
		return self;
	
	}
	
	this.post = function( data ) {
		
		for( var i in data ) {
			
			self.params.post[ i ] = data[ i ];
		
		}
		
		return self;
	
	};
	
	this.get = function( data ) {
	
		for( var i in data ) {
			
			self.params.get[ i ] = data[ i ];
		
		}
		
		return self;		
	
	},
	
	this.send = function( callback ) {
	
		var url = self.params.parent.getRequestUrl( self.params.object, self.params.method, self.params.get, true );
		
		if( self.params.verb ) {
			
			var method = self.params.verb.toUpperCase();
			
		} else if( self.params.post.length > 0 ) {
		
			var method = 'POST';
		
		} else {
			
			var method = 'GET';
		
		}
		
		console.log({
		
			host:	self.params.parent.getOptions().endpoint,
			path:	url,
			method:	method,
			port:	( self.params.parent.isHttps() ) ? 443 : 80
		
		});
		
		if( self.params.parent.isHttps() ) {
			
			var req = https.request({
			
				host:		self.params.parent.getOptions().endpoint,
				path:		url,
				method:		method,
				headers:	{
					
					'Accept':		'text/json',
					'Content-type':	'text/json'
				
				},
				port:	( self.params.parent.isHttps() ) ? 443 : 80
			
			});
		
		} else {
			
			var req = http.request({
			
				host:		self.params.parent.getOptions().endpoint,
				path:		url,
				method:		method,
				headers:	{
					
					'Accept':		'text/json',
					'Content-type':	'text/json'
				
				},
				port:	( self.params.parent.isHttps() ) ? 443 : 80
			
			});
		
		}
				
		req.addListener( 'response', function( resp ) {
			
			var data = '';
			
			resp.addListener( 'data', function( dat ) {
			
				data += dat;
			
			});
			
			resp.addListener( 'end', function() {
			
				var json = JSON.parse( data );
				
				if( json.error ) {
				
					callback( json.error );
				
				} else {
					
					callback( false, json.response );
				
				}
			
			});
		
		});
		
		if( self.params.post.length > 0 ) {
		
			req.write( JSON.stringify( self.params.post ) );
		
		}
		
		req.end();
	
	}

};