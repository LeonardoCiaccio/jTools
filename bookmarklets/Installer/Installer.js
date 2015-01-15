( function( D ){
    
    // Necessari
    if( !D || !D.body )return void( 0 );    
    
    var signature = "bookmarklet-installer-",
        all       = 0,
        frameID   = ""; 
    
    // Appende un evento cross browser
    function _addEvent( evnt, elem, func ){
        
        try{
            
            if( elem.addEventListener ){
                
                elem.addEventListener( evnt, func, false );
            
            }else if( elem.attachEvent ){
                
                 var r = elem.attachEvent( "on" + evnt, func );
            
            }
            
            return true;
        
        }catch( e ){
            
            return false;
            
        }		    
        
    };
        
    // Fonde 2 oggetti, settagi
    function _merge( source, news ){

        source 	= source 	|| {};
        news 	= news 		|| {};	

        for( var key in source ) {

            if( source.hasOwnProperty( key ) && !( key in news ) ) {

                news[ key ] = source[ key ];

            }

        }

        return news;

    };
    
    // Restituisce la percentuale tra due valori
    function _getPercentage( all, current ){
        
    	if ( all == current ) return 0;
		
        var q = ( current / ( all / 100 ) );
		
        return ( 100 - q.toFixed( 0 ) );
    
    };
    
    // Fornisce un id univoco con signature
    function _getNewID(){
        
        // Rendiamo il nostro id univoco
        var now = new Date().getTime();
        
        return signature + now;
        
    };
    
    // Installa uno script o un css a partire dalla stringa
    function _installElements( opts ){
        
        // Abbiamo finito
        if( opts.elements.length < 1 )return opts.onFinish();
        
        // Preleviamo il primo elemento
        var element = opts.elements[ 0 ];
        
        // Lo elimino
        opts.elements.splice( 0, 1 );
        
        // Rendiamo il nostro id univoco
        var id  = _getNewID();
        
        // Progressione
        opts.onProgress( _getPercentage( all, opts.elements.length ) );
        
        // Già installato ? vado avanti ( anche se impossibile )
        if( D.querySelector( "#" + id ) )return _installElements( opts );
        
        // Controllo che sia uno script
        if( element.match( /\.js$/gi ) || element.match( /installer\=js/gi ) ){ 

            var script = D.createElement( "script" );

            script.setAttribute( "id", id );
            script.setAttribute( "src", element );
            _addEvent( "load", script, function(){
                
                return _installElements( opts );
                
            } );

            opts.where.appendChild( script );
            
        }else if( element.match( /\.css$/gi ) || element.match( /installer\=css/gi ) ){
            
            var css = D.createElement( "link" );
                    
            css.setAttribute( "id", id );
            css.setAttribute( "rel", "stylesheet" );
            css.setAttribute( "type", "text/css" );
            css.setAttribute( "href", element );
            _addEvent( "load", css, function(){
                
                return _installElements( opts );
                
            } );

            opts.where.appendChild( css );
            
        }else{
            
            _installElements( opts );
            
        }
        
    };
    
    window.installer = {
        
        /*
            
            installer.install( opts );
            Installa script, css
        
        */
        
        install : function( opts ){
            
            if( !opts || typeof opts != "object" )throw new Error( "installer.install( obj ) require 'object' parameters !" );
            
            // Rimuovo prima la precedente installazione
            installer.uninstall();
            
            var sets = {
                
                createFrame : false,
                where       : D.body,
                onProgress  : function(){},
                onFinish    : function(){},
                elements    : []
                
            }; 
            
            // Segnamo il passo per il progresso
            all = opts.elements.length;
            
            // createFrame bypass where
            if( opts.createFrame === true ){
                
                var div = D.createElement( "div" );
                
                frameID = _getNewID(); 
                
                div.setAttribute( "id", frameID );
                D.body.appendChild( div );
                
                opts.where = div;
                
            }
            
            _installElements( _merge( sets, opts ) );
            
            return void( 0 );
            
        },
        
        /*
            
            installer.uninstall( onUninstalled );
            Disinstalla tutte le dipendenze
        
        */
        
        uninstall : function( onUninstalled ){
            
            onUninstalled = onUninstalled || function(){};
            
            // Prelevo tutti gli elementi
            var all = document.getElementsByTagName( "*" );
            
            // Mi faccio un giro
            for( var i = 0; i < all.length; i++ ){
                
                var id = all[ i ].getAttribute( "id" );
                
                // Se inizia con la nostra signature, lo eliminiamo
                if( id && id.indexOf( signature ) == 0 ){
                    
                    // Elimino l'elemento
                    all[ i ].parentNode.removeChild( all[ i ] );
                    i--;
                }
                
            }
            
            onUninstalled();
            
        },
        
        /*
        
            installer.getSignature()
            Restituisce la signature utilizzata dall'installer
            
        */
        
        getSignature : function(){
            
            return signature;
            
        },
        
        /*
        
            installer.getFrameID()
            Restituisce l'id del frame creato
        
        */
        
        getFrameID : function(){
            
            return  frameID;
            
        }
        
    };
    
} )( document );


