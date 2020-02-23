class DirBrowserItem{
    constructor(args){
      this.full_path = args.full_path;
      this.data=args.data;
      this.host = args.host;
      this.id = args.id;
      this.name = args.name;
      this.size = args.size;
      this.height = '30px';
      this.item_type = this.getFileType();
    }
        on(what,that){
        if(!this.cEvents){
            this.cEvents = {}; 
        }
        this.cEvents[what] = that;
    }
    fireEvent(what,args){
        if(this.cEvents && this.cEvents[what]){
            this.cEvents[what](args);
        }
    }
    getFileType(){
        if(this.data.type ==="dir"){
            return "dir";
        }else if(this.data.type ==="file"){
           if(this.data.name.endsWith(".js")){
             return "js";
           }else if(this.data.name.endsWith(".txt")){
             return "txt";
           }else if(this.data.name.endsWith(".json")){
             return "json";
           }else if(this.data.name.endsWith(".csv")){
             return "csv";
           }else if(this.data.name.endsWith(".py")){
             return "py";
           }else if(this.data.name.endsWith(".db")){
             return "db";
           }else{
               return "x-file";
           }
        }else{
           return "x-type";
        }
    }
    roundDecimal(number,decimalPlace){
      let data = number;
      if (typeof data === "number"){
        if (data % 1 != 0){ //if decimal number
           data = data.toFixed(decimalPlace);
        }
      }
      return data;
    }
    getDateStrFromTs(ts, dte) {
        let months_list = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "June",
            "July",
            "Aug",
            "Sept",
            "Oct",
            "Nov",
            "Dec"
        ];
        let days_list = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];
        let date_curr = new Date();
        date_curr.setTime(ts);
        try {
            let d = date_curr;
            if (dte) {
            if (dte === "formatAMPM") {
                return formatAMPMTs(d);
            } else {
                return (
                days_list[d.getDay()] +
                " " +
                months_list[d.getMonth()] +
                " " +
                d.getDate() +
                " " +
                d.getFullYear()
                );
            }
            } else {
            return (
                months_list[d.getMonth()] +
                " " +
                d.getDate() +
                " " +
                d.getFullYear() +
                " at " +
                formatAMPMTs(d)
            );
            }
        } catch (e) {
            alert(e);
            return "";
        }
        function formatAMPMTs(date) {
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            let ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? "0" + minutes : minutes;
            let strTime = hours + ":" + minutes + " " + ampm;
            return strTime;
        }
    };
    convertSize(sizeInBytes) {
        if (sizeInBytes > 1000 && sizeInBytes < 1000000) {
            return this.roundDecimal(sizeInBytes / 1000, 0) + `KB`;
        } else if (sizeInBytes < 1000) {
            return this.roundDecimal(sizeInBytes, 0) + `bytes`;
        } else if (sizeInBytes > 1000000) {
            return this.roundDecimal(sizeInBytes / 1000000, 0) + `MB`;
        } else if (sizeInBytes > 1000000000) {
            return this.roundDecimal(sizeInBytes / 1000000000, 0) + `GB`;
        }
    }
    clicked(args){
         //console.log(this);
     
         if(this.item_type ==="dir"){
            this.fireEvent("dir",{path:this.data.full_path,elt:this});
         }else{
           this.fireEvent("file",{path:this.data.full_path,elt:this});
         }
    }
    setIcon(){
        if(this.item_type ==="dir"){
           this.icon_view.html(`<i class="fa fa-folder" aria-hidden="true"></i>`);
        }else if(this.item_type ==="x-file"){
           this.icon_view.html(`<i class="fa fa-file-o" style="color:red"></i>`);
        }
        else if(this.item_type ==="js"){
            this.icon_view.html(`<i style='color:coral;'>JS</i>`);
        }
        else if(this.item_type ==="txt"){
            this.icon_view.html(`<i style='color:coral;'>tt</i>`);
        }else if(this.item_type ==="csv"){
             this.icon_view.html(`<i style='color:coral;'>CV</i>`);
        }else if(this.item_type ==="py"){
            this.icon_view.html(`<i style='color:coral;'>PY</i>`);
        }
        else if(this.item_type ==="db"){
             this.icon_view.html(`<i style='color:coral;'>DB</i>`);
        }else if(this.item_type ==="x-type"){
           this.icon_view.html(`...`);
        }
        else if(this.item_type ==="json"){
           this.icon_view.html(`<i style='color:steelblue;'>JN</i>`);
        }else{
            this.icon_view.html(`<i style='color:steelblue;'>**</i>`);
        }
    }
    removeWindowSelection(){
        if(window.getSelection) {
                if (window.getSelection().empty) {  // Chrome
                    window.getSelection().empty();
                } else if (window.getSelection().removeAllRanges) {  // Firefox
                    window.getSelection().removeAllRanges();
                }
        }else if (document.selection) {  // IE?
            document.selection.empty();
        }
    }
    initView(){
       this.view = $(`<tr style='border:none;color:grey;border-bottom:1px solid rgb(18,20,20);white-space:nowrap;'></tr>`);
       this.icon_view = $(`<td style='border:none; color:inherit;cursor:pointer;padding:3px;'></td>`);
       this.title_view = $(`<td style='border:none;color:inherit;cursor:pointer;padding:3px;'>${this.name}</td>`);
       this.size_view = $(`<td style='border:none;color:inherit;padding:3px;font-size:0.7em;'>${this.convertSize(this.size)}</td>`);
       this.date_view = $(`<td style='border:none;color:inherit;padding:3px;font-size:0.7em;text-align:right;'>${this.getDateStrFromTs(this.data.modified,false)}</td>`);
       this.title_view.click((e)=>{
         e.stopPropagation();
         this.clicked({target:'title'});
       });
      this.title_view.contextmenu((e)=>{
            e.stopPropagation();
            e.preventDefault();
            console.log(this);
            this.removeWindowSelection();
            let a_view = window.custome_context_menu.getView({top:e.clientY, left:e.clientX});
            console.log(this.item_type,"0",this.item_type !== "dir");
            if(this.item_type !== "dir"){
                console.log(this.item_type,"1");
                a_view.addSection({
                    name:"v-watch",
                    on_click:()=>{
                        window.custome_context_menu.destroy();
                        console.log("watch file", this);
                        $.ajax({ ////
                            type: "POST",
                            url:"get-task-for-file",
                            contentType: 'application/json; charset=UTF-8',
                            data:JSON.stringify({
                                file_path:this.full_path /// /
                            })
                        }).done((res)=>{
                            console.log("get-file-task",res);
                            let area = window.cool_modal.getView({top:e.clientY, left:e.clientX});
                            area.append(`<center>SCP ${this.name}</center>`);
                            let currents_area = $(`<div style='max-height:60px; font-size:0.7em;overflow:scroll;background-color:rgb(5,7,7);'> </div>`);
                            let task_temp ={};
                            for(let i =0; i<res.ok.length; i++){
                                ((i)=>{
                                    if(!task_temp[res.ok[i].task_type]){
                                        task_temp[res.ok[i].task_type]= $(`<div style='font-size:0.7em;'><center>Current ${res.ok[i].task_type}</center></div>`);
                                        currents_area.append(task_temp[res.ok[i].task_type]);
                                    }
                                    let that_x = $(`<div style='font-size:0.7em;overflow:scroll;'>${res.ok[i].destination_path}</div>`);
                                    let rm = $(`<span style='color:red;cursor:pointer;'> x</span>`);
                                    that_x.append(rm);
                                    task_temp[res.ok[i].task_type].append(that_x);
                                    rm.click((e)=>{
                                        e.stopPropagation();
                                        //remove task
                                        $.ajax({ //// 
                                            type: "POST",
                                            url:"remove-task-for-file",
                                            contentType: 'application/json; charset=UTF-8',
                                            data:JSON.stringify({
                                                task_id:res.ok[i].task_id
                                            })
                                        }).done((res)=>{
                                            if(res &&  res.ok){
                                            that_x.remove();
                                            }
                                        }).fail((err)=>{
                                            console.log("remove task",{err:err});
                                        });
                                    });
                                })(i);
                            }

                            // {{!-- let source_area = $(`<div><center></center></div>`);
                            // let source_area_input = $(`<textarea id="destination_area" class="md-textarea form-control" rows="3" style='background-color:rgb(5,7,7);resize: none;'></textarea>`);
                            // let source_area_label = $(`<label for="destination_area">Source</label>`);
                            // source_area_input.val(this.full_path);
                            // source_area.append(source_area_label,source_area_input); --}}


                            let destination_area = $(`<div></div>`);
                            let destination_input = $(`<textarea id="destination_area" class="md-textarea form-control" rows="3" style='background-color:rgb(5,7,7);resize: none;'></textarea>`);
                            let label = $(`<label for="destination_area">Destination</label>`);
                            let div = $(`<div></div>`);
                            let submit_button = $(`<button type="button" class="btn btn-dark">Submit</button>`);
                            div.append(submit_button);
                            destination_area.append(label,destination_input,div);
                            area.append(currents_area,destination_area);
                            submit_button.click((e)=>{
                                e.stopPropagation();
                                let destination_path = destination_input.val().trim();
                                if(destination_path){
                                    $.ajax({ ////
                                        type: "POST",
                                        url:"add-file-task",
                                        contentType: 'application/json; charset=UTF-8',
                                        data:JSON.stringify({
                                            file_name:this.name,
                                            file_path:this.full_path,
                                            task_type:"scp",
                                            source_path:this.full_path,
                                            destination_path:destination_path
                                        })
                                        }).done((res)=>{
                                            if(res.ok){
                                                window.cool_modal.destroy();
                                            }
                                            console.log("add-file-task",res);
                                        }).fail(function(err) {
                                            console.log("add-file-task",{err:err});
                                        });
                                }
                            });
                        }).fail(function(err) {
                            console.log("get-file-task",{err:err});
                        });
        
                    }
                });
            }
            a_view.addSection({
                name:"+ Bookmark",
                on_click:()=>{
                    window.custome_context_menu.destroy();
                    $.ajax({ //// 
                        type: "POST",
                        url:"add-bookmarks",
                        contentType:'application/json; charset=UTF-8',
                        data:JSON.stringify({
                            name:this.name,
                            path:this.full_path,
                            type:(this.item_type ==="dir"?"dir":"file")
                        })
                    }).done((res)=>{
                        if(res.ok){
                            this.fireEvent("bookmark-changed",true);
                        }else{
                            alert(JSON.stringify(res));
                        }
                    }).fail((err)=>{
                        alert(JSON.stringify(err));
                        console.log({err:err});
                    });
                }
            });
            a_view.addSection({
                name:"what"
            });
       });
       this.view.append(this.icon_view,this.title_view,this.size_view,this.date_view);
       this.setIcon();
    }
    appendSelf(args,callBack){
        if(this.view){
          this.view.remove();
        }
        this.initView();
        this.host.append(this.view);
        return callBack();
    }
}