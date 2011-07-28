var _request = require( './request' );

module.exports = ( function( params ) {
	
	var self		= this;
	this.options	= {
	
		endpoint:	'api.interstateapp.com',
		rootUrl:	'interstateapp.com',
		https:		true,
		version:	1
		
	};
	
	for( var i in params ) {
		
		this.options[ i ] = params[ i ];
	
	}
	
	var methods = {
	
		getOptions: function() {
			
			return self.options;
		
		},
		
		isHttps: function() {
			
			return self.options.https;
		
		},
	
		getRootUrl:	function() {
		
			return ( ( self.options.https === true ) ? 'https' : 'http' ) + '://' + self.options.rootUrl + '/';
		
		},

		getEndpoint:	function() {
		
			return ( ( self.options.https === true ) ? 'https' : 'http' ) + '://' + self.options.endpoint + '/v' + self.options.version + '/';
		
		},		
		
		getRequestUrl:	function( object, method, get, noEndpoint ) {
		
			if( !get ) {
				
				get = {};
			
			}
			
			var url = ( ( noEndpoint !== true ) ? self.getEndpoint() : '/v' + self.options.version + '/' ) + object + '/' + method;
			
			for( var i in get ) {
				
				url += '/' + i + '/' + get[ i ];
			
			}
			
			if( self.options.accessToken ) {
				
				url += '?oauth_token=' + self.options.accessToken;
			
			}
			
			return url;
		
		},
		
		getAccessToken: function( code, type, setToken ) {
		
			var params = {
				
				callback: function() {},
				code:		null,
				type:		'authorization_code',
				setToken:	true
			
			};
			
			for( var i = 0; i < arguments.length; i++ ) {
			
				if( typeof arguments[ i ] == 'function' ) {
					
					params.callback = arguments[ i ];
				
				} else if( typeof arguments[ i ] == 'boolean' ) {
				
					params.setToken = ( arguments[ i ] == true ) ? true : false;
					
				} else if( i === 0 ) {
				
					params.code = arguments[ i ];
				
				} else {
				
					params.type	= arguments[ i ];
				
				}
			
			}
			
			var url		= methods.getEndpoint() + 'oauth2/token';
			var post	= {
			
				'redirect_uri': 	self.options.redirectUri,
				'client_id':		self.options.consumerKey,
				'client_secret':	self.options.consumerSecret
			
			};
		
			switch( params.type ) {
			
				default:
					case 'authorization_code':
					
					post.grant_type	= 'authorization_code';
					post.code		= params.code;
					
					break;
					
				case 'refresh_token':
						
					post.grant_type		= 'refresh_token';
					post.refresh_token	= params.code;
					
					break;
			
			}
			
			try {
				
				methods.request( 'oauth2', 'token', function( req ) {
				
					req.post( post ).send( function( err, data ) {
					
						if( err ) {
							
							params.callback( true, err );
						
						} else {
						
							if( params.setToken ) {
								
								methods.setAccessToken( data.access_token );
							
							}
							
							params.callback( false, data );
						
						}
					
					});
				
				});
			
			} catch( e ) {
				
				params.callback( true, e );
			
			}
					
		},
		
		setAccessToken: function( token ) {
			
			self.options.accessToken = token;
		
		},
		
		destroyToken: function( type, token, callback ) {
			
			if( !callback ) {
				
				callback = function() {};
			
			};
			
			if( type == 'access_token' || type == 'refresh_token' ) {
			
				methods.fetch( 'token/destroy/type/' + type + '/token/' + token, {}, true, function( err, req ) {
				
					if( err ) {
						
						callback( err );
					
					} else {
						
						req.verb( 'DELETE' ).send( function( err, data ) {
						
							if( err ) {
							
								callback( true, err );
								
							} else {
							
								callback( false, data );
							
							}
						
						});
						
					}
				
				})
			
			} else {
			
				callback( false );
				
			}
		
		},
		
		getAuthorizeUrl: function() {
			
			return methods.getRootUrl() + 'oauth2/authorize?client_id=' + self.options.consumerKey + '&redirect_uri=' + self.options.redirectUri + '&response_type=code';
		
		},
		
		fetch: function() {
			
			var url				= '';
			var post			= {};
			var returnInstance	= false;
			var callback		= function() {};
			
			for( var i = 0; i < arguments.length; i++ ) {
			
				if( typeof arguments[ i ] == 'string' ) {
					
					var url = arguments[ i ];
				
				} else if( typeof arguments[ i ] == 'object' ) {
					
					var post = arguments[ i ];
				
				} else if( typeof arguments[ i ] == 'boolean' ) {
				
					var returnInstance = arguments[ i ];
				
				} else if( typeof arguments[ i ] == 'function' ) {
					
					var callback = arguments[ i ];
				
				}
			
			}
		
			var parts	= url.split( '/' );
			var object	= parts[ 0 ];
			var get		= {};
			
			if( parts[ 1 ] ) {
			
				var method = parts[ 1 ];
			
			} else {
				
				callback( true, { error: 'Invalid method passed.' } );
			
			};
			
			if( parts.length > 2 ) {
			
				for( var i = 2; i < parts.length - 1; i++ ) {
					
					if( parts[ i + 1 ] ) {
					
						get[ parts[ i ] ] = parts[ i + 1 ];
						
						i++;
					
					}
					
				}
			
			}
			
			methods.request( object, method, function( request ) {
			
				request.get( get ).post( post || {}, true );
								
				if( returnInstance ) {
				
					callback( false, request );
				
				} else {
					
					request.send( callback );
				
				}	
			
			});
			
		},
		
		request: function( object, method, callback ) {
			
			var instance = new _request( methods );
			
			callback( instance.request( object, method ) );
		
		}
	
	};
	
	return methods;
	
});