/*

    Questa semplice libreria espone un oggetto che permette
    di ricavare i link per il download sul sito Youtube.
    
    YT.links()              // Restituisce un array di oggetti con i dettagli per il download
    YT.compat()             // Restituisce un array di stringhe a seconda del formato passato
    YT.download.button()    // Eseguito come bottone crea una popup con i link da scaricare
    YT.download.external()  // Passare un servizio esterno il codice verrà ricavato/sostituito %E
    
*/


( function( W, D, B ){
    
    /*
        
        Controllo di aver caricato gli elementi necessari
        altrimenti esco.
        
    */
    
    if( !D || !B)return false;
         
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
    
    function _getSelectedText(){
    
        var t = "";

        try{

            if( W.getSelection ){

                t = W.getSelection();

            }else if( D.getSelection ){

                t = D.getSelection();

            }else if( D.selection ){

                t = D.selection.createRange().text;

            }	

        }catch( e ){}

        return t;
		
    };
    
    function _getImageToShare(){

        var img = "";
        var tmp = D.getElementsByTagName( "meta" );
        
        try{
            
            // Preleviamo l'immagine da condividere
            for( var i = 0; i < tmp.length; i++ ){

              if( tmp[i].getAttribute( "property" ) == "og:image" ){

                img = tmp[ i ].getAttribute( "content" );
                break;

              }

            }
            
            // Altrimenti la prima che capita
            if( img.length < 1 ){

              tmp = "";
              tmp = document.getElementsByTagName( "img" );
              if( tmp && tmp[ 0 ] )img = tmp[ 0 ].getAttribute( "src" );

            }
            
        }catch( e ){}

        return img;

      };
    
    /*
            
        Apre una popup con il quale condividere il link della pagina ( %L ), l'immagine ( %I )
        e/o il testo selezionato ( %S ) e il titolo ( %T ) riferito al worker ( link di condivisione )

    */
    
    window.SH = function( worker ){       
        
        // Non ci siamo capiti
        if( !worker )return void( 0 );
        
        // Cambiamo i connotati al worker
        worker = worker.replace( /\%L/gi, encodeURIComponent( D.location.href ) )
                       .replace( /\%S/gi, encodeURIComponent( _getSelectedText() ) )
                       .replace( /\%T/gi, encodeURIComponent( D.title ) )
                       .replace( /\%I/gi, encodeURIComponent( _getImageToShare() ) );
        
        window.open( worker, "_blank", "height=400,width=600" );        
        
        return void( 0 );
        
    };
    
    
} )( window, document, document.body );

// SH( "https://twitter.com/intent/tweet?text=%S&url=%L&original_referer=%L" );




