
class RelationshipActor{
    constructor(){
       this.relationship = false;
       this.targetA = false;
       this.targetB = false;
       this.x_events = {};
    }


    changeCursor(what){
        $("body").css({"cursor":what});
    }
    on(what, that){
        this.x_events[what] = that;
    }
    fireEvent(what,args){
     if(this.x_events[what]){
        this.x_events[what](args);
     }
    }
    relationshipDidBuilt(args){
        this.fireEvent('remove-connection',{name:'mouse_line'});
        console.log(this.targetA,this.targetB);
        let from = {
            table:this.targetA,
            column:{name: `${this.targetA.name}_has_${this.targetB.name}_id`,fk:true}
        };
        let to = {
            table:this.targetB,
            column:{name: `${this.targetB.name}_id`,pk:true}
          };
        this.fireEvent('relationship-built',{from:from, to:to,relationship:this.relationship});
        this.reset();
    }
    reset(){
       this.fireEvent('remove-connection',{name:'mouse_line'});
       this.changeCursor("default");
       this.relationship = false;
       this.targetA = false;
       this.targetB = false;
    }
    set(relationship){
        this.reset();
        this.relationship = relationship;
        this.changeCursor("crosshair");
    }
    addTarget(table){
        if(this.relationship){
            if(this.targetA){
             if(this.targetB){
               this.relationshipDidBuilt();
             }else{
               this.targetB = table;
               this.relationshipDidBuilt();
             }
            }else{
              this.targetA = table
              this.fireEvent('create-connection',{
                tableA:table,
                is_mouse:true,
                c_uid:'mouse-line123',
                connection_name:'mouse_line'
              });
            }
          }else{
              console.log("no relationship yselected yet");
              this.fireEvent('normal-click',{
                table:table,
              });
          }
    }
}
class SqliteMaster{
    constructor(args){
      this.host = args.host;
      this.c_width = window.innerWidth;
      this.c_height = window.innerHeight;
      this.query1 =`SELECT * FROM sqlite_master WHERE type ='table' AND name NOT LIKE 'sqlite_%';`;
      this.tables = {};
      this.menu_elts ={};
      this.current_row =-1;
      this.listener = {};
      this.connections = {};
      this.currentClick = {};
      this.mouse = false;
      this.r_actor = new RelationshipActor();
      this.database = 'database/data_diff.db';
      this.initView();
      this.init({db_path:this.database});
      this.r_actor.on("remove-connection",(x_event)=>{
        console.log("remove-connection",x_event);
        this.removeConnection(x_event);
      });
      this.r_actor.on("create-connection",(x_event)=>{
        console.log("create-connection",x_event);
        this.createConnection(x_event);
      });
      this.r_actor.on("normal-click",(event)=>{
       // console.log("create-connection",event);
        let table = event.table.name;
        this.runQuery({query:`SELECT * FROM ${table} LIMIT 3;`},(res)=>{
          // console.log(res);
        });
      });
      this.r_actor.on("relationship-built",(event)=>{
        console.log("relationship-built",event);
        let relationship = event.relationship;
        if(relationship ==='one to many'){
            let to = event.to;
            let from = event.from;
            let from_column_id = from.table.addColumn({
              info:{
                  name:from.column.name,
                  fk:from.column.fk
              },
              reference_table_id: to.table.id
            });
            let to_column_id = to.table.addColumn({
                info:{
                    name:to.column.name,
                    pk:to.column.pk
                }  
              });
            if(from_column_id && to_column_id){
                from.table.addFKrelationship({
                    reference_table:to.table,
                    to_variable:to.column.name,
                    from_variable:from.column.name
                });
            }else{
                alert("could not create columns");
            }
        }
      });
      this.allowCSSDynamique();
      this.addCss(` .stop-left {
       stop-color: lightgrey;  /* Indigo */
      }
   
     .stop-right {
         stop-color: grey;  /* Teal */
     }

     .svgText1{
         font-size:18px;
         stroke:white;
         letter-spacing:2px;
     }
       .wheel_stop-left {
           stop-color: black;  /* Indigo */
         }
           .wheel_stop-middle {
                   stop-color: white;  /* Teal */
           }
         .wheel_stop-right {
             stop-color: black;  /* Teal */
         }`);
    }
    allowCSSDynamique(){
        this.style = document.createElement('style');
        this.style.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(this.style);
    }
    addCss(css_str){
        this.style.innerHTML = `${this.style.innerHTML} ${css_str}`; 
    }
    svgAnimateText(svg,args){
        let class_x=`text_text`;
        $(`.${class_x}`).remove();
        if(this.text_anime_timeout){
            clearTimeout(this.text_anime_timeout);
        }
        let draw = (text,callBack)=>{
            this.svgText(svg,{x:args.x,y:args.y,text:text,fill:args.fill,class:class_x,strokeWidth:'1px'});
            callBack(text);
        };
        let draw2 = (elt,idx,str0)=>{
          if(elt.charAt(idx)){
            draw(str0+elt.charAt(idx),(txt)=>{
                this.text_anime_timeout = setTimeout(()=>{
                    draw2(elt,(idx+1),txt);
                },args.speed);
            });
          }else{
              console.log("done");
              if(args.callBack){
                args.callBack();
              }
          }
        };
        draw2(args.text,(0),``);
    }
    svgText(svg,args){
        let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'text'); //Create a path in SVG's namespace
        newElement.setAttribute("x",args.x); 
        newElement.setAttribute("y",args.y); 
        newElement.setAttribute("class",args.class); 
        newElement.setAttribute("fill",args.fill); 
        newElement.style.stroke = args.stroke;
        newElement.style.strokeWidth = args.strokeWidth; 
        var textNode = document.createTextNode(args.text);
        newElement.appendChild(textNode);

        svg.appendChild(newElement);
    }
    svgCoollCircle(svg,args){
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
              stroke:args.stroke
          });
          return d;    
    }
    svgPath(svg,args){
        console.log(args);
        let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
        newElement.setAttribute("d",args.d); 
        newElement.setAttribute("class",args.class); 
        newElement.setAttribute("fill",args.fill); 
        newElement.style.stroke = args.stroke; 
        newElement.style.strokeWidth = args.strokeWidth; 
        svg.appendChild(newElement);
    }
    initView(){
      this.svg = $(`<svg style='position:absolute; top:0px; left:0px; width:100%; height:100%; background-color:black;z-index:-1;'></svg>`);
      this.main = $(`<div style='position:relative; width:${this.c_width}px; height:${ this.c_height}px; display:flex; flex-direction:row; background-color:transparent;'></div>`);
      this.main.append(this.svg);
      this.side = $(`<div style='width:300px; height:100%;background-color:transparent; '>Menu</div>`);
      this.body = $(`<div style='width:${this.c_width}px; height:${this.c_height}px;background-color:transparent;overflow:scroll;'></div>`);
      this.view_port = $(`<div style='width:100%; height:100%;position:relative;background-color:transparent;overflow:auto;'></div>`);
      this.body.append(this.view_port);
      this.main.append(this.side,this.body);
      this.host.append(this.main);
      let color =`rgb(66, 245, 242)`;
      this.cool_circle1 = new SvgCoolCircle({svg:this.svg[0],x:150, y:500, r:100, start:0, end:90,fill:'none',stroke:color,strokeWidth:'30px',speed:700});
      this.cool_circle2 = new SvgCoolCircle({svg:this.svg[0],x:150, y:500, r:100, start:120, end:180,fill:'none',stroke:color,strokeWidth:'30px',speed:1000});
      this.cool_circle3 = new SvgCoolCircle({svg:this.svg[0],x:150, y:500, r:100, start:200, end:230,fill:'none',stroke:color,strokeWidth:'30px',speed:1000});
      this.cool_circle4 = new SvgCoolCircle({svg:this.svg[0],x:150, y:500, r:100, start:260, end:290,fill:'none',stroke:color,strokeWidth:'30px',speed:1000});
      this.cool_circle5 = new SvgCoolCircle({svg:this.svg[0],x:150, y:500, r:100, start:320, end:350,fill:'none',stroke:color,strokeWidth:'30px',speed:1000});
      this.curious_bot = new Bot({svg:this.svg,body:false,width:"100%", height:"100%",hands_color:'steelblue'});
      this.curious_bot.move({
        x:100,
        y:800,
        speed:1,
        callBack:()=>{
          this.curious_bot.duty();
          setTimeout(()=>{
            this.curious_bot.relax();
            //this.curious_bot.sized(0.4);
          },3000);
       },
      });
      $(window).on("resize",()=>{
        this.resized();
        this.updateConnections();
      });
      $(this.view_port).on('scroll',()=>{
        this.updateConnections();
      });
      $("body").mousemove((e)=>{
          this.mouse={
              x:e.clientY,
              y:e.clientX
          };
         this.updateConnections();
      });
      $("body").click((e)=>{
        this.svgAnimateText(this.svg[0],{
            x:e.clientX,
            y:e.clientY,
            text:'hello this is ads bot, i will be assisting you!',
            fill:'steelblue',
            class:'svgText1',
            speed:0,
            callBack:()=>{
                console.log("done");
            }
          });
        this.curious_bot.move({
            x:e.clientX,
            y:e.clientY,
            speed:1,
            callBack:()=>{
                console.log("donrdfdfg");
    
           },
          });
       this.updateConnections();
    });
    }
    getStruct(){
        return {
          name: "comment_id",
          type: "TEXT",
          notnull: 0,
          dflt_value: null,
          pk: 0
        }
    }
    svgCircleAt(args){
        let svg = this.svg[0]; //Get svg element
        let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
        newElement.setAttribute("cx",args.cx); 
        newElement.setAttribute("cy",args.cy); 
        newElement.setAttribute("r",args.r); 
        newElement.setAttribute("class",args.class); 
        newElement.setAttribute("fill",args.fill); 
        newElement.style.stroke = "steelblue"; 
        newElement.style.strokeWidth = args.strokeWidth; 
        svg.appendChild(newElement);
    }
    addMenu(what,doThat){
        this.menu_elts[what] = $(`<div style='width:100%; background-color:rgb(8,10,10);text-align:center; color:white;font-size:0.7em;cursor:pointer;'>${what}</div>`);
        this.side.append(this.menu_elts[what]);
        this.menu_elts[what].click((e)=>{
           e.stopPropagation();
           doThat();
        });
    }
    order(){
        this.current_row =-1;
        let keys = Object.keys(this.tables);
        for(let i =0; i< keys.length; i++){
            ((i)=>{
                let pos = this.calculateNextPos(i);
                this.tables[keys[i]].reLocate({
                    top:pos.top,
                    left:pos.left
                });
            })(i);
        }
    }

    resized(){
        this.c_width = window.innerWidth;
        this.c_height = window.innerHeight;
        this.main.css({width:`${this.c_width}px`,height:`${this.c_height}px`});
        this.body.css({ width:`${this.c_width}px`,height:`${this.c_height}px`});
        //this.order();

    }

    calculateNextPos(idx){
        let per_row = Math.floor(this.body[0].clientWidth/305);
        let is_nex_row = idx%per_row===0?true:false;
        if(is_nex_row){
           this.current_row ++;
        }
        let left =((idx%per_row)*305); 
        let top = this.current_row*300;
        return {left:left+"px", top:top+"px"};
    }
    addAllTable(args){
      if(!args.arr[args.idx]){
        return args.callBack(false,true);
      }else{
        this.addNewTable({
            name: args.arr[args.idx].tbl_name,
            db:args.db_path
        },(ready)=>{
          if(ready.ok){
            this.addAllTable({
                arr:args.arr,
                idx:(args.idx+1),
                callBack:args.callBack,
                db_path:args.db_path
            });
          }else{
            return args.callBack(ready.err, false);
          }
        });
      }
    }
    init(args){
        if(args.db_path){
            this.runQuery({query:this.query1},(res)=>{
                if(res && res.ok){
                    this.addAllTable({
                        arr:res.ok,
                        idx:0,
                        db_path:args.db_path,
                        callBack:(err,success)=>{
                            console.log("ready",err,success);
                             if(err){
                                return alert("could not add all tables");
                             }else{
                                //add fk constrains
                                for(let elt in this.tables){
                                    this.tables[elt].addFkeys();
                                }
                             }
                        }
                    });
                }else{
                    return alert("could not get tables");
                }
                this.addMenu("New table",()=>{
                    this.addNewTable({new:true,db:args.db_path});
                });
            });
        }else{
            this.addMenu("New table",()=>{
                this.addNewTable({new:true});
            });
        }
        this.addMenu("Order",()=>{
            this.order();
        });
        this.addMenu("one to many",()=>{
            this.r_actor.set('one to many');
        });
        this.addMenu("Tables",()=>{
            console.log("tables",this.tables);
        });
    }
    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return new Date().getTime()+"I"+text;
       }
    highlightConnection(args){
        let connection_id =  args.id;
        if(args.on){
            if(this.connections[connection_id]){
                this.connections[connection_id].stroke = 'yellow';
                this.connections[connection_id].strokeWidth = false;//'5px';
            }
            if(this.connections[connection_id].targetA_id){
                this.tables[this.connections[connection_id].targetA_id].highlightColumn({
                    id:this.connections[connection_id].colA,
                });
            }
            if(this.connections[connection_id].targetB_id){
                this.tables[this.connections[connection_id].targetB_id].highlightColumn({
                    id:this.connections[connection_id].colB,
                });
            }
        }else{
            if(this.connections[connection_id]){
                this.connections[connection_id].stroke = false;
                this.connections[connection_id].strokeWidth = false;
             }
             if(this.connections[connection_id].targetA_id){
                this.tables[this.connections[connection_id].targetA_id].removeHighlight({
                    id:this.connections[connection_id].colA,
                });
            }
            if(this.connections[connection_id].targetB_id){
                this.tables[this.connections[connection_id].targetB_id].removeHighlight({
                    id:this.connections[connection_id].colB,
                });
            }
        }
    }
    removeConnection(args){
        if(args.name){
            for(let elt in this.connections){
                ((elt)=>{
                    if(this.connections[elt].name === args.name){
                        if(this.connections[elt].targetA_id){
                            this.tables[this.connections[elt].targetA_id].removeFKey({
                                col_id:this.connections[elt].colA,
                                fk_id:elt
                            });
                        }
                        if(this.connections[elt].targetB_id){
                            this.tables[this.connections[elt].targetB_id].removeFKey({
                                col_id:this.connections[elt].colB,
                                fk_id:elt
                            });
                        }
                       delete this.connections[elt];
                      return this.updateConnections();
                    }
                })(elt);
             }
        }else if(args.id){
                        if(this.connections[args.id].targetA_id){
                            this.tables[this.connections[args.id].targetA_id].removeFKey({
                                col_id:this.connections[args.id].colA,
                                fk_id:args.id
                            });
                        }
                        if(this.connections[args.id].targetB_id){
                            this.tables[this.connections[args.id].targetB_id].removeFKey({
                                col_id:this.connections[args.id].colB,
                                fk_id:args.id
                            });
                        }
             delete this.connections[args.id];
             return this.updateConnections();
        }
    }
    createConnection(args){
        let uid = args.c_uid;
        if(!uid){
          return alert("could not build connection uid missing");
        }
        this.connections[uid] = {
            targetA_id:args.tableA?args.tableA.id:false,
            targetB_id:args.tableB?args.tableB.id:false,
            name:args.connection_name,
            colA:args.colA,
            colB:args.colB,
            is_mouse:args.is_mouse,
            delete:()=>{
                console.log("connection deleted",{tableA:args.tableA,tableB:args.tableB,colA:args.colA, colB:args.colB});
                delete this.connections[uid];
            }
        }
        this.updateConnections();
    }
    updateConnections(){
        $(".lines_connections").remove();
        let svg = this.svg[0];
        for(let elt in this.connections){
           ((elt)=>{
            let offset =  false;
            let offset2 = false;
            let class_x = false;
            var middleWA = false;
            var middleHA = false;
            var middleWB = false;
            var middleHB = false;
            if(this.connections[elt].is_mouse){
                let tableA = this.tables[this.connections[elt].targetA_id];
                offset =  tableA.main.offset();
                offset2 = {top:this.mouse.x,left:this.mouse.y};
                class_x = `lines_connections`;
            }else{
                let tableA = this.tables[this.connections[elt].targetA_id];
                let tableB = this.tables[this.connections[elt].targetB_id];
                // offset =  tableA.cols[this.connections[elt].colA].tr.offset();
                // offset2 = tableB.cols[this.connections[elt].colB].tr.offset();

                offset =  tableA.main.offset();
                offset2 = tableB.main.offset();
        
                middleWA = tableA.main.width()/2;
                middleHA = tableA.main.height()/2;
                middleWB = tableB.main.width()/2;
                middleHB = tableB.main.height()/2;
                class_x = `lines_connections`;
            }
            let what = this.generateCoolPath({x:offset.left+(middleWA?middleWA:0),y:offset.top-7},{x:offset2.left+(middleWB?middleWB:0),y:offset2.top-7}); //(middleHB?middleHB:0)
            let newElement = false;
            if(what.type ==="path"){
                newElement = document.createElementNS("http://www.w3.org/2000/svg", 'path');
                newElement.setAttribute("d",what.d);  
                newElement.setAttribute("fill","none"); 
            }else{
                newElement = document.createElementNS("http://www.w3.org/2000/svg", 'line'); 
                newElement.setAttribute("x1",what.pointA.x); 
                newElement.setAttribute("y1",what.pointA.y); 
                newElement.setAttribute("x2",what.pointB.x); 
                newElement.setAttribute("y2",what.pointB.y); 
            }
            newElement.setAttribute("class",class_x); 
            newElement.setAttribute("id",elt); 
            let stroke = this.connections[elt].stroke?this.connections[elt].stroke:"steelblue"; 
            let strokeWidth = this.connections[elt].strokeWidth?this.connections[elt].strokeWidth:"1px"; 
            newElement.style.stroke = stroke;
            newElement.style.strokeWidth = strokeWidth; 
            svg.appendChild(newElement);
            this.connections[elt]['elt'] = newElement;
            this.svgCircleAt({cx:what.pointA.x,cy:what.pointA.y,r:7,class:class_x,fill:stroke,strokeWidth:"1px"});
            this.svgCircleAt({cx:what.pointB.x,cy:what.pointB.y,r:7,class:class_x,fill:stroke,strokeWidth:"1px"});
           })(elt);
        }
    }
    tableDidMove(id){
        this.updateConnections();
    }
    generateCoolPath(pointA,pointB){
        let x1 = pointA.x, y1 = pointA.y;
        let x2 = pointB.x, y2 = pointB.y;
        let str = `M${x1} ${y1} `;
        if(x1<x2){  //down
            str+=`L${x2} ${y1} `;
            str+=`L${x2} ${y2} `;
            return {
                type:"path",
                d:str,
                pointA:pointA,
                pointB:pointB
            }
        }else if(x1>x2){
            str+=`L${x2} ${y1} `;
            str+=`L${x2} ${y2} `;
            return {
                type:"path",
                d:str,
                pointA:pointA,
                pointB:pointB
            }
        }else{
            return {
                type:"line",
                pointA:pointA,
                pointB:pointB
            }
        }

    }
    svgLine(x1,y1,x2,y2){
        $(".svg-line").remove();
        let svg = this.svg[0]; //Get svg element
        let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'line'); //Create a path in SVG's namespace
        newElement.setAttribute("x1",x1); 
        newElement.setAttribute("y1",y1); 
        newElement.setAttribute("x2",x2); 
        newElement.setAttribute("y2",y2); 
        newElement.setAttribute("class",'svg-line'); 

        newElement.style.stroke = "dodgerblue"; 
        newElement.style.strokeWidth = "1px"; 
        svg.appendChild(newElement);
    }
    getTable(name){
        for(let elt in this.tables){
            if(this.tables[elt].name === name ){
               return this.tables[elt];
            }
        }
        return false;
      }
      deleteTable(id){
        return delete this.tables[id];
      }
    addNewTable(args,callBack){
        let idx = Object.keys(this.tables).length;
        let name = args.name;
        let u_id = this.makeid();
        if(args.new){
            name = `Table_${u_id}`;
        }
        let pos = this.calculateNextPos(idx);
        this.tables[u_id] = new Table({
           width:300,
           height:150,
           id:u_id,
           is_new:args.new,
           db:args.db,
           host:this.view_port,
           name:name,
           top:pos.top,
           left:pos.left
        });
        this.tables[u_id].on("highlight-connnection",(options)=>{
            let connection_id = options.connection_id;
            this.highlightConnection({id:connection_id,on:true});
        });
        this.tables[u_id].on("highlight-connnection-r",(options)=>{
            let connection_id = options.connection_id;
            this.highlightConnection({id:connection_id,on:false});
        });
        this.tables[u_id].on("get-table",(options)=>{
            let table = this.getTable(options.table_name);
            options.delegate({table:table});
        });
        this.tables[u_id].on("move",(options)=>{
            this.tableDidMove(options.id);
        });
        this.tables[u_id].on("click-table",(table)=>{
            this.r_actor.addTarget(table);
        });
        this.tables[u_id].on("connect-table",(options)=>{
            this.createConnection(options);
        });
        this.tables[u_id].on("remove-connection",(x_event)=>{
            this.removeConnection(x_event);
        });
        this.tables[u_id].on("deleting-self",(options)=>{
            let id = options.id;
            if(id){
                 for(let elt in this.connections){
                     if(this.connections[elt].targetA_id ===id || this.connections[elt].targetB_id ===id){
                        this.removeConnection({id:elt});
                     }
                 }
                this.deleteTable(id);
                //this.order();
                if(options.callBack){
                    options.callBack({ok:true});
                }
            }else{
                if(options.callBack){
                    options.callBack({ok:false,err:'table name missing'});
                }
            }
        });
        this.tables[u_id].on("change-self-name",(options)=>{
            let name_x = options.name;
            if(name_x){
                let table = this.getTable(name_x);
                if(table){
                    if(options.callBack){
                        options.callBack({ok:false,err:'table exist already'});
                    }
                }else{
                    if(options.callBack){
                        options.callBack({ok:true});
                    }
                }
            }else{
                if(options.callBack){
                    options.callBack({ok:false,err:'table name missing'});
                }
            }
            console.log(this.tables,"all TAbles");
        });
        this.tables[u_id].init((ready)=>{
            if(callBack){
                callBack(ready);
            }
        });
  }
  runQuery(args,callBack){
    $.ajax({
        type: "POST",
        url:"run-query",
        data:{
            path:this.database,
            query:args.query
        }
        }).done(function(res) {
          return callBack(res);
      }).fail(function(err) {
          return callBack({err:err});
      });
  }
}
