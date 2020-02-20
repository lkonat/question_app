class Table {
    constructor(args){
     this.id= args.id;
     this.is_new = args.is_new;
     this.db = args.db;
     this.host = args.host;
     this.name = args.name;
     this.height = args.height;
     this.width = args.width;
     this.fon_size = `8px`;
     this.cols = {};
     this.top = args.top?args.top:'0px';
     this.left= args.left?args.left:'0px';
    }
    getTable(name,callBack){
        this.triggerEvent("get-table",{table_name:name,delegate:(gotTable)=>{
           return callBack(gotTable);
        }});
    }
    on(what, that){
        if(!this.c_events){
            this.c_events ={};
        }
        this.c_events[what] = that;
    }
    triggerEvent(name,args){
        if(this.c_events && this.c_events[name]){
          this.c_events[name](args);
        }
    }
    highlightColumn(args){
        let column = this.cols[args.id];
        if(column){
            if(!$(column.tr).is(":hover")){
                this.body.animate({
                    scrollTop:column.tr[0].offsetTop-(this.body[0].offsetTop)
                },100);
            }
            column.tr.addClass("fk_highlight");
            //this.title.addClass("fk_table_highlight");
        }
    }
    hasPk(){

    }
    removeHighlight(args){
        let column = this.cols[args.id];
        if(column){
          column.tr.removeClass("fk_highlight");
          //this.title.removeClass("fk_table_highlight");
        }
      }
      reLocate(args){
        this.main.animate({
            top:args.top,
            left:args.left
        },300,()=>{
            this.triggerEvent("move",{id:this.id});
        });
        // this.main.css({
        //     top:args.top,
        //     left:args.left
        // });
      }
    allowAddingNewColumn(){
      let tr = $(`<tr style='font-size:${this.fon_size};'></tr>`);
      this.table.append(tr);
      let newX = $(`<th colspan='3' style='position:sticky; top:20px; z-index:2;background-color:inherit;text-align:center;cursor:pointer;'>Add</th>`);
      let saveX = $(`<th colspan='3' style='position:sticky; top:20px; z-index:2;background-color:inherit;text-align:center;cursor:pointer;'>Save</th>`);
      tr.append(newX,saveX);
      newX.click((e)=>{
          e.stopPropagation();
          this.addColumn();
      });
      saveX.click((e)=>{
        e.stopPropagation();
        console.log("save",this.cols);
        this.generateStatment();
    });
    }
    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 3; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return new Date().getTime()+"I"+text;
       }

    removeFKey(args){
        if(args.col_id){
            this.removeHighlight({id:args.col_id});
        }
        if(args.col_id && args.fk_id){
            delete this.cols[args.col_id].fk_connetions[args.fk_id];
            if(Object.keys(this.cols[args.col_id].fk_connetions).length<=0 && $(this.cols[args.col_id].pk_td_check).prop("checked")!==true ){
                this.cols[args.col_id].tr.remove();
                delete  this.cols[args.col_id];
            }
        }
    }

    addColumn(args){
        let info = args && args.info?args.info:false;
        let u_id = this.makeid();
        let name = info&& info.name?info.name:`col-${this.makeid()}`;
        this.cols[u_id] = {name:name,id:u_id,reference_table_id:args && args.reference_table_id?args.reference_table_id:true};
        this.cols[u_id].tr = $(`<tr class='table_columns' style='font-size:${this.fon_size};'></tr>`);
        this.cols[u_id].name_td = $(`<td style='font-size:inherit;background-color:inherit; color:inherit;'></td>`);
        this.cols[u_id].name_td_input =$(`<input type="text"  name="name" value='${name}' style='color:inherit;border:none;border-bottom:none;background-color:inherit;outline:none;'></input>`);
        this.cols[u_id].name_td.append(this.cols[u_id].name_td_input);
        this.cols[u_id].type_td = $(`<td style='font-size:inherit;background-color:inherit; color:inherit;'></td>`);
        this.cols[u_id].type_td_options = $(`<select title='type' style='font-size:inherit;border:none; background-color:inherit;color:inherit;'><option value="TEXT">TEXT</option> <option value="integer">INT</option></select>`);
        this.cols[u_id].type_td.append(this.cols[u_id].type_td_options);
        this.cols[u_id].pk_td = $(`<td style='font-size:inherit;background-color:inherit; color:inherit;'></td>`);
        this.cols[u_id].pk_td_check = $(`<input type="checkbox" id="pk" name="pk" ${info && info.pk?'checked':''}>`);
        this.cols[u_id].pk_td.append(this.cols[u_id].pk_td_check);
        this.cols[u_id].nonNull_td = $(`<td style='font-size:inherit;background-color:inherit; color:inherit;'></td>`);
        this.cols[u_id].no_null_check = $(`<input type="checkbox" id="nnull" name="nnull" ${info && info.notnull?'checked':''}>`);
        this.cols[u_id].nonNull_td.append(this.cols[u_id].no_null_check);
        this.cols[u_id].fk_td = $(`<td style='font-size:inherit;background-color:inherit; color:inherit;'></td>`);
        this.cols[u_id].fk_td_check = $(`<input type="checkbox" id="fk" name="fk">`);
        this.cols[u_id].del = $(`<td style='font-size:inherit;background-color:inherit; color:inherit;'>d</td>`);
        this.cols[u_id].fk_td.append(this.cols[u_id].fk_td_check);
        this.cols[u_id].tr.append(this.cols[u_id].name_td,this.cols[u_id].type_td,this.cols[u_id].pk_td,this.cols[u_id].fk_td,this.cols[u_id].nonNull_td,this.cols[u_id].del);
        this.table.append(this.cols[u_id].tr);
        this.cols[u_id].name_td_input.val(name);
        this.cols[u_id].type_td_options.val(info && info.type? info.type:'TEXT');
        this.cols[u_id].didChangeName=(new_name)=>{
            this.cols[u_id].name_td_input.val(new_name);
        };
        this.cols[u_id].del.click((e)=>{
            e.stopPropagation();
            let fks_c = this.cols[u_id].fk_connetions;
            for(let elt in fks_c){
                this.triggerEvent("remove-connection",{id:elt}); //if any
                //delete this.cols[u_id].fk_connetions[elt];
            }
            if(this.cols[u_id]){
               this.cols[u_id].tr.remove();
               delete  this.cols[u_id];
            }
        });
        this.cols[u_id].tr.hover(()=>{
            //console.log(this.cols[u_id],"rrrrr");
          if(this.cols[u_id].fk_connetions){
            for(let id in this.cols[u_id].fk_connetions){
                this.triggerEvent("highlight-connnection",{connection_id:id});
              }
          }
        },()=>{
            if(this.cols[u_id].fk_connetions){
                for(let id in this.cols[u_id].fk_connetions){
                    this.triggerEvent("highlight-connnection-r",{connection_id:id});
                  }
              }
        });
        this.cols[u_id].name_td_input.on("input",()=>{
            let value = this.cols[u_id].name_td_input.val();
            if(value === this.cols[u_id].name){
                this.cols[u_id].name_td_input.css({'border-bottom':"none"});
            }else{
                this.cols[u_id].name_td_input.css({'border-bottom':"1px solid red"});
            }
        });
        this.cols[u_id].name_td_input.change(()=>{
            let value = this.cols[u_id].name_td_input.val();
            this.cols[u_id].name_td_input.css({'border-bottom':"none"});
            if(this.getColumn(value)){
              return alert("column exist");
            }else{
              this.cols[u_id].name = value;
              this.cols[u_id].didChangeName(this.cols[u_id].name);
            }
        });
        return u_id;
    }
   
    getColumn(name){
      for(let elt in this.cols){
          if(this.cols[elt].name === name ){
             return this.cols[elt];
          }
      }
      return false;
    }
    generateStatment(){
       let str= `CREATE TABLE IF NOT EXISTS ${this.name}(`;
        let keys = Object.keys(this.cols);
        for(let i=0; i< keys.length; i++){
            let col = this.cols[keys[i]];
            str +=`${col.name} ${col.type_td_options.val()} ${$(col.pk_td_check).prop("checked")==true?'PRIMARY KEY':''} ${col.no_null_check.prop("checked")==true?`NOT NULL`:``}${i>=keys.length-1?``:`,`}`;
        }
        str+=");";
        console.log(str);
    }

    init(callBack){
        this.main = $(`<div class='sqlite_table' style='width:${this.width}px; height:${this.height}px; position:absolute; top:${this.top}; left:${this.left};background-color:rgba(8,10,10,0.5)'></div>`);
        this.del_div = $(`<div style='text-align:right;padding-right:1px;'></div>`);
        this.del = $(`<span style='color:rgb(235, 52, 52);'><i class="fa fa-circle" aria-hidden="true" style='color:inherit; cursor:pointer;'></i></span>`);
        this.del_div.append(this.del);
        this.title = $(`<div></div>`);
        this.title_input = $(`<input type="text"  name="name" value='${this.name}' style='width:100%;color:grey;border:none;background-color:inherit;outline:none;text-align:center;'></input>`);
        this.title.append(this.title_input);
        this.body = $(`<div style='width:100%; height:${this.height}px; overflow:scroll; margin:0 auto;background-color:inherit; color:grey;padding-left:3px;padding-right:3px;'></div>`);
        this.table = $(`<table style='width:100%;position:relative;background-color:inherit; color:inherit;'><tr style='background-color:black;font-size:0.7em; '> <th style='position:sticky; top:0px; z-index:2;background-color:inherit;font-size:inherit;'>Name</th> <th style='font-size:inherit;background-color:inherit;position:sticky; top:0px;z-index:2;'>Type</th> <th style='font-size:inherit;background-color:inherit;position:sticky; top:0px;z-index:2;'>PK</th> <th style='font-size:inherit;background-color:inherit;position:sticky; top:0px;z-index:2;'>FK</th><th style='font-size:inherit;background-color:inherit;position:sticky; top:0px;z-index:2;'>NotNull</th> <th style='font-size:inherit;background-color:inherit;position:sticky; top:0px;z-index:2;'> </th> </tr></table>`);
        this.body.append(this.table);
        this.footer = $(`<div style='width:100%; height:30px;background-color:inherit;'>.</div>`);
        this.main.append(this.del_div,this.title,this.body,this.footer);
        this.host.append(this.main);
        this.makeItDraggleWIthClassName(this.main);
        this.main.click((e)=>{
           e.stopPropagation();
           this.triggerEvent("click-table",this);
        });
        this.del.click((e)=>{
           e.stopPropagation();
           this.triggerEvent("deleting-self",{id:this.id,callBack:(outcome)=>{
            if(outcome.ok){
                this.main.remove();
            }else{
                alert(`Table ${JSON.stringify(outcome)}`);
            }
        }});
        });
        this.title_input.change(()=>{
            let value = this.title_input.val();
            this.triggerEvent("change-self-name",{name:value,callBack:(outcome)=>{
                if(outcome.ok){
                    this.name = value;
                    this.title_input.css({'border-bottom':"none"});
                }else{
                    this.title_input.css({'border-bottom':"1px solid red"});
                    alert(`Tbale ${JSON.stringify(outcome)}`);
                }
            }});
        });
        this.title_input.on("input",()=>{
          let value = this.title_input.val();
          if(value ===this.name){
            this.title_input.css({'border-bottom':"none"});
          }else{
            this.title_input.css({'border-bottom':"1px solid red"});
          }
        });
        if(this.is_new){
            this.allowAddingNewColumn();
            return callBack({ok:true});
        }else if(!this.db){
            this.allowAddingNewColumn();
            return callBack({ok:true});
        }else if(this.db){
            this.runQuery({query:`pragma table_info('${this.name}');`},(info)=>{
                if(info.ok){
                   for(let i =0; i<info.ok.length; i++){
                     this.addColumn({info:info.ok[i]});
                   }
                   return callBack({ok:true});
                }else{
                    return callBack({ok:false,err:`cannot fetch tables`});
                }
            });
        }else{
            return callBack({ok:false,err:`could not init`}); 
        }
    }
    addFkeys(){
        this.runQuery({query:`pragma foreign_key_list('${this.name}');`},(info)=>{
            if(info.ok){
               for(let i =0; i<info.ok.length; i++){
                   ((i)=>{
                    this.getTable(info.ok[i].table,(res)=>{
                        if(res.table){
                            this.addFKrelationship({
                                reference_table:res.table ,
                                to_variable:info.ok[i].to,
                                from_variable:info.ok[i].from
                            });
                        }
                      });
                   })(i);
               }
            }
         
        });
    }
    addFKrelationship(args){
        if(args.reference_table){
            let c_uid = this.makeid();
            let target_table = args.reference_table;
            let to_column = target_table.getColumn(args.to_variable);
            let from_column = this.getColumn(args.from_variable);
            from_column.fk_td_check.prop("checked",true);
            from_column.reference_table_id = target_table.id;

            if(!from_column["fk_connetions"]){
                from_column["fk_connetions"] ={};
            }
            from_column["fk_connetions"][c_uid] = true;

            if(!to_column["fk_connetions"]){
                to_column["fk_connetions"] ={};
            }
            to_column["fk_connetions"][c_uid] = true;

            from_column.tr.hover(()=>{
                target_table.highlightColumn({
                    id:to_column.id
                });
            },()=>{
                target_table.removeHighlight({
                    id:to_column.id
                });
            });
            this.triggerEvent("connect-table",{
                tableA:this,
                colA:from_column.id,
                tableB:target_table,
                colB:to_column.id,
                c_uid:c_uid,
                connection_name:'pk'
            });
        }
    }
    runQuery(args,callBack){
        if(this.db){
            $.ajax({
                type: "POST",
                url:"run-query",
                data:{
                    path:this.db,
                    query:args.query
                }}).done(function(res) {
                  return callBack(res);
              }).fail(function(err) {
                  return callBack({err:err});
              });
        }else{
            return callBack({err:'no db yet'});
        }
    }
    makeItDraggleWIthClassName(elt){
        if(elt){
          elt.addClass("oModal");
        //   elt[0].addEventListener('touchmove', function(e){
        //     if(e.target.className ===className || $(e.target).hasClass(className)){
        //       elt.draggable( "option", "disabled",false);
        //     }else {
        //       elt.draggable( "option", "disabled",true);
        //     }
        //   }, false);
        //   elt.on("mousedown",function(e){
        //       if(e.target.className ===className || $(e.target).hasClass(className)){
        //         elt.draggable( "option", "disabled",false);
        //       }else {
        //         elt.draggable( "option", "disabled",true);
        //       }
        //   });
          elt.draggable({
            stack: ".oModal",
            drag: ( event, ui )=>{
                this.triggerEvent("move",{id:this.id});
            //   if((ui.position.left + 100) >=$('body').width()){
            //     ui.position.left = $('body').width() -100;
            //   }
            //   if(ui.position.left<0){
            //     ui.position.left =0;
            //   }
            //   if(ui.position.top<0){
            //     ui.position.top =0;
            //   }
            //   if((ui.position.top + 100) >=$('body').height()){
            //     ui.position.top = $('body').height() -100;
            //   }
              $(ui.helper[0]).css({border:"2px solid dodgerblue"});
            }
            ,
             stop: ( event, ui )=> {
                this.triggerEvent("move",{id:this.id});
               $(ui.helper[0]).css({border:"none"});
             }
          });
        }
      }
}