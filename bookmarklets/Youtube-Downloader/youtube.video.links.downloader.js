/*

    Questa semplice libreria espone un oggetto che permette
    di ricavare i link per il download sul sito Youtube.
    
    YT.links()              // Restituisce un array di oggetti con i dettagli per il download
    YT.compat()             // Restituisce un array di stringhe a seconda del formato passato
    YT.download.button()    // Eseguito come bottone crea una popup con i link da scaricare
    YT.download.external()  // Passare un servizio esterno il codice verrà ricavato/sostituito %E
    
*/


( function( D, Y ){
    
    /*
        
        Controllo di aver caricato gli elementi necessari
        altrimenti esco.
        
    */
    
    if( !D )return false;
    
    var uReq = /^http(?:s?):\/\/www\.youtube\.com\/watch\?v\=/gi,
        lol  = " by Grab Any Media";
    
    function _getLend( size ){
        
        size = parseInt( size );
        
        if( size < 1 )return "0 byte";
        
        var oneKB = 1024,
            oneMB = oneKB * 1024,
            oneGB = oneMB * 1024;
        
        return ( size < oneKB ) ? size + " byte" :
               ( size < oneMB ) ? Math.round( ( size / oneKB ) * 100 ) / 100 + " KB" :                
               ( size < oneGB ) ? Math.round( ( size / oneMB ) * 100 ) / 100 + " MB" :
                Math.round( ( size / oneGB ) * 100 ) / 100 + " GB"
    };
    
    function _getTyped( type ){
        
        return ( !type ) ? "unkown" :
               ( type.toUpperCase().indexOf( "VIDEO/MP4" ) > -1 ) ? "MP4" :
               ( type.toUpperCase().indexOf( "VIDEO/WEBM" ) > -1 ) ? "WEBM" :
               ( type.toUpperCase().indexOf( "VIDEO/3GPP" ) > -1 ) ? "3GP" :        
               ( type.toUpperCase().indexOf( "VIDEO/X-FLV" ) > -1 ) ? "FLV" :
               "FLV";
        
    };
    
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
    
    function _sanitizeName( name, replacer ){			
        
        replacer = replacer || "+";
        
        return name.trim().replace( /[^a-z 0-9]+/gi, "" ).replace( / /gi, replacer );	
    
    };
    
    function _getTitle( replacer ){     
        
        return ( D.title ) ? _sanitizeName( D.title.trim() + lol, replacer ) : _sanitizeName( "Youtube Video" + lol, replacer );
        
    };
    
    window.YT = {
        
        /*
        
           Preleva i link e li dispone in un array di oggetti
           con i rispettivi valori, oppure un array vuoto :
            
           .quality ; .type ; .url 
        
        */
        
        links      : function(){
        
            // Riferimenti per il player
            var YD,
                YO = [];
            
            if( !Y )return YO;
                                
            //Abbiamo quello che ci occorre ?
            try{
                
                YD = Y.config.args.url_encoded_fmt_stream_map;
            
            }catch( e ){
                
                return YO;
            
            }
            
            try{
                
                var a01 = YD.split( "," );
                
                // quality= ; type= ; url=	
                for( var a02 = 0; a02 < a01.length; a02++ ){
                    
                    var a03 = a01[ a02 ].split( "&" ),
                        tmp = {};
                    
                    for( var a04 = 0; a04 < a03.length; a04++ ){
                        
                        var a05 = a03[ a04 ].split( "=" ),
                            key = decodeURIComponent( a05[ 0 ].toUpperCase() ),
                            value = decodeURIComponent( a05[ 1 ] );
                        
                        switch( key ){
                                
                            case "TYPE":
                                
                                tmp.type = value;
                                break;
                            
                            case "QUALITY":
                                
                                tmp.quality = value;
                                break;
                            
                            case "URL":
                                
                                tmp.url = value;
                                break;
                        
                        }
                        
                    }
                    
                    if( tmp.type && tmp.quality && tmp.url )YO.push( tmp );
                
                }
                
                return YO;
            
            }catch( e ){
                
                return YO;
                
            }
            
        },
        
        /*
        
            Restituisce del codice html derivante il formato richiesto :
            
            esempio .compat( "<a href='%U' data-quality='%Q' title='%F'>[ %T ][ %Q ]</a>" )
            
            quindi restituisce un array convertendo i segnaposti con i valori richiesti
        
        */
        
        compat   : function( format, trans ){
            
            format = format || "<a href='%U' data-quality='%Q' title='%F'>[ %T ][ %Q ]</a>";
            trans  = trans  || false;
            
            var links   = YT.links(),
                compats = [];
            
            var reQ = new RegExp( "\%Q", "gi" ),
                reU = new RegExp( "\%U", "gi" ),
                reF = new RegExp( "\%F", "gi" ),
                reT = new RegExp( "\%T", "gi" );
            
            for( var i=0; i < links.length; i++ ){
                
                var fName = _getTitle( " " ) + "." + _getTyped( links[ i ].type ).toLowerCase();
                
                // Aggiungo il valore del title alla fine
                links[ i ].url = links[ i ].url + "&title=" + _getTitle();
                
                var tmp = format.replace( reQ, links[ i ].quality )
                                .replace( reU, links[ i ].url )
                                .replace( reF, fName )
                                .replace( reT, _getTyped( links[ i ].type ).toUpperCase() );
                
                compats.push( tmp );
                                
            }
            
            return compats;
            
        },
        
        /*
        
            Per il download, possiamo avere diverse opzioni
        
        */
        
        download : {
            
            /*
            
                download.button() apre una popup con i link per il download
            
            */
            
            button : function(){
                
                if( !uReq.test( D.location.href ) ){
                    
                    alert( "Use this bookmarklet on :\r\n https://www.youtube.com/watch?v=($video $code)" );
                    
                    return void( 0 );
                    
                }
                
                var mID = "YT-Links-Downloader";
                
                // Se già siamo operativi esco
                if( D.querySelector( "#" + mID ) )return false;
                
                // La modal main
                var pMain = D.createElement( "div" ),
                    
                    // Lo stile
                    pMainStyle = [

                        "width:100%",
                        "height:100%",
                        "top:0px",
                        "left:0px",
                        "background-color:rgba(255, 255, 255, 0.76)",
                        "overflow:hidden",
                        "z-index:9999999999",
                        "position:fixed"

                    ].join( ";" );
                    
                // La nostra popup
                var pUp = D.createElement( "div" ),
                
                    // Lo stile della popup
                    pUpStyle = [

                        "width:120px",
                        "height:auto",
                        "max-height:160px",
                        "top:50%",
                        "left:50%",
                        "margin-top:-80px",
                        "margin-left:-60px",
                        "background-color:white",
                        "box-shadow: 1px 1px 14px 1px #333333",
                        "padding:2em",
                        "overflow:auto",
                        "z-index:99999999999",
                        "position:fixed",
                        "text-align:left"

                    ].join( ";" ),
                    
                    // I nostri links
                    /*pUpLinks = YT.compat( "<p style='margin-bottom: 3px;'><a onclick=\"alert( 'Right click then save as ...' );return false;\" href='%U' title='%F' download='%F'>[%Q][%T]</a></p>", true );*/
                    pUpLinks = YT.compat( "<p style='margin-bottom: 3px;'><a href='%U' title='%F' download='%F'>[%Q][%T]</a></p>", true );    
                
                pMain.setAttribute( "style", pMainStyle );
                pMain.setAttribute( "id", mID );
                
                D.body.appendChild( pMain );
                
                pUpLinks = ( pUpLinks.length > 0 ) ? pUpLinks.join( "" ) : "<p>No Links :(</p>";
                
                pUp.setAttribute( "style", pUpStyle );
                pUp.innerHTML = pUpLinks;
                
                D.body.appendChild( pUp );
                
                // Chiudiamo la popup
                _addEvent( "click", pMain, function(){
                    
                    pUp.parentNode.removeChild( pUp );
                    this.parentNode.removeChild( this );
                    
                } );
                
                return void( 0 );
                
            },
            
            /*
            
                download.external() apre una nuova finestra utilizzando un servizio esterno
            
            */
            
            external : function( external ){
            
                if( !uReq.test( D.location.href ) ){
                    
                    alert( "Use this bookmarklet on :\r\n https://www.youtube.com/watch?v=($video $code)" );
                    
                    return void( 0 );
                    
                }
                
                // Non siamo su youtube oppure non abbiamo il servizio
                if( !external )return void( 0 );
                                
                // Prelevo il codice
                var tmp = D.location.href.split( "watch?" );
                if( tmp.length != 2 )return false;
                
                var pars = tmp[ 1 ].split( "&" );
                
                for( var i=0; i < pars.length; i++ ){
                    
                    if( pars[ i ].indexOf( "v=" ) > -1 ){
                        
                        var cod  = pars[ i ].replace( "v=", "" ).trim(),
                            eLnk = external.replace( /(%E)/gi, cod );
                        
                        window.open( eLnk );
                        
                        break;
                        
                    }
                    
                }
                
                return void( 0 );
                
            }
            
        }
        
    };
    
    
} )( document, window.ytplayer );




