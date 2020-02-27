class CanvasClock{
    constructor(args){
       this.id = this.makeid();
       this.host = args.host;
       this.width = args.width;
       this.height = args.height;
       this.initView(()=>{
        this.x = this.canvas[0].width/2;
        this.y = this.canvas[0].height/2;
        this.r = this.canvas[0].width/15;
        this.sAngle = 0;
        this.lineWidth = 5;
        this.color = 'white';
        this.endAngle = 0;
        this.timer = setInterval(() => {
            this.endAngle = this.endAngle +6;
            console.log(new Date().getSeconds())
            this.sAngle = this.sAngle +6;
            if(this.sAngle>=360){
                //this.stop();
                this.endAngle =0;
                this.sAngle = 0;
            }
        this.clear();
           this.showVlock();
             this.show();
             //console.log(this.endAngle);

        }, 1000);
   });
    }
    showVlock(){
        for(let i =0; i< 360; i+=30){
            let posA =  this.polarToCartesian(this.x, this.y, 3, i);
            let posB =  this.polarToCartesian(this.x, this.y, 10, i);
            let pos =  this.polarToCartesian(this.x, this.y, this.r+10, i);
            let pos2 =  this.polarToCartesian(this.x, this.y, this.r+20, i);
            this.line({
              x1:pos.x,
              y1:pos.y,
              x2:(pos2.x),
              y2:(pos2.y),
              color:"white",
              lineWidth:2
            });
            // this.line({
            //     x1:posA.x,
            //     y1:posA.y,
            //     x2:(posB.x),
            //     y2:(posB.y),
            //     color:"white",
            //     lineWidth:2
            //   });
            //   this.textAt({
            //         text:i,
            //         x:pos2.x+10,
            //         y:pos2.y,// + ((this.label.length-1) * 2),
            //         angle:0
            //   });
        }
        for(let i =0; i< 360; i+=6){

            let pos =  this.polarToCartesian(this.x, this.y, this.r+20, i);
            let pos2 =  this.polarToCartesian(this.x, this.y, this.r+25, i);
            this.line({
              x1:pos.x,
              y1:pos.y,
              x2:(pos2.x),
              y2:(pos2.y),
              color:"white",
              lineWidth:2
            });
        }
    }
    textAt(args){
        this.ctx.font='10px monospace';
        this.ctx.fillStyle = "white";
        this.ctx.save();
        this.ctx.translate(args.x, args.y);
        this.ctx.rotate(((args.angle) * Math.PI / 180));
        this.ctx.textAlign = "left";
        this.ctx.fillText(args.text, 0, 0);
        this.ctx.restore();
    }
    polarToCartesian(centerX, centerY, radius, angleInDegrees){
        let angleInRadians = (angleInDegrees) * Math.PI / 180.0;
        return {
          x: centerX + (radius * Math.cos(angleInRadians)),
          y: centerY + (radius * Math.sin(angleInRadians))
        };
      }
    clear(){
        
        this.ctx.clearRect(0,0, this.canvas[0].width, this.canvas[0].height);
    }
    stop(){
        clearInterval(this.timer);
    }
    line(args){
        this.ctx.beginPath();
        this.ctx.strokeStyle = args.color;
        this.ctx.lineWidth = args.lineWidth;
        this.ctx.moveTo(args.x1, args.y1);
        this.ctx.lineTo(args.x2, args.y2);
        this.ctx.stroke();
   }
    show(){
        let hour = new Date().getHours();
        let seconds = new Date().getSeconds();
        hour = hour>=12?(hour - 12):hour;
        console.log(hour,"hour");
        let pos =  this.polarToCartesian(this.x, this.y, this.r, (seconds*6 -90));
        let pos2 =  this.polarToCartesian(this.x, this.y, this.r-20, (new Date().getMinutes()*6 -90));
        let pos3 =  this.polarToCartesian(this.x, this.y, this.r-40, ((hour*30)-90));
        let pos4 =  this.polarToCartesian(this.x, this.y, this.r+45, (seconds*6 -90));
        this.line({
          x1:this.x,
          y1:this.y,
          x2:(pos.x),
          y2:(pos.y),
          color:"white",
          lineWidth:1
        });
        this.circle({
           center:{x:pos4.x, y:pos4.y},
           r:3, 
           sAngle:0,
           endAngle:2* Math.PI,
           color:'white',
           fill:'white',
           lineWidth:3
        });
       // console.log(this.ctx.measureText(seconds));
        // let length_x = this.ctx.measureText(seconds).width;
        //   this.textAt({
        //         text:seconds,
        //         x:pos4.x+(length_x/2),
        //         y:pos4.y+(length_x/2),
        //         angle:0
        //   });
        this.line({
            x1:this.x,
            y1:this.y,
            x2:(pos2.x),
            y2:(pos2.y),
            color:"white",
            lineWidth:3
          });
          this.line({
            x1:this.x,
            y1:this.y,
            x2:(pos3.x),
            y2:(pos3.y),
            color:"white",
            lineWidth:5
          });

        // this.draw({
        //     center:{x:this.x,y:this.y},
        //     r:this.r,
        //     sAngle:(this.sAngle) * Math.PI / 180.0,
        //     endAngle:(this.endAngle) * Math.PI / 180.0
        // });
    }
    on(what,that){
        if(!this.cEvents){this.cEvents = {};}
        this.cEvents[what] = that;
    }
    fireEvent(what,args){
        if(!this.cEvents){this.cEvents = {}; }
        if(this.cEvents[what]){this.cEvents[what](args);}
    }
    initView(callBack){
        this.main = $(`<div style='width:${this.width}px; height:${this.height}px; background-color:black;position:relative;margin:0 auto;'></div>`);
        this.canva_view_port = $(`<div style='width:${this.width}px; height:${this.height}px; position:absolute; top:0px; left:0px;background-color:transparent;z-index:2;'></div>`);
        this.canvas = $(`<canvas width="${this.width}" height="${this.height}" style='position:absolute; top:0px; left:0px;  background-color:transparent;z-index:1;pointer-events:none;'></canvas>`);
        $(this.main ).append(this.canva_view_port,this.canvas);
        this.host.append(this.main);
        this.ctx = this.canvas[0].getContext("2d");
        let grd = this.ctx.createLinearGradient(0, 0, 170, 0);
        grd.addColorStop(0, "black");
        grd.addColorStop(1, "white");
        this.ctx.fillStyle = grd;


        this.canva_view_port.click((e)=>{
            let offset = this.canva_view_port.offset();
            let x = e.clientX - (offset.left - $(window).scrollLeft());
            let y = e.clientY - (offset.top - $(window).scrollTop());
           // console.log({x:x,y:y});
            
        });
        this.canva_view_port.mousemove((e)=>{
            let offset = this.canva_view_port.offset();
            let x = e.clientX - (offset.left - $(window).scrollLeft());
            let y = e.clientY - (offset.top - $(window).scrollTop());
           // console.log({x:x,y:y});
        });
        callBack();
    }
    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 7; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return new Date().getTime()+"I"+text;
      }
    draw(args){
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = 'white';
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.arc(args.center.x, args.center.y, args.r, args.sAngle, args.endAngle);
        //this.ctx.fill();
        this.ctx.stroke();
    }
    circle(args){
        this.ctx.beginPath();
        this.ctx.strokeStyle = args.color;
        this.ctx.fillStyle = 'white';
        this.ctx.lineWidth = args.lineWidth;
        this.ctx.arc(args.center.x, args.center.y, args.r, args.sAngle, args.endAngle);
        //this.ctx.fill();
        this.ctx.stroke();
    }
}
class CanvasLabParticle{
    constructor(args){
         this.wal = args.wal;
         this.id = args.id;
         this.ctx = args.ctx;
         this.color = args.color?args.color:'white';
         this.lineWidth = 2;
         this.x = args.x;
         this.y = args.y;
         this.r = args.r;
         this.temp_r = this.r;
         this.temp_x = this.x;
         this.factor = 1;
         this.xDir = 1;
         this.yDir = 1;
         this.init();
    }
    reverse(){
        this.factor = this.factor *( -1);
    }
    init(){
        if(this.temp_r>=this.r){
            this.reverse();
        }
        if(this.temp_r<1){
            this.reverse();
        }
       // this.temp_r = this.temp_r + this.factor*(1);
       // this.x  = this.x + this.factor*(-3);
        this.x = this.x + this.xDir;
        this.y = this.y + this.yDir;
        if((this.x+this.r>=this.wal.width) || (this.x - this.r <=0)){
            this.xDir = this.xDir * -1;
        }
        if((this.y+this.r>=this.wal.height) || (this.y - this.r <=0)){
            this.yDir = this.yDir * -1;
        }
        this.draw({
            center:this.point(this.x,this.y),
            r: this.temp_r,
            sAngle:0
        });
    }
    check(x,y){
        if(Math.pow((x - this.x),2) + Math.pow((y - this.y),2) < Math.pow(this.r,2)){
            this.fireEvent("clicked",this.id);
            console.log(this.id);
        }
    }
    on(what,that){
        if(!this.cEvents){
            this.cEvents = {}; 
        }
        this.cEvents[what] = that;
    }
    fireEvent(what,args){
        if(!this.cEvents){
            this.cEvents = {}; 
        }
        if(this.cEvents[what]){
            this.cEvents[what](args);
        }
    }
    point(x,y){
        return {x:x,y:y};
    }
    draw(args){
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = 'white';
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.arc(args.center.x, args.center.y, args.r, args.sAngle, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
    }
}

class CanvasLab{
    constructor(args){
         this.color = 'black';
         this.elements = {};
         this.lines = {};
         this.host = args.host;
         this.width = args.width;
         this.height = args.height;
         this.selections ={};
         this.initView(()=>{
              this.addCircles(30);
              this.timer = setInterval(() => {
                   this.clear();
                   this.scene();
              }, 1);
         });
         this.map = {};
    }
    addCircles(n){
        for(let i =0; i<n; i++){
            let id = this.makeid();
            let radius = Math.floor(Math.random() * 50) + 7;
            let elt = new CanvasLabParticle({
                wal:{width:this.canvas[0].width,height:this.canvas[0].height},
                id:id,
                ctx: this.ctx,
                x: Math.floor(Math.random() * this.canvas[0].width-radius-30) + radius + 30,
                y: Math.floor(Math.random() * this.canvas[0].height-radius-30) + radius + 30,
                // x: this.canvas[0].width/2,
                // y: this.canvas[0].height/2,
                r:radius
            });
            elt.on("delete",(id)=>{
                delete this.elements[id];
            });
            elt.on("clicked",(id)=>{
                this.select(id);
            });
            this.elements[id]=elt;
            //this.select(id);
        }
    }
    select(id){
        if(!this.selections["A"]){
            this.selections["A"] = this.elements[id];
        }else{
            this.selections["B"] = this.elements[id];
            let idx = this.makeid();
            this.lines[idx] = {A:this.selections["A"] ,B:this.selections["B"]}

            this.selections ={};
        }
    }
    line(args){
        this.ctx.beginPath();
        this.ctx.strokeStyle = args.color;
        this.ctx.lineWidth = args.lineWidth;
        this.ctx.moveTo(args.x1, args.y1);
        this.ctx.lineTo(args.x2, args.y2);
        this.ctx.stroke();
   }
    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 7; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return new Date().getTime()+"I"+text;
      }
    clear(){
        this.ctx.clearRect(0,0, this.canvas[0].width, this.canvas[0].height);
    }
    scene(){
       let n =0; 
       for(let elt in  this.elements){
        n++;
        this.elements[elt].init();
       }
       if(n===0){
        this.addCircles(5);
       }
       for(let elt in  this.lines){
           let l_x = this.lines[elt];
            this.line({
                x1:l_x["A"].x,
                y1:l_x["A"].y,
                x2:l_x["B"].x,
                y2:l_x["B"].y,
                color:"white",
                lineWidth:2
            });
       }
    }
    on(what,that){
        if(!this.cEvents){
            this.cEvents = {}; 
        }
        this.cEvents[what] = that;
    }
    fireEvent(what,args){
        if(this.cEvents[what]){
            this.cEvents[what](args);
        }
    }
    showPane(args){
        let h_x = 50;
        if(args.hide && this.panel){
            this.panel.hide();
            return;
        }
        if(!this.panel){
            this.panel = $(`<div style=' height:${h_x}px; min-width:100px; position:absolute; top:${args.y - h_x - 3}px; left:${args.x}px;display:table; border-radius:7%; max-width:300px;overflow:scroll;background-color:whitesmoke; color:black;box-shadow: 0 0 5px #aaaaaa;padding:3px;'></div>`);
            this.canva_view_port.append(this.panel);
        }
        this.panel.stop();
        this.panel.html(args.content);
        this.panel.show();
        this.panel.animate({top:`${args.y - h_x-3}px`  , left:`${args.x}px`},100);
    }
    initView(callBack){
        this.main = $(`<div style='width:${this.width}px; height:${this.height}px; background-color:black;position:relative;margin:0 auto;'></div>`);
        this.canva_view_port = $(`<div style='width:${this.width}px; height:${this.height}px; position:absolute; top:0px; left:0px;background-color:transparent;z-index:2;'></div>`);
        this.canvas = $(`<canvas width="${this.width}" height="${this.height}" style='position:absolute; top:0px; left:0px;  background-color:transparent;z-index:1;pointer-events:none;'></canvas>`);
        $(this.main ).append(this.canva_view_port,this.canvas);
        this.host.append(this.main);
        this.ctx = this.canvas[0].getContext("2d");
        this.canva_view_port.click((e)=>{
            let offset = this.canva_view_port.offset();
            let x = e.clientX - (offset.left - $(window).scrollLeft());
            let y = e.clientY - (offset.top - $(window).scrollTop());
           // console.log({x:x,y:y});
            for(let elt in  this.elements){
                this.elements[elt].check(x,y);
            }
        });
        this.canva_view_port.mousemove((e)=>{
            let offset = this.canva_view_port.offset();
            let x = e.clientX - (offset.left - $(window).scrollLeft());
            let y = e.clientY - (offset.top - $(window).scrollTop());
           // console.log({x:x,y:y});
        });
        callBack();
    }

}


