class DirBrowser{
    constructor(args){
        this.assistant_name ='browser';
        this.host = $("body");
        this.width = window.innerWidth-250+"px";// "700px";
        this.height = "500px";
        this.top = "100px";
        this.left = "10px";
        this.starting_path = `/Users/lassanakonate/Desktop/questions_app`;
        this.current_items = {};
        this.current_path = false;
        this.current_fronts = [];
        this.host_name = window.defined_host_name;
        this.initView();
        this.navigateToPath({path:this.starting_path},(path)=>{
                if(path){
                    this.current_path = path;
                }
            
        });
    //     window.assistant.changeName(this.assistant_name);
    //    // window.assistant.listen();
    //     window.assistant.onSentence((who,sent,next)=>{
    //         if(this.assistant_name ===who){
    //             this.handleAssistant(false,true,sent,next);
    //         }else{
    //             this.handleAssistant(false,false,sent,next);
    //         }
    //     });
    //     window.assistant.on_discret_sentence((who,sent,next)=>{
    //         if(this.assistant_name ===who){
    //             this.handleAssistant(true,true,sent,next);
    //         }else{
    //             this.handleAssistant(true,false,sent,next);
    //         }
    //     });
    }
    handleAssistant(discret,to_me,sent,next){
        if(discret){
            console.log("on_discret_sentence",sent,this.assistant_name);
            if(to_me){
                if(sent.startsWith(`hide self`)){
                    this.hide();
                }else if(sent.startsWith(`show self`)){
                    this.show();
                }
            }else{
                if(sent.startsWith(`hide ${this.assistant_name}`)){
                    this.hide();
                }else if(sent.startsWith(`${this.assistant_name} come here`)){
                    this.show();
                    window.assistant.changeName(this.assistant_name);
                }else{
                    next();
                }
            }
        }else{
            console.log("onSentence",sent,this.assistant_name);
            if(to_me){
                if(sent.startsWith(`hide self`)){
                    this.hide();
                }else if(`come here`){
                    this.show();
                    window.assistant.changeName(this.assistant_name);
        
                }else{
                    next();
                }
            }else{
                if(sent.startsWith(`${this.assistant_name} come here`)){
                    this.show();
                    window.assistant.changeName(this.assistant_name);
                
                }else{
                    next();
                }
            }
        }
    }
    hide(){
        this.view.hide();
    }
    show(){
        this.view.show();
    }
    fileDidScp(args){
        if(this.current_scp_bucket && this.current_scp_bucket[args.file_path]){
            let item  = this.current_scp_bucket[args.file_path];
            item.count = item.count + 1;
            item.counter.html(`${item.count} Time${item.count>1?"s":""}`);
            item.name.css({"background-color":"steelblue",color:"white"});
            window.coolScreen.adjustOpacity({
                for_time:1000,
                opacity:0.5
            });
            setTimeout(() => {
                item.name.css({"background-color":"inherit",color:"inherit"});
            }, 1000);
        }
    }
    showScpTransfers(){
        this.scp_bucket.empty();
        this.current_scp_bucket = {};
        $.ajax({ //// 
            type: "POST",
            url:`${this.host_name}/`+"get-scp-tranfers",
            contentType: 'application/json; charset=UTF-8'
        }).done((res)=>{
            console.log(res,"transfers");
            if(res && res.ok){
                for(let i =0; i<res.ok.length; i++){
                   ((i)=>{
                    let item = {
                        main_div:$(`<div style='width:100%;  padding:3px;margin-top:10px; background-color:rgb(5,7,7);color:grey;'></div>`),
                        div:$(`<div style='width:100%;  padding:3px;margin-top:10px; background-color:rgb(5,7,7);display:flex; flex-direction:row;color:grey;'></div>`),
                        name:$(`<div title='${res.ok[i].file_name}' style='width:80%; overflow:hidden; text-overflow:ellipsis; white-space: nowrap; display:inline-block;cursor:pointer;font-size:0.7em;'>${res.ok[i].file_name}</div>`),
                        to_dest:$(`<div title='${res.ok[i].destination_path}' style='color:steelblue;'><i class="fa fa-circle-o" aria-hidden="true"></i></div>`),
                        counter: $(`<div style='color:grey; font-size:0.7em;'>0</div>`),
                        rm:$(`<div style='cursor:pointer;color:red;display:none;'> <i class="fa fa-remove" style="color:inherit"></i></div>`),
                        count:0
                    };
                    item.main_div.append(item.div,item.counter);
                    item.div.append(item.name,item.to_dest,item.rm);
                    this.scp_bucket.append(item.main_div);
                    this.current_scp_bucket[res.ok[i].file_path] = item;
                    item.div.hover(()=>{
                        item.rm.show();
                    },()=>{
                        item.rm.hide();
                    });
                  
                    item.rm.click((e)=>{
                        e.stopPropagation();
                        if(confirm(`Are you sure stop watching ${res.ok[i].file_name}?`)){
                            //remove task
                            $.ajax({ //// 
                                type: "POST",
                                url:`${this.host_name}/`+"remove-task-for-file",
                                contentType: 'application/json; charset=UTF-8',
                                data:JSON.stringify({
                                    task_id:res.ok[i].task_id
                                })
                            }).done((res)=>{
                                if(res &&  res.ok){
                                   this.showScpTransfers();
                                }
                            }).fail((err)=>{
                                console.log("remove task",{err:err});
                            });
                        }
                });
                   })(i);
                }
            }
        }).fail((err)=>{
            console.log({err:err});
        });
    }
    showBookMarks(){
        this.bookmark_bucket.empty();
        $.ajax({ //// 
            type: "POST",
            url:`${this.host_name}/`+"get-bookmarks",
            contentType: 'application/json; charset=UTF-8'
        }).done((res)=>{
            if(res && res.ok){
                for(let i =0; i< res.ok.length; i++){
                    console.log("bookmarks",res.ok[i]);
                    let div = $(`<div style='width:100%; padding:3px;margin-top:10px; background-color:rgb(5,7,7);'></div>`);
                    let name = $(`<div title='${res.ok[i].name}' style='width:80%; overflow:hidden; text-overflow:ellipsis; white-space: nowrap; display:inline-block;cursor:pointer;font-size:0.7em;'>${res.ok[i].name}</div>`);
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
                    this.bookmark_bucket.append(div);
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
                        this.showBookMarks();
                    });
                    save.click((e)=>{
                        e.stopPropagation();
                        let text = name.text();
                        if(text.trim().length>0){
                          $.ajax({ //// 
                                type: "POST",
                                url:`${this.host_name}/`+"rename-bookmarks",
                                contentType: 'application/json; charset=UTF-8',
                                data:JSON.stringify({
                                    name:text,
                                    path:res.ok[i].path
                                })
                            }).done((res)=>{
                               if(res.ok){
                                   this.showBookMarks();
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
                                url:`${this.host_name}/`+"remove-bookmarks",
                                contentType: 'application/json; charset=UTF-8',
                                data:JSON.stringify({
                                    path:res.ok[i].path
                                })
                            }).done((res)=>{
                               if(res.ok){
                                   this.showBookMarks();
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
                                    setTimeout(() => {
                                        this.hightlightItem(res.ok[i]);
                                    }, 3);
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
    hightlightItem(args){
        let find = (path)=>{
            for(let id in this.current_items){
                if(this.current_items[id].full_path ===path){
                  return this.current_items[id];
                }
             }
            return false;
        };
        console.log("find", find(args.path));
        let elt = find(args.path);
        if(elt){
            //console.log(elt.view[0].offsetTop,"top",this.right_content_view_port[0].scrollTop);
            // this.right_content_view_port.animate({
            //     scrollTop:$(elt.view).offset().top
            // },1000);
        }
    }
    displayFileOnBucket(param, callBack) {
        let div = false;
        let view = false;
        let prepare_view = ()=>{
            this.fileViewer(true);
            view =this.right_content_view_port3_content;
            view.empty();
            div = $(
              `<div style='width:100%; height:100%; font-size:7px; color:grey; background-color:rgb(8,10,10); position:relative;' data-path = '${param.path}'><center>Loading...</center></div>`
            );
            view.append(div);
        };
        let allowed_json = {json:true};
        let allowed_csv = {csv:true};
        let allowed_contents = {sh:true,"x-file":true,js:true};
        let allowed_db = {db:true};
        if (allowed_json[param.type]) {
            prepare_view();
          $.ajax({
            type: "POST",
            url:`${this.host_name}/`+"stream-file",
            data: { path: param.path}
          })
            .done((res)=>{
              if (res) {
                let data = JSON.parse(res);
                div.empty();
                let controler = new JsonViewer({
                  data: data,
                  host: div,
                  height: div.css("height").replace("px", "")
                });
              } else {
                alert("Error: could not load file");
              }
            })
            .fail((err)=>{
              console.log(err);
              alert("Error: could not load file");
            });
        }else if(allowed_csv[param.type]){

            prepare_view();
            $.ajax({
              type: "POST",
              url:`${this.host_name}/`+"stream-file",
              data: { path: param.path}
            }).done((res)=>{
                if (res) {
                  div.empty();
                  let controler = new CsvViewer({
                    data: $.csv.toArrays(res),
                    host: div,
                    theme: "white",
                    height: div.css("height").replace("px", "")
                  });
                } else {
                  alert("Error: could not load file");
                }
              })
              .fail((err)=>{
                console.log(err);
                alert("Error: could not load file");
              });
        }else if(allowed_contents[param.type]){
            prepare_view();
            $.ajax({
              type: "POST",
              url:`${this.host_name}/`+"stream-file",
              data: { path: param.path}
            })
              .done((res)=>{
                div.empty();
                let controler = new ContentViewer({
                  data: res,
                  host: div,
                  theme: "white",
                  height: div.css("height").replace("px", "")
                });
              })
              .fail((err)=>{
                console.log(err);
                alert("Error: could not load file");
              });
        } else if(allowed_db[param.type]){
          prepare_view();
          div.empty();
          let master = new SqliteViewer({
                host:div,
                database:param.path
          });
        }else{
            prepare_view();
            $.ajax({
              type: "POST",
              url:`${this.host_name}/`+"stream-file",
              data: { path: param.path}
            })
              .done((res)=>{
                div.empty();
                let controler = new ContentViewer({
                  data: res,
                  host: div,
                  theme: "white",
                  height: div.css("height").replace("px", "")
                });
              })
              .fail((err)=>{
                console.log(err);
                alert("Error: could not load file");
              });
        }
      };
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
            this.showBookMarks();
        });
        item.on("file",(what)=>{
            console.log("file",what.elt);
            if(what.elt.item_type!=="dir"){
                this.displayFileOnBucket({
                    path:what.elt.full_path,
                    name:what.elt.name,
                    type:what.elt.item_type
                });
            }
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
            url:`${this.host_name}/`+"browse",
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
    handleBookMarkBucket(){
        let target = this.bookmark_bucket;
        target.on("dragenter",(event)=>{
            event.preventDefault();
        });
        target.on("dragover",(event)=>{
            event.preventDefault();
            target.css({ border: "2px solid dodgerblue" });
          });
          target.on("dragleave",(event)=>{
            target.css({ border: "none"});
          });
          target.on("drop", (event)=>{
            target.css({ border: "none"});
            let data_x = event.originalEvent.dataTransfer.getData("info");
            let data = JSON.parse(data_x);
            if(data.file_name && data.file_path && data.file_type){
                $.ajax({ //// 
                    type: "POST",
                    url:`${this.host_name}/`+"add-bookmarks",
                    contentType:'application/json; charset=UTF-8',
                    data:JSON.stringify({
                        name:data.file_name,
                        path:data.file_path,
                        type:(data.file_type ==="dir"?"dir":"file")
                    })
                }).done((res)=>{
                    if(res.ok){
                        this.showBookMarks();
                    }else{
                        alert(JSON.stringify(res));
                    }
                }).fail((err)=>{
                    alert(JSON.stringify(err));
                    console.log({err:err});
                });
            }
            console.log(data);

          });
    }
    handleScpBucket(args){
        let target = args.place;
        target.on("dragenter",(event)=>{
            event.preventDefault();
        });
        target.on("dragover",(event)=>{
            event.preventDefault();
            target.css({ border: "2px solid dodgerblue" });
          });
          target.on("dragleave",(event)=>{
            target.css({ border: "none"});
          });
          target.on("drop", (event)=>{
            target.css({ border: "none"});
            let data_x = event.originalEvent.dataTransfer.getData("info");
            let data = JSON.parse(data_x);
            if(data.file_name && data.file_path && data.file_type!=="dir"){
                let offset = target.offset();
                let area = window.cool_modal.getView({top:offset.top, left:offset.left});
                area.append(`<center>SCP ${data.file_name}</center>`);
                let destination_area = $(`<div></div>`);
                let destination_input = $(`<textarea id="destination_area" class="md-textarea form-control" rows="3" style='background-color:rgb(5,7,7);resize: none;'></textarea>`);
                let label = $(`<label for="destination_area">Destination</label>`);
                let div = $(`<div></div>`);
                let submit_button = $(`<button type="button" class="btn btn-dark">Submit</button>`);
                div.append(submit_button);
                destination_area.append(label,destination_input,div);
                area.append(destination_area);
                submit_button.click((e)=>{
                    e.stopPropagation();
                    let destination_path = destination_input.val().trim();
                    if(destination_path){
                        $.ajax({ ////
                            type: "POST",
                            url:`${this.host_name}/`+"add-file-task",
                            contentType: 'application/json; charset=UTF-8',
                            data:JSON.stringify({
                                file_name:data.file_name,
                                file_path:data.file_path,
                                task_type:"scp",
                                source_path:data.file_path,
                                destination_path:destination_path
                            })
                            }).done((res)=>{
                                if(res.ok){
                                    this.showScpTransfers();
                                    window.cool_modal.destroy();
                                }
                                console.log("add-file-task",res);
                            }).fail((err)=>{
                                console.log("add-file-task",{err:err});
                            });
                    }
                });
            }else if(data.file_type==="dir"){
              alert("Error: only files are allowed");
            }else{
                alert("Error: when dragging");
            }
            console.log(data);

          });
    }
    fileViewer(show){
        let speed = 100;
        if(show){
            if(this.right_content_view_port.is(":visible")){
                this.right_content_view_port.animate({width:"50%"},speed);
            }
            if(this.right_content_view_port2.is(":visible")){
                this.right_content_view_port2.animate({width:"50%"},speed);
            }
            if(!this.right_content_view_port3.is(":visible")){
                this.right_content_view_port3.show();
            }
            this.right_content_view_port3.animate({width:"50%"},speed);
        }else{
            this.right_content_view_port.animate({width:"100%"},speed);
            this.right_content_view_port2.animate({width:"100%"},speed);
            this.right_content_view_port3.animate({width:"100%"},speed,()=>{
                this.right_content_view_port3.hide();
            });
        }
    }
    swicth_file_display(args){
       if(args.list){
        this.right_content_view_port.show();
        this.right_content_view_port2.hide();
        this.current_display_type = 'file';
       }
       if(args.box){
        this.right_content_view_port2.show();
        this.right_content_view_port.hide();
        this.current_display_type = 'box';
       }
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
        this.left = $(`<div style='width:200px;height:${this.height}; padding:3px;'><center>Autre</center></div>`);
        this.left_content = $(`<div style='width:100%; height:100%;background-color:rgb(5,7,7); overflow:scroll;'></div>`);
        let bookmark_div = $(`<div style='width:100%;background-color:rgb(5,7,7); '><center>Bookmark</center></div>`);
        this.bookmark_bucket = $(`<div style='width:100%; min-height:100px; max-height:300px;background-color:black; overflow:scroll;'></div>`);
        this.left.append(this.left_content);
        bookmark_div.append(this.bookmark_bucket);
        this.left_content.append(bookmark_div);
        this.showBookMarks();
        this.handleBookMarkBucket();
        let div_scp = $(`<div style='width:100%; background-color:rgb(5,7,7);'><center>Transfer</center></div>`)
        this.scp_bucket = $(`<div style='width:100%; min-height:100px; max-height:300px;background-color:black; overflow:scroll;'></div>`);
        this.left.append(this.left_content);
        div_scp.append(this.scp_bucket);
        this.left_content.append(div_scp);
        this.showScpTransfers();
        this.handleScpBucket({place:this.scp_bucket});

        this.right = $(`<div style='width:${this.width};height:${this.height};background-color:rgb(5,7,7);color:grey;'></div>`);
        this.right_content = $(`<div style='width:100%; height:100%; position:relative;'></div>`);
        this.right.append(this.right_content);
        this.right_content_view_port = $(`<div style='position:absolute; top:0px; left:0px;  width:100%; height:100%; overflow:scroll;'></div>`);
        this.right_content_view_port2 = $(`<div style='position:absolute; top:0px; left:0px; border:2px solid blue; width:100%; height:100%;display:none; overflow:scroll;'></div>`);
        this.right_content_view_port3 = $(`<div style='position:absolute; top:0px; right:0px;  width:100%; height:100%;display:flex; flex-direction:column; overflow:scroll;background-color:rgb(8,10,10);'></div>`);
        this.right_content_view_port3_content = $(`<div style='width:100%; height:100%;border:2px solid rgb(18,20,20);overflow:scroll;'></div>`);
        let temp_div = $(`<div style='width:100%;text-align:right;padding:2px;'></div>`);
        let hide_file_display_area = $(`<a href='javascript:' style='color:white;'>Hide</a>`);
        temp_div.append(hide_file_display_area);
        this.right_content.append(this.right_content_view_port,this.right_content_view_port2,this.right_content_view_port3);
        this.right_content_view_port3.append(temp_div,this.right_content_view_port3_content);
        this.right_content_view_port3.hide();
        this.right_content_table = $(`<table style='width:100%;'></table>`);
        this.right_content_view_port.append(this.right_content_table);
        hide_file_display_area.click((e)=>{
            e.stopPropagation();
            this.fileViewer(false);
        });
        this.div1.append(this.left,this.right);
        this.view.append(this.div1);

         //section 2
        this.div2 = $(`<div class="dragg_area" style='width:100%;'><center class="dragg_area" style='font-weight:bold;'>Footer</center></div>`);
        this.view.append(this.div2);

        this.makeItDraggleWIthClassName({elt:this.view, className:"dragg_area",color:"steelblue"});
        this.right.resizable();
        this.left.resizable();
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