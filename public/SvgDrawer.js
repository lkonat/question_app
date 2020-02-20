class SvgDrawer{
    constructor(args){
       this.svg = args.svg;
       this.isDown = false;
       this.current_shape = 'rect';
       this.current_target = false;
       this.stroke ='white';
       this.strokeWidth = "1px";
       this.distance =0;
       this.startPoint = {x:0,y:0};
    }
    dist(pointA,pointB){
        return {
            dist:Math.pow((pointB.x - pointA.x),2)  + Math.pow((pointB.y - pointA.y),2),
            x:(pointB.x - pointA.x),
            y:(pointB.y - pointA.y)
        };
    }
    mousemove(e){
        let x = e.clientX;
        let y = e.clientY;
        if(this.isDown){
            if(this.current_shape ==='circle'){
                 let current_point = {x:x,y:y};
                 let radius = this.dist(this.startPoint,current_point).dist/2;
                 this.current_target.r = radius;
                 this.current_target =  this.svgCircleAt(this.current_target);
            }else if(this.current_shape ==='rect'){
                let current_point = {x:x,y:y};
                let dist = this.dist(this.startPoint,current_point);
                this.current_target.width = dist.x;
                this.current_target.height = dist.y;
                if(dist.x>0 && dist.y>0){
                  this.current_target =  this.svgRectAt(this.current_target);
                }
           }
            console.log("mousemouse",x,y,this.current_target, radius);
        }
    }
    mouseup(e){
        let x = e.clientX;
        let y = e.clientY;
       // console.log("mouseup",x,y);
        this.isDown = false;
        this.current_target = false;
    }
    mousedown(e){
        let x = e.clientX;
        let y = e.clientY;
        this.isDown = true;
        this.startPoint = {x:x,y:y};
        if(this.current_shape ==='circle'){
            this.current_target =  this.svgCircleAt({cx:x,cy:y,r:7,class:this.makeid(),stroke:this.stroke,strokeWidth:this.strokeWidth});
        }else if(this.current_shape ==='rect'){
            this.current_target =  this.svgRectAt({
                x:x,
                y:y,
                width:1,
                height:1,
                class:this.makeid(),
                stroke:this.stroke,
                strokeWidth:this.strokeWidth
            });
        }
       // console.log("mousedown",x,y);
    }
    mouseClick(e){
        let x = e.clientX;
        let y = e.clientY;
       // console.log("mouseClick",x,y);
    }
    init(){
        
    }
    svgRectAt(args){
        let svg = this.svg; //Get svg element
        $("."+args.class).remove();
        let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create a path in SVG's namespace
        newElement.setAttribute("x",args.x); 
        newElement.setAttribute("y",args.y); 
        newElement.setAttribute("width",args.width); 
        newElement.setAttribute("height",args.height); 
       // newElement.setAttribute("style",args.style); 
        newElement.setAttribute("class",args.class); 
        newElement.setAttribute("fill",args.fill?args.fill:"none"); 
        newElement.style.stroke = args.stroke; 
        newElement.style.strokeWidth = args.strokeWidth; 
        svg.appendChild(newElement);
        return args;
    }
    svgCircleAt(args){
        let svg = this.svg; //Get svg element
        $("."+args.class).remove();
        let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
        newElement.setAttribute("cx",args.cx); 
        newElement.setAttribute("cy",args.cy); 
        newElement.setAttribute("r",args.r); 
        newElement.setAttribute("class",args.class); 
        newElement.setAttribute("fill",args.fill?args.fill:"none"); 
        newElement.style.stroke = args.stroke; 
        newElement.style.strokeWidth = args.strokeWidth; 
        svg.appendChild(newElement);
        return args;
    }
    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return new Date().getTime()+"I"+text;
       }
}