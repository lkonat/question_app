class GraphAwaElt{
    constructor(args){
        this.value = args.value;
       this.label_color='black';
       this.label = args.label;
       this.idx = args.idx;
       this.ctx = args.ctx;
       this.type = args.type;
       this.color =args.color;
       this.x = args.x;
       this.y = args.y;
       this.width = args.width; 
       this.height = args.height;
       this.Ax = this.x;
       this.Ay = this.y;

       this.Bx = this.Ax + this.width;
       this.By = this.y;

       this.Cx = this.x;
       this.Cy = this.Ay+ this.height;

       this.Dx = this.Ax + this.width;
       this.Dy = this.Ay+ this.height;
       this.draw();
       this.textAt({
        text:this.label,
        x:this.x,
        y:(this.y + this.height) + 10,// + ((this.label.length-1) * 2),
        angle:20
        });
    }
    applyScale(val){
        return val/5;
    }
    textAt(args){
        this.ctx.font='10px monospace';
        this.ctx.fillStyle = this.label_color;
        // this.ctx.fillText(args.text, args.x, args.y);
        // if(args.angle){
        //     this.ctx.rotate((args.angle * Math.PI / 180));
        // }

        this.ctx.save();
        this.ctx.translate(args.x, args.y);
        this.ctx.rotate(((args.angle) * Math.PI / 180));
        this.ctx.textAlign = "left";
        this.ctx.fillText(args.text, 0, 0);
        this.ctx.restore();
    }
    clear(){
        this.ctx.clearRect(this.x, this.y, this.width, this.height);
    }
    redraw(){
        this.clear();
        this.draw();

    }
    line(args){
        this.ctx.beginPath();
        this.ctx.strokeStyle = args.color;
        this.ctx.lineWidth = args.lineWidth;
        this.ctx.moveTo(args.x1, args.y1);
        this.ctx.lineTo(args.x2, args.y2);
        this.ctx.stroke();
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
    draw(){
        if(this.type==='rect'){
        //  this.rect({
        //     x:this.x,
        //     y:this.y,
        //     width:this.width,
        //     height:this.height,
        //     color:this.color
        // });
        this.rectAnimate({
            x:this.x,
            y:(this.y),
            width:this.width,
            height:(this.height),
            color:this.color
        },()=>{
            console.log("done",this.idx);
        });
        }
    }
    rectAnimate(args,callBack0){
        let step = args.height/(10);
        console.log("ss",args.height, step);
        let drawOne = (param,callBack)=>{
            if(!param.temp_y){
                param.temp_y = param.height + param.y;
            }else{
                param.temp_y = param.temp_y - step;
            }
            if(!param.temp_h && param.temp_h!==0){
                param.temp_h = 0;
            }else{
                param.temp_h = param.temp_h+ step;
            }
            if(param.temp_y<=1 || param.temp_y >=1000 || (param.temp_y <= param.y) ){

                // var gradient = this.ctx.createLinearGradient(this.x, this.y, this.width, this.height);
                // gradient.addColorStop("0",param.color);
                // gradient.addColorStop("1.0", "red");

                // this.ctx.shadowColor = "black";
                // this.ctx.shadowBlur = 6;
                // this.ctx.shadowOffsetX = 3;
                // this.ctx.shadowOffsetY = 3;



                this.clear();
                this.ctx.beginPath();
                this.ctx.strokeStyle = param.color;
                this.ctx.lineWidth = 0.5;
                this.ctx.fillStyle =param.color;
                this.ctx.rect(param.x, param.y, param.width, param.height);
                this.ctx.fill();
                return callBack();
            }else{
                this.clear();
                this.ctx.beginPath();
                this.ctx.strokeStyle = param.color;  
                this.ctx.lineWidth = 0.5;
                this.ctx.fillStyle = param.color;
                this.ctx.rect(param.x, param.temp_y, param.width, param.temp_h);
                this.ctx.fill();
                setTimeout(()=>{
                    drawOne(param,callBack);
                },10);
            }
        };
       drawOne({
         color:args.color,
         x:args.x,
         y:args.y,
         width:args.width,
         height:args.height
       },()=>{
        return callBack0();
       });
    }
    rect(args){
        this.ctx.beginPath();
        this.ctx.strokeStyle = args.color;
        this.ctx.globalAlpha = 0.5;  
        this.ctx.lineWidth = 0.5;
        this.ctx.fillStyle = args.color;
        this.ctx.rect(args.x, args.y, args.width, args.height);
        this.ctx.fill();
   }
   checkIf(x,y){
       if(((x>this.Ax && x>this.Cx) && (x<this.Bx && x<this.Dx)) && ((y>this.Ay && y>this.By) && (y<this.Cy && y< this.Dy))){
            return true;
       }else{
            return false;
       }
   }
   clickDetected(args){
       let is_inBox = this.checkIf(args.x,args.y);
       if(is_inBox){
           this.fireEvent("clicked",{x:this.x,y:this.y,idx:this.idx,content:`<span>${this.label}: ${this.value}</span>`});
       }
   }

   mouseDidmove(args){
    let is_inBox = this.checkIf(args.x,args.y);
    if(is_inBox){
        if(!this.mouseEntered){
            this.fireEvent("hovered",{x:this.x,y:this.y,idx:this.idx,content:`<span>${this.label}: ${this.value}</span>`});
        }
        this.mouseEntered = true;
    }else{
        if(this.mouseEntered){
            this.fireEvent("leave",this.idx);
            this.mouseEntered = false;
        }
    }
   }
}

class GraphAwa{
    constructor(args){
         this.scale = 3;
         this.color = 'black';
         this.elements = [];
         this.host = args.host;
         this.width = args.width;
         this.height = args.height;
         this.h_step =  30;
         this.data = args.data;
         this.initView(()=>{
            this.getStatsIndata();
            this.point0 = 50
            this.xPos = this.point0 + 10;
            this.gape = 10;
            this.lengths = {
                margin_top:100,
                top:100, //from the 0
                ground: this.canvas[0].height - 100, //from the zero 
                each_width:(this.canvas[0].width -this.xPos )/(this.data.items.length) - (this.gape*1.5)

            };
       
            this.scale = (this.largest/(this.lengths.ground -( this.lengths.margin_top)));
            if(this.data.type==="bar"){
               this.bar();
            }else if(this.data.type==="waterfall"){
               this.waterfal();
            }
         });
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
    textAt(args){
        this.ctx.font='10px monospace';
        this.ctx.textAlign = "right";
        this.ctx.fillStyle = args.color;
        this.ctx.fillText(args.text, args.x, args.y);
    }
    showVerticalPointRepers(){
        // for(let i=0; i<this.data.items.length; i++){
        //    let value = this.data.items[i].value;
        //    let n_x = value.toString().length;
        //    this.textAt({
        //        text:value,
        //        x:this.point0-20-(n_x),
        //        y:(this.lengths.ground - this.applyScale(value +(3))),
        //        color:'red'
        //    });
        //    this.line({
        //        x1:this.point0-3,
        //        y1:(this.lengths.ground - this.applyScale(value)),
        //        x2:this.point0+4,
        //        y2:(this.lengths.ground - this.applyScale(value)),
        //        color:this.color,
        //        lineWidth:0.3
        //    });
        // }
        for(let i=0; i<this.lengths.ground; i+=this.h_step){
            let txt = (i * this.scale);
            let txt1 = txt.toFixed((txt<0.9?2:(txt>1?0:1)));
            if(i===0){
                txt1 = 0;
            }
            this.textAt({
                text:txt1,
                x:this.point0-3,
                y:this.lengths.ground - i +(3),
                color:this.color
            });
            this.line({
                x1:this.point0,
                y1:this.lengths.ground - i,
                x2:this.point0+this.xPos,
                y2:this.lengths.ground - i,
                color:this.color,
                lineWidth:0.2
            });
        }
    }
    showHorizontalLine(){
        this.line({
            x1:this.point0,
            y1:this.lengths.ground,
            x2: this.xPos,//this.canvas[0].width,
            y2: this.lengths.ground,
            color:this.color,
            lineWidth:0.5
        });
    }
    applyScale(val){
        return val/this.scale;
    }
    showVerticalLine(){
        this.line({
            x1:this.point0,
            y1:0,
            x2:this.point0,
            y2:this.lengths.ground,
            color:this.color,
            lineWidth:0.5
        });
        this.showVerticalPointRepers();
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

       // this.panel.css({top:`${args.y - h_x-3}px`  , left:`${args.x}px`});
        this.panel.html(args.content);
        this.panel.show();
        this.panel.animate({top:`${args.y - h_x-3}px`  , left:`${args.x}px`},100);
    }
    initView(callBack){
        this.main = $(`<div style='width:${this.width}px; height:${this.height}px; background-color:whitesmoke;position:relative;margin:0 auto;'></div>`);
        this.canva_view_port = $(`<div style='width:${this.width}px; height:${this.height}px; position:absolute; top:0px; left:0px;background-color:transparent;z-index:2;'></div>`);
        this.canvas = $(`<canvas width="${this.width}" height="${this.height}" style='position:absolute; top:0px; left:0px;  background-color:transparent;z-index:1;pointer-events:none;'></canvas>`);
        //this.canva_view_port.append(this.canvas);
        $(this.main ).append(this.canva_view_port,this.canvas);
        this.host.append(this.main);
        this.ctx = this.canvas[0].getContext("2d");
        this.canva_view_port.click((e)=>{
            let offset = this.canva_view_port.offset();
            let x = e.clientX - (offset.left - $(window).scrollLeft());
            let y = e.clientY - (offset.top - $(window).scrollTop());
            for(let i =0; i< this.elements.length; i++){
                this.elements[i].clickDetected({x:x,y:y});
            }
        });
        this.canva_view_port.mousemove((e)=>{
            let offset = this.canva_view_port.offset();
            let x = e.clientX - (offset.left - $(window).scrollLeft());
            let y = e.clientY - (offset.top - $(window).scrollTop());
            console.log(offset);
            for(let i =0; i< this.elements.length; i++){
                this.elements[i].mouseDidmove({x:x,y:y});
            }
        });
        callBack();
    }
    findLabelByName(name){
        for(let i =0; i< this.data.items.length; i++){
            if(this.data.items[i].label === name){
              return this.data.items[i];
            }
         }
         return false;
    }
    replaceLabelByName(label,target,newValue){
        for(let i =0; i< this.data.items.length; i++){
            if(this.data.items[i].label === label){
              this.data.items[i][target]  = newValue;
              return this.data.items[i];
            }
         }
         return false;
    }
    addCalculatedLabel(){
        let extract =(type,str)=>{
            let elts = str.replace(type,"").replace(/\(|\)/g, "").split(",");
            if(elts.length >0){
              if(type.toLowerCase() ==='sum'){
                let sum = 0;
                for(let i =0; i<elts.length; i++){
                    sum = sum + this.findLabelByName(elts[i]).value;
                }
                console.log(type,"==>",elts,sum);
                return sum;
              }
            }
        };
        for(let i =0; i< this.data.items.length; i++){
            if(typeof this.data.items[i].value === 'string'){
              let value = this.data.items[i].value.trim();
              let label = this.data.items[i].label;
              if(value.startsWith("Sum")){
                let sum = extract("Sum",value);
                if(sum || sum ===0){
                    this.replaceLabelByName(label,"value",sum);
                  }
              }else if(value.startsWith("sum")){
                let sum = extract("sum",value);
                if(sum || sum ===0){
                    this.replaceLabelByName(label,"value",sum);
                  }
              }
            }
         }
         return false;
    }
    getStatsIndata(){ 
        this.addCalculatedLabel();
        let largest = -Infinity;
        let lowest = Infinity;
        let currentSum = 0;
        if(this.data.type ==='waterfall'){

            for(let i =0; i< this.data.items.length; i++){
                 currentSum = currentSum + this.data.items[i].value;
                if(currentSum>largest){
                   largest = currentSum;
                }
                if(currentSum<lowest){
                   lowest = currentSum;
                }
             }
                      //add total field 
         this.data.items.push({label:"Total",type:'total' ,color:"rgba(46,204,113,0.6)"});
        }else if(this.data.type ==='bar'){
            for(let i =0; i< this.data.items.length; i++){
                if(this.data.items[i].value>largest){
                   largest = this.data.items[i].value;
                }
                if(this.data.items[i].value<lowest){
                   lowest = this.data.items[i].value;
                }
             }
        }
        this.lowest = lowest;
        this.largest = largest;
    }
    addOneElt(args){
        let elt = new GraphAwaElt({
            idx:args.idx,
            ctx:this.ctx,
            x:args.xPos,
            y:(this.lengths.ground- this.applyScale(args.value)),
            width:this.lengths.each_width,
            height:this.applyScale(args.height),
            label:args.label,
            value:args.value,
            color:args.color,
            type:'rect'
        });
        elt.on("clicked",(par)=>{
           this.showPane({
               x:par.x,
               y:par.y,
               content:par.content
           });
           this.elements[par.idx].redraw();
        });
        elt.on("hovered",(par)=>{
          this.showPane({
              x:par.x,
              y:par.y,
              content:par.content
          });
       });
       elt.on("leave",(idx)=>{
          console.log("left ", idx);
          this.showPane({
              hide:true
          });
       });
        this.elements.push(elt);
    }
    waterfal(args){
        this.elements = [];
        let current_value = 0;
        for(let i =0; i< this.data.items.length; i++){ 
            if(this.data.items[i].type === 'total'){
                this.addOneElt({
                    value:current_value,
                    height:current_value,
                    idx:i,
                    label:this.data.items[i].label,
                    color:this.data.items[i].color,
                    xPos: this.xPos
                 });
            }else{
                current_value = current_value + this.data.items[i].value;
                this.addOneElt({
                   value:this.data.items[i].value<0?(current_value - this.data.items[i].value):current_value,
                   height:this.data.items[i].value<0?(-1*this.data.items[i].value):this.data.items[i].value,
                   idx:i,
                   label:this.data.items[i].label,
                   color:(this.data.items[i].value>0?this.data.items[i].color:"rgba(244,66,66,0.6)"),
                   xPos: this.xPos
                });
            }
            this.xPos+= this.lengths.each_width + this.gape;
        }
        //this.showHorizontalLine();
        this.showVerticalLine();   
      }
    bar(args){
      this.elements = [];
      for(let i =0; i< this.data.items.length; i++){    
        this.addOneElt({
            value:this.data.items[i].value,
            idx:i,
            height:this.data.items[i].value,
            label:this.data.items[i].label,
            color:this.data.items[i].color,
            xPos: this.xPos
         });
          this.xPos+= this.lengths.each_width + this.gape;
      }
      //this.showHorizontalLine();
      this.showVerticalLine();   
    }
    line(args){
         this.ctx.beginPath();
         this.ctx.strokeStyle = args.color;
         this.ctx.lineWidth = args.lineWidth;
         this.ctx.moveTo(args.x1, args.y1);
         this.ctx.lineTo(args.x2, args.y2);
         this.ctx.stroke();
    }
    rect(args){
         this.ctx.beginPath();
         this.ctx.strokeStyle = args.color;
         this.ctx.lineWidth = '1px';
         this.ctx.fillStyle = args.color;
         this.ctx.rect(args.x, args.y, args.width, args.height);
         this.ctx.fill();
    }

}


