class SvgCoolCircle{
    constructor(args){
        this.filter_id = args.filter_id;
       this.speed = args.speed;
       this.uid = this.makeCid();
       this.x = args.x;
       this.y = args.y;
       this.radius= args.r;
       this.svg = args.svg;
       this.start=args.start, 
       this.end= args.end,
       this.class=this.uid,
       this.fill=args.fill,
       this.stroke=args.stroke,
       this.strokeWidth=args.strokeWidth;
       this.timer = false;
       this.circles = {};
       this.temp_tart = this.start;
       this.init(true);
    }
    move(x,y){
        this.x = x; 
        this.y = y;
        this.init(true);
    }
    init(animate){
        this.temp_tart = this.start;
        if(animate){
            this.timer = setInterval(()=>{
                this.temp_tart+=1;
                if(this.temp_tart>=this.end){
                  clearInterval(this.timer);
                  this.timer = false;
                  this.init();
                }else{
                    this.drawCircle(this.svg,
                        {
                            x:this.x, 
                            y:this.y, 
                            r:this.radius, 
                            start:this.temp_tart, 
                            end:this.end,
                            class:this.class,
                            fill:this.fill,
                            stroke:this.stroke,
                            strokeWidth:this.strokeWidth
                        });
                }
            },3);
        }else{
            this.drawCircle(this.svg,
                {
                    x:this.x, 
                    y:this.y, 
                    r:this.radius, 
                    start:this.start, 
                    end:this.end,
                    class:this.class,
                    fill:this.fill,
                    stroke:this.stroke,
                    strokeWidth:this.strokeWidth
                });
            }

    }
    svgPath(svg,args){
        let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
        newElement.setAttribute("d",args.d); 
        newElement.setAttribute("class",args.class); 
        newElement.setAttribute("fill",args.fill); 
        if(args.filter_id){
            newElement.setAttribute("filter",args.filter_id);
        }
        newElement.style.stroke = args.stroke; 
        newElement.style.strokeWidth = args.strokeWidth; 
        svg.appendChild(newElement);
    }
    drawCircle(svg,args){
        $(`.${args.class}`).remove();
         let x=args.x, y=args.y, radius=args.r, startAngle=args.start, endAngle=args.end;
         let polarToCartesian = (centerX, centerY, radius, angleInDegrees)=>{
            let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
            return {
              x: centerX + (radius * Math.cos(angleInRadians)),
              y: centerY + (radius * Math.sin(angleInRadians))
            };
          }
          let start = polarToCartesian(x, y, radius, endAngle);
          let end = polarToCartesian(x, y, radius, startAngle);
          let largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
          let d = [
              "M", start.x, start.y, 
              "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
          ].join(" ");
          this.svgPath(svg,{
              d:d,
              class:args.class,
              fill:args.fill,
              strokeWidth:args.strokeWidth,
              stroke:args.stroke,
              filter_id:this.filter_id
          });
          return d;    
    }
    makeCid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return new Date().getTime()+"I"+text;
       }

}