class DirBrowser{
    constructor(args){
     this.host = $("body");
     this.width = "700px";
     this.height = "300px";
     this.top = "100px";
     this.left = "30px";
     this.starting_path = `/Users/lassanakonate/Desktop/questions_app`;
     this.current_items = {};
     this.current_path = false;
     this.current_fronts = [];
     this.initView();
     this.navigateToPath({path:this.starting_path},(path)=>{
            if(path){
                this.current_path = path;
            }
         
     });
    }
    showBookMarks(args){
        args.where.empty();
        $.ajax({ //// 
            type: "POST",
            url:"get-bookmarks",
            contentType: 'application/json; charset=UTF-8'
        }).done((res)=>{
            if(res && res.ok){
                for(let i =0; i< res.ok.length; i++){
                    console.log("bookmarks",res.ok[i]);
                    let div = $(`<div style='width:100%; padding:3px;margin-top:10px; background-color:rgb(5,7,7);'></div>`);
                    let name = $(`<div title='${res.ok[i].name}' style='width:80%; overflow:hidden; text-overflow:ellipsis; white-space: nowrap; display:inline-block;cursor:pointer;'>${res.ok[i].name}</div>`);
                    let save = $(`<span style='color:steelblue; display:none;'> Save </span>`);
                    let cancel = $(`<span style='color:red; display:none;'> Cancel </span>`);
                    div.append(save,cancel);
                    let edit = $(`<span style='cursor:pointer;color:grey;display:none;'> <i class="fa fa-pencil" style="color:inherit"></i></span>`);
                    let rm = $(`<span style='cursor:pointer;color:red;display:none;'> x</span>`);
                    // if(res.ok[i].type ==='file'){
                    //     div.append(name,rm);
                    // }else{
                    //     div.append(name,edit,rm);
                    // } 
                    div.append(name,edit,rm);
                    args.where.append(div);
                    div.hover(()=>{
                        edit.show();
                        rm.show();
                    },()=>{
                        edit.hide();
                        rm.hide();
                    });
                    edit.click((e)=>{
                        e.stopPropagation();
                        name.attr("contenteditable",true);
                        name.focus();
                        save.show();
                        cancel.show();
    
                    });
                    cancel.click((e)=>{
                        e.stopPropagation();
                        this.showBookMarks({where:this.left_content});
                    });
                    save.click((e)=>{
                        e.stopPropagation();
                        let text = name.text();
                        if(text.trim().length>0){
                          $.ajax({ //// 
                                type: "POST",
                                url:"rename-bookmarks",
                                contentType: 'application/json; charset=UTF-8',
                                data:JSON.stringify({
                                    name:text,
                                    path:res.ok[i].path
                                })
                            }).done((res)=>{
                               if(res.ok){
                                   this.showBookMarks({where:this.left_content});
                               }else{
                                   name.text(res.ok[i].name);
                                   alert(JSON.stringify(res));
                               }
                            }).fail((err)=>{
                                name.text(res.ok[i].name);
                                alert(JSON.stringify(err));
                                console.log({err:err});
                            });
                        }else{
                            name.text(res.ok[i].name);
                            alert("Cannot update to empty");
                        }
                    });
                    rm.click((e)=>{
                        e.stopPropagation();
                        console.log("delete", res.ok[i]);
                        if(confirm(`Are you sure to remove ${res.ok[i].name} from bookmark?`)){
                            $.ajax({ //// 
                                type: "POST",
                                url:"remove-bookmarks",
                                contentType: 'application/json; charset=UTF-8',
                                data:JSON.stringify({
                                    path:res.ok[i].path
                                })
                            }).done((res)=>{
                               if(res.ok){
                                   this.showBookMarks({where:this.left_content});
                               }else{
                                   alert(JSON.stringify(res));
                               }
                            }).fail((err)=>{
                                alert(JSON.stringify(err));
                                console.log({err:err});
                            });
                        }
                    });
                    name.click((e)=>{
                        e.stopPropagation();
                        console.log("show", res.ok[i]);
                        if(res.ok[i].type ==="dir"){
                            this.navigateToPath({path:res.ok[i].path},(path)=>{
                                if(path){
                                    this.current_path = path;
                                }
                            });
                        }else if(res.ok[i].type ==="file"){
                             this.navigateToPath({path:res.ok[i].path.replace("/"+res.ok[i].name,"")},(path)=>{
                                if(path){
                                    this.current_path = path;
                                }
                            });
                        }
                    });
  
                }
            }
        }).fail((err)=>{
            console.log({err:err});
        });
    }
    setTitle(path){
        let temp = path.split("/");
        this.window_title.html(temp[temp.length-1]);
    }
    goFront(){
       if(this.current_fronts.length>0){
         let now_path = this.current_fronts.pop();
         this.navigateToPath({path:now_path},(path)=>{
           if(path){
                this.current_path = path;
            }
       });
       }
       if(this.current_fronts.length<=0){
          this.resetFront();
       }
       console.log("this.current_fronts",this.current_fronts);
    }
    goBack(){
       let temp = this.current_path.split("/");
       let new_path = false;
       for(let i =0; i< temp.length-1; i++){
           if(temp[i].trim().length>0){
           if(!new_path){
              new_path = `/${temp[i]}`;
           }else{
              new_path=`${new_path}/${temp[i]}`;
           }
           }
       }
       this.navigateToPath({path:new_path},(path)=>{
           if(path){
                this.current_fronts.push(this.current_path);
                this.front_btn.css({color:"grey"});
                this.current_path = path;
            }
       });
    }
    on(what,that){
        if(!this.cEvents){
            this.cEvents = {}; 
        }
        this.cEvents[what] = that;
    }
    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return new Date().getTime()+"I"+text;
    }
    fireEvent(what,args){
        if(this.cEvents && this.cEvents[what]){
            this.cEvents[what](args);
        }
    }
    resetFront(){
        this.current_fronts = []; //reset the current front
        this.front_btn.css({color:"black"});
    }
    addOneItem(args,callBack){
        let id = this.makeid();
        let item = new DirBrowserItem({host:this.right_content_table,data:args.data,id:id,size:args.data.size,full_path:args.full_path,name:args.data.name}); 
        item.appendSelf(false,()=>{
            return callBack();
        });
        item.on("dir",(info)=>{
             console.log("will navigate to path", info);
             //console.log();
            this.navigateToPath({path:info.path},(path)=>{
                if(path){
                    console.log("did navigate to path", path);
                    this.resetFront();
                    this.current_path = path;
                }
            });
        });
        item.on("bookmark-changed",()=>{
            this.showBookMarks({where:this.left_content});
        });
        item.on("file",()=>{
            
        });
        this.current_items[id] = item;
    }
    navigateToPath(args,callBack){
       this.getDirContent({path:args.path},(content)=>{
           //display content if anny;
           if(content && content.length>0){
             this.clearDirSpaceView();
             for(let i =0; i< content.length; i++){
                this.addOneItem({
                    data:content[i],
                    full_path:`${args.path}/${content[i].name}`,
                },()=>{});
             }
             this.setTitle(args.path);
             return callBack(args.path);
           }
       });
    }
    getDirContent(args,callBack){
        $.ajax({
            type: "POST",
            url:"browse",
            contentType: 'application/json; charset=UTF-8',
            data:JSON.stringify({
                path:args.path
            })
            }).done(function(res) {
              return callBack(res);
          }).fail(function(err) {
              return callBack({err:err});
          });
    }
    getTheme(target){
      if(target==="background-color"){
        return "rgb(18,20,20)";
      }else if(target==="color"){
         return "grey";
      }
    }
    clearDirSpaceView(){
       this.right_content_table.empty();
       this.right_content_table.append(`<tr style='color:grey; background-color:rgb(18,20,20);'><th style='color:inherit;position:sticky; top:0px;background-color:inherit;'></th><th style='color:inherit;position:sticky; top:0px;background-color:inherit;'>Name</th><th style='color:inherit;position:sticky; top:0px;background-color:inherit;'>Size</th><th style='color:inherit;position:sticky; top:0px;background-color:inherit;text-align:right;padding-right:10px;'>Date</th></tr>`);
    }
    clearLeftSpaceView(){
       this.left_content.empty();
    }
    initView(){
        this.view = $(`<div style=' position:fixed; top:${this.top}; left:${this.left};box-shadow: 0 0 5px grey;background-color:${this.getTheme("background-color")}; color:${this.getTheme("color")};display:flex; flex-direction:column;font-family: "Times New Roman", Times, serif;overflow:hidden;z-index:2;'></div>`);
        this.host.append(this.view);
        //section 0
        this.div0 = $(`<div class="dragg_area" style='width:100%;'></div>`);
        this.window_title = $(`<center class="dragg_area" style='font-weight:bold;'>Browser</center>`);
        this.div0.append(this.window_title);
        this.nav_area = $(`<div style='width:100%;text-align:right;padding:3px;'></div>`);
        this.prev_btn = $(`<a href='javascript:' style='color:grey;cursor:pointer;'> Prev</a>`);
        this.front_btn = $(`<a href='javascript:' style='color:grey;cursor:pointer;'> Next</a>`);
        this.nav_area.append(this.prev_btn,this.front_btn);
        this.div0.append(this.nav_area);
        this.view.append(this.div0);
        //section 1
        this.div1 = $(`<div style='width:100%;height:100%; display:flex; flex-direction:row;'></div>`);
        this.left = $(`<div style='width:200px;height:${this.height}; padding:3px;'><center>Bookmark</center></div>`);
        this.left_content = $(`<div style='width:100%; height:100%;background-color:rgb(5,7,7); overflow:scroll;'>sss</div>`);
        this.left.append(this.left_content);
        this.showBookMarks({where:this.left_content});
        this.right = $(`<div style='width:${this.width};height:${this.height};background-color:rgb(5,7,7);color:grey;'></div>`);
        this.right_content = $(`<div style='width:100%; height:100%;'></div>`);
        this.right.append(this.right_content);
        this.right_content_view_port = $(`<div style='width:100%; height:100%; overflow:scroll;'></div>`);
        this.right_content.append(this.right_content_view_port);
        this.right_content_table = $(`<table style='width:100%;'></table>`);
        this.right_content_view_port.append(this.right_content_table);
    
        this.div1.append(this.left,this.right);
        this.view.append(this.div1);

         //section 2
        this.div2 = $(`<div class="dragg_area" style='width:100%;'><center class="dragg_area" style='font-weight:bold;'>Footer</center></div>`);
        this.view.append(this.div2);

        this.makeItDraggleWIthClassName({elt:this.view, className:"dragg_area",color:"steelblue"});
        this.right.resizable();
        this.resetFront();
        this.prev_btn.click(()=>{
            this.goBack();
        });
        this.front_btn.click(()=>{
            this.goFront();
        });
    }
    makeItDraggleWIthClassName(args){
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
}