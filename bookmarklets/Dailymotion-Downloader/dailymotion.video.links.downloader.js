/*

    Questa semplice libreria espone un oggetto che permette
    di ricavare i link per il download sul sito Dailymotion.
    
    DM.links()              // Restituisce un array di oggetti con i dettagli per il download
    DM.compat()             // Restituisce un array di stringhe a seconda del formato passato
    DM.download.button()    // Eseguito come bottone crea una popup con i link da scaricare
    
*/


( function( D ){
    
    /*
        
        Controllo di aver caricato gli elementi necessari
        altrimenti esco.
        
    */
    
    if( !D )return false;
    
    var uReq = new RegExp( "^http(?:s?):\/\/www\.dailymotion\.com\/embed\/video\/", "gi" ),
        sReq = new RegExp( "^http(?:s?):\/\/www\.dailymotion\.com\/video\/", "gi" );
        
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
    
    function _sanitizeName( name ){			
        
        return name.trim().replace( /[^a-z 0-9]+/gi, "" );//.replace( / /gi, "-" );	
    
    };
    
    window.DM = {
        
        /*
            
            Restituisce i link se li trova

        */

        links : function(){

            var links = [];

            /*
            
                Non capisco perchè questa condizione non lavora
                
                ( uReq.test( D.location.href ) === true )
                
                Sono stato costretto a bypassarlo
                
            */
            if( true ){ //uReq.test( D.location.href ) === true ){

                try{

                    // Controllo di avere l'oggetto giusto da dailymotion
                    if( info ){

                        if( info.stream_h264_hd1080_url )links.push( {

                            url  : info.stream_h264_hd1080_url,
                            type : "HD 1080"

                        } );
                    
                        if( info.stream_h264_hd_url )links.push( {

                            url  : info.stream_h264_hd_url,
                            type : "1280 x 720"

                        } );

                        if( info.stream_h264_hq_url )links.push( {

                            url  : info.stream_h264_hq_url,
                            type : "848 x 480"

                        } );   

                        if( info.stream_h264_url )links.push( {

                            url  : info.stream_h264_url,
                            type : "512 x 384"

                        } );

                        if( info.stream_h264_ld_url )links.push( {

                            url  : info.stream_h264_ld_url,
                            type : "320 x 240"

                        } );

                        if( info.stream_hls_url )links.push( {

                            url  : info.stream_hls_url,
                            type : "M3U8"

                        } );

                    }
                                        
                }catch( e ){}                                

            }
            
            return links;

        },
        
        /*
        
            Restituisce del codice html derivante il formato richiesto :
            
            esempio .compat( "<a href='%U'>%T</a>" )
            
            quindi restituisce un array convertendo i segnaposti con i valori richiesti
        
        */
        
        compat   : function( format ){
            
            format = format || "<a href='%U' title='%M'>%T</a>";
            
            var links   = DM.links(),
                compats = [];
            
            var reU = new RegExp( "\%U", "gi" ),
                reT = new RegExp( "\%T", "gi" ),
                reM = new RegExp( "\%M", "gi" );
        
            for( var i=0; i < links.length; i++ ){
              
                var tmp = format.replace( reU, links[ i ].url )
                                .replace( reT, links[ i ].type )
                                .replace( reM, D.title );
                
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
                
                // Se siamo nella sezione giusta procediamo
                if( uReq.test( D.location.href ) === true ){
                    
                    var mID = "DM-Links-Downloader";
                
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
                            
                            "font-size: 11px",
                            "width:70px",
                            "height:auto",
                            "max-height:160px",
                            "top:50%",
                            "left:50%",
                            "margin-top:-80px",
                            "margin-left:-35px",
                            "background-color:white",
                            "box-shadow: 1px 1px 14px 1px #333333",
                            "padding:2em",
                            "overflow:auto",
                            "z-index:99999999999",
                            "position:fixed",
                            "text-align:left",
                            "color:black"

                        ].join( ";" ),

                        // I nostri links
                        pUpLinks = DM.compat( "<p style='margin-bottom: 3px;'><a onclick=\"alert( 'Right click then save as ...' );return false;\" href='%U' title='%M' style='text-decoration:none'>[ %T ]</a></p>", true );

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
                                        
                }else if( !sReq.test( D.location.href ) ){
                    
                    alert( "Use this bookmarklet on :\r\n http://www.dailymotion.com/video/($video $code)"
                         + "\r\n http://www.dailymotion.com/embed/video/($video $code)" );
                    
                }else{
                    
                    // Prelevo il codice e informo
                    var code = D.location.href.replace( sReq, "" ).trim();

                    alert( "Now i open new tab with good link then restart this bookmarklet !" )
                    window.open( "http://www.dailymotion.com/embed/video/" + code );
                    
                }       
                
                return void( 0 );
                
            }
            
        }
        
    };
    
    
} )( document );
