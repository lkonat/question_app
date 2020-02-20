function makeItDraggleWIthClassName(args){
    if(args.elt && args.className){
        args.elt.addClass("oModal");
        args.elt.find(`.${args.className}`).css({"cursor":"grab"});
      // elt[0].addEventListener('touchstart', function(){
      //   alert("tap");
      // }, false);
      args.elt[0].addEventListener('touchmove', function(e){
        if(e.target.className ===args.className || $(e.target).hasClass(args.className)){
            args.elt.draggable( "option", "disabled",false);
        }else {
            args.elt.draggable( "option", "disabled",true);
        }
      }, false);
      args.elt.on("mousedown",function(e){
          if(e.target.className ===args.className || $(e.target).hasClass(args.className)){
            args.elt.draggable( "option", "disabled",false);
          }else {
            args.elt.draggable( "option", "disabled",true);
          }
      });
      args.elt.draggable({
        stack: ".oModal",
        drag: function( event, ui ) {
            let factor = args.elt.width();
          if((ui.position.left + factor) >=$('body').width()-100){
            //ui.position.left = $('body').width() -factor;
          }
          if(ui.position.left<0){
            ui.position.left =0;
          }
          if(ui.position.top<0){
            //ui.position.top =0;
          }
          if((ui.position.top + 100) >=$('body').height()){
            //ui.position.top = $('body').height() -100;
          }
          $(ui.helper[0]).css({border:`2px solid ${args.color?args.color:'white'}`});
        }
        ,
         stop: function( event, ui ) {
           $(ui.helper[0]).css({border:"none"});
         }
      });
    }
  }