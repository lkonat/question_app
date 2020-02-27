class CoolScreen{
    constructor(args){
        this.host = args.host;
        this.init();
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
    clear(){
        this.ctx.clearRect(0, 0, this.canvas[0].width, this.canvas[0].height);
    }
    adjustOpacity(args){
       // this.canvas.css({opacity:args.opacity});
        this.clear();
        this.drawCool1();
        setTimeout(() => {
            //this.canvas.css({opacity:1});
            this.clear();
        }, args.for_time);
    }
    rect(args){
        this.ctx.beginPath();
        this.ctx.strokeStyle = args.color;
        this.ctx.lineWidth = args.lineWidth?args.lineWidth:'1px';
        this.ctx.fillStyle = args.color;
        this.ctx.rect(args.x, args.y, args.width, args.height);
        this.ctx.fill();
    }
    line(args){
        this.ctx.beginPath();
        this.ctx.strokeStyle = args.color;
        this.ctx.lineWidth = args.lineWidth;
        this.ctx.moveTo(args.x1, args.y1);
        this.ctx.lineTo(args.x2, args.y2);
        this.ctx.stroke();
    }
    circle(args){
        this.ctx.beginPath();
        this.ctx.strokeStyle = args.color;
        this.ctx.fillStyle = args.fillStyle?args.fillStyle:"white";
        this.ctx.lineWidth = args.lineWidth;
        this.ctx.arc(args.center.x, args.center.y, args.r, args.sAngle, args.endAngle);
        if(args.fillStyle){
         this.ctx.fill();
        }
        this.ctx.stroke();
        // this.circle({
        //     center:{x:pos4.x, y:pos4.y},
        //     r:3, 
        //     sAngle:0,
        //     endAngle:2* Math.PI,
        //     color:'white',
        //     fill:'white',
        //     lineWidth:3
        //  });
    }
    drawCool1(){
        this.circle({
            center:{x:this.canvas[0].width/2, y:this.canvas[0].height/2},
            r:100, 
            sAngle:0,
            endAngle:2* Math.PI,
            color:'steelblue',
            fill:"rgba(10,10,10,0.5)",
            lineWidth:3
        });
    }
    init(){
        this.canvas = $(`<canvas width="${window.innerWidth}" height="${window.innerHeight}" style='position:fixed; top:0px; left:0px;  background-color:transparent; z-index:100;pointer-events:none;'></canvas>`);
        this.host.append(this.canvas);
        this.ctx = this.canvas[0].getContext("2d");
        $(window).on("resize",()=>{
            this.canvas.attr("height",window.innerHeight);
            this.canvas.attr("width",window.innerWidth);
        });
    }
}
