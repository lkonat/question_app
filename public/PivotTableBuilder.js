class PivotTableBuilderFieldElt{
    static controlers = {};
    constructor(args){
      this.removable = args.removable;
      this.id = this.makeid();
      this.in_box = args.inBox;
      this.name = args.name;
      this.has_checbox = args.checkbox;
      this.host = args.host;
      this.init();
      let exist = this.isExit(this.name);
      if(exist){
        for(let i =0;i<exist.length; i++){
            console.log(exist[i].in_box,i,"<-->", this.name,this.in_box);
            if(this.in_box !=="filters" && exist[i].in_box && exist[i].in_box!=='fields' && exist[i].in_box!=='filters'){
                exist[i].deleteSelf();
            }
        }
      }
      PivotTableBuilderFieldElt.save(this);
    }
    makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return new Date().getTime()+"I"+text;
    }
    isExit(name0){
        let obj = false;
        for(let id in PivotTableBuilderFieldElt.controlers){
            if(PivotTableBuilderFieldElt.controlers[id].name ===name0){
                if(!obj){
                    obj = [];
                }
                obj.push(PivotTableBuilderFieldElt.controlers[id]);
             }
        }
        return obj;
    }
    on(what,that){
        if(!this.cEvents){
            this.cEvents = {}; 
        }
        this.cEvents[what] = that;
        if(what ==="delete" && this.del){
            this.del.show();
        }
    }

    fireEvent(what,args){
        if(!this.cEvents){
            this.cEvents = {}; 
        }
        if(this.cEvents[what]){
            this.cEvents[what](args);
        }
    }
    static delete(that) {
        delete PivotTableBuilderFieldElt.controlers[that.id];
        //console.log("PivotTableBuilderFieldElt.controlers",PivotTableBuilderFieldElt.controlers);
    }
    static save(that) {
        PivotTableBuilderFieldElt.controlers[that.id] = that;
        //console.log("PivotTableBuilderFieldElt.controlers",PivotTableBuilderFieldElt.controlers);
    }
    deleteSelf(){
        this.view.remove();
        PivotTableBuilderFieldElt.delete(this);
        this.fireEvent("delete",this.name);
    }
    init(){
        this.view = $(`<div style='width:100%;'></div>`);
        this.title =$(`<span draggable="true" style='cursor:pointer;'> ${this.name}</span>`);
        if(this.has_checbox){
            this.checbox = $(`<input type="checkbox"></input>`);
            this.view.append(this.checbox);
        }
        this.del =$(`<span style='float:right;cursor:pointer;display:none;'><i class="fa fa-times" aria-hidden="true"></i></span>`);
        this.view.append(this.title,this.del);
        this.host.append(this.view);
        this.del.click((e)=>{
            e.stopPropagation();
            this.deleteSelf();
        });
        this.title.on("dragstart", event => {
            event.originalEvent.dataTransfer.dropEffect = "move";
            event.originalEvent.dataTransfer.setData("info",
                JSON.stringify({
                    filed_name:this.name
                })
            );
        });
        this.title.on("dragend", event => {
            if(this.removable){
               this.deleteSelf();
            }
        });

    }
}
class PivotTableBuilder{
    constructor(args){
       this.host = args.host;
       this.result_area = args.show_on;
       this.currents = {filters:{}, columns:{},values:{}, rows:{}};
       this.initView();
       this.addFilterLogic();
       this.addColumnsLogic();
       this.addRowsLogic();
       this.addValuesLogic();
       this.on("currents-changed",()=>{
           this.showResult();
       });
    }
    getInfoAboutData(rawData){
        let n_row = false;
        let fields = false;
        let rows = [];
       for(let i =0; i< rawData.length; i++){
           if(!n_row && n_row!==0){
               n_row = rawData[i].length;
           }else if(n_row !== rawData[i].length){
              return {err:`data structure issue`};
           }
           if(i===0){
            fields = rawData[i];
           }else{
               let arr = {};
               for(let j =0; j< rawData[i].length; j++){
                arr[fields[j]] = rawData[i][j];
               }
               rows.push(arr);
           }
       }
       return {fields:fields,rows:rows};
    }
    preprocessata(rawData){
        //get fields 
        //get longest rows

        //process 

    }
    getFieldsValues(field_name){
      let results = false;
      for(let i =0; i< this.data_rows.length; i++){
        if(this.data_rows[i][field_name] || this.data_rows[i][field_name]===0){
            if(!results){
                results = [];
            }
            results.push(this.data_rows[i][field_name]);
        }
      }
      return results;
    }
    findRowWhere(args){
    //   console.log(args);
      let conds = args.conditions;
      for(let i =0; i< this.data_rows.length; i++){
        let count = conds.length;
        for(let j =0; j< conds.length; j++){
          if(this.data_rows[i][conds[j].field] === conds[j].value){
            count = count - 1;
          }
        }
        if(conds.length>0 && count ===0){
         console.log("****00000",this.data_rows[i]);
          return this.data_rows[i];
        }
      }
      return false;
    }
    showResult(){
        this.results={rows:[],columns:[]};
        if(!this.result_area_content){
            this.result_area_content = $(`<div style='width:100%; min-height:500px; background-color:rgb(8,10,10); color:grey;font-size:0.7em;'></div>`);
            this.result_area.append(this.result_area_content);
        }
        this.result_area_content.empty();
        let table = $(`<table ></table>`);
        this.result_area_content.append(table);
        //add columns
        let columns = Object.keys(this.currents.columns);
        if(columns.length>0){
          let values =this.getFieldsValues(columns[0]);
          let row = $(`<tr style='border:none;'><td style='border:1px solid rgb(28,30,30); font-weight:bold;'>Row labels</td></tr>`);
          for(let i =0;i<values.length; i++){
            let col = $(`<td style='border:1px solid rgb(28,30,30); font-weight:bold;padding:3px;'>${values[i]}</td>`);
            this.results.columns.push({col:col,name:columns[0], value:values[i]});
            row.append(col);
          }
          table.append(row);
        }
        //add rows
        let rows = Object.keys(this.currents.rows);
        if(rows.length>0){
          let values = this.getFieldsValues(rows[0]);
          for(let i =0;i<values.length; i++){
            let row = $(`<tr style='border:none; color:grey;'><td style='padding:3px;border:1px solid rgb(28,30,30);'>${values[i]}</td></tr>`);
            this.results.rows.push({row:row,name:rows[0],value:values[i]});
            table.append(row);
          }
        }
        //add values
        let values = Object.keys(this.currents.values);
        if(values.length>0){
            let selected_field = values[0];
           for(let i =0; i< this.results.rows.length; i++){
              for(let j =0; j< this.results.columns.length; j++){
                 let td = $(`<td style='border:1px solid rgb(28,30,30);'></td>`);
                 let found = this.findRowWhere({
                    conditions :[
                        {field:this.results.rows[i].name,value:this.results.rows[i].value},
                        {field:this.results.columns[j].name,value:this.results.columns[j].value},
                    ]
                });
                if(found){
                    td = $(`<td style='border:1px solid rgb(28,30,30);'>${found[selected_field]}</td>`);
                }
                this.results.rows[i].row.append(td);
              }
           }
        }
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
    close(){
        this.view.hide();
        return true;
    }
    getTheme(target){
      if(target==="background-color"){
        return "rgb(28,30,30)";
      }else if(target==="color"){
         return "grey";
      }
    }
    open(){
       if(this.view){
        this.view.show();
           return true;
       }else{
           return false;
       } 
    }
    addToCurrent(args){
        if(args.target && args.field_name && this.currents[args.target]){
            if(args.target !=="filters"){
                this.currents[args.target] = {};
            }
            this.currents[args.target][args.field_name] = true;
            this.fireEvent("currents-changed",true);
            return true;
        }else{
          return false;
        }
    }
    removeFromCurrent(args){
        if(args.target && args.field_name && this.currents[args.target][args.field_name]){
            delete this.currents[args.target][args.field_name];
            this.fireEvent("currents-changed",true);
            return true;
        }else{
          return false;
        }
    }
    //filters start
    removeFilter(field_name){
      if(this.removeFromCurrent({target:'filters',field_name:field_name})){
        this.showCurrentFilters()
      }
    }
    showCurrentFilters(){
        this.filterBoxContent.empty();
        for(let elt in this.currents.filters){
            let controler = new PivotTableBuilderFieldElt({
                inBox:'filters',
                name:elt,
                checkbox:false,
                host:this.filterBoxContent,
                removable:true
            });
            controler.on("delete",(name)=>{
                this.removeFilter(name);
            });
        }
    }

    addFilterLogic(){
        this.AllowDropOn({
            target: this.filterBoxContent,
            onDrop:(info)=>{
                if(info && info.filed_name){
                    if(this.addToCurrent({target:"filters",field_name:info.filed_name})){
                        this.showCurrentFilters();
                    }else{
                        alert("error ,could not add");
                    }
                }
            }
        });
    }
    //filters-ends
    //columns-start
    removeColumns(field_name){
        if(this.removeFromCurrent({target:'columns',field_name:field_name})){
          this.showCurrentColumns()
        }
    }
    showCurrentColumns(){
        this.columnBoxContent.empty();
        for(let elt in this.currents.columns){
            let controler = new PivotTableBuilderFieldElt({
                inBox:'columns',
                name:elt,
                checkbox:false,
                host:this.columnBoxContent,
                removable:true
            });
            controler.on("delete",(name)=>{
                this.removeColumns(name);
            });
            // let one = $(`<div style='width:100%;'></div>`);
            // let title =$(`<span>${elt}</span>`);
            // let del =$(`<span style='float:right;cursor:pointer;'><i class="fa fa-times" aria-hidden="true"></i></span>`);
            // one.append(title,del);
            // this.columnBoxContent.append(one);
            // del.click((e)=>{
            //   e.stopPropagation();
            //   this.removeColumns(elt);
            // });
        }
    }
    addToColumns(filed_name){
        if(filed_name){
            this.currents.columns[filed_name] = true;
            return true;
        }else{
          return false;
        }
    };
    addColumnsLogic(){
        this.AllowDropOn({
            target: this.columnBoxContent,
            onDrop:(info)=>{
                if(info && info.filed_name){
                    if(this.addToCurrent({target:"columns",field_name:info.filed_name})){
                        this.showCurrentColumns();
                    }else{
                        alert("error ,could not add");
                    }
                }
            }
        });
    }
    //columns-ends

    //rows-start
    removeRow(field_name){
        if(this.removeFromCurrent({target:'rows',field_name:field_name})){
          this.showCurrentRows()
        }
    }
    showCurrentRows(){
        this.rowsBoxContent.empty();
        for(let elt in this.currents.rows){
            let controler = new PivotTableBuilderFieldElt({
                inBox:'rows',
                name:elt,
                checkbox:false,
                host:this.rowsBoxContent,
                removable:true
            });
            controler.on("delete",(name)=>{
                this.removeRow(name);
            });


            // let one = $(`<div style='width:100%;'></div>`);
            // let title =$(`<span>${elt}</span>`);
            // let del =$(`<span style='float:right;cursor:pointer;'><i class="fa fa-times" aria-hidden="true"></i></span>`);
            // one.append(title,del);
            // this.rowsBoxContent.append(one);
            // del.click((e)=>{
            //   e.stopPropagation();
            //   this.removeRow(elt);
            // });
        }
    }
    addRowsLogic(){
        this.AllowDropOn({
            target: this.rowsBoxContent,
            onDrop:(info)=>{
                if(info && info.filed_name){
                    if(this.addToCurrent({target:"rows",field_name:info.filed_name})){
                        this.showCurrentRows();
                    }else{
                        alert("error ,could not add");
                    }
                }
            }
        });
    }
    //rows-ends

    //values-start
    removeValue(field_name){
        if(this.removeFromCurrent({target:'values',field_name:field_name})){
          this.showCurrentValues()
        }
    }
    showCurrentValues(){
        this.valueBoxContent.empty();
        for(let elt in this.currents.values){
            let controler = new PivotTableBuilderFieldElt({
                inBox:'values',
                name:elt,
                checkbox:false,
                host:this.valueBoxContent,
                removable:true
            });
            controler.on("delete",(name)=>{
                this.removeValue(name);
            });


            // let one = $(`<div style='width:100%;'></div>`);
            // let title =$(`<span>${elt}</span>`);
            // let del =$(`<span style='float:right;cursor:pointer;'><i class="fa fa-times" aria-hidden="true"></i></span>`);
            // one.append(title,del);
            // this.valueBoxContent.append(one);
            // del.click((e)=>{
            //   e.stopPropagation();
            //   this.removeValue(elt);
            // });
        }
    }
    addValuesLogic(){
        this.AllowDropOn({
            target: this.valueBoxContent,
            onDrop:(info)=>{
                if(info && info.filed_name){
                    if(this.addToCurrent({target:"values",field_name:info.filed_name})){
                        this.showCurrentValues();
                    }else{
                        alert("error ,could not add");
                    }
                }
            }
        });
    }
    //values-ends
    addFiedlNames(args){
      let fields = args.fields;
      let addOne = (field)=>{
        // let one = $(`<div ></div>`);
        // let title =$(`<span draggable="true" style='cursor:pointer;'> ${field.name}</span>`);
        // let checbox = $(`<input type="checkbox"></input>`);
        // one.append(checbox,title);
        // this.fieldNameEltsViewContent.append(one);
        // title.on("dragstart", event => {
        //     event.originalEvent.dataTransfer.dropEffect = "move";
        //     event.originalEvent.dataTransfer.setData("info",JSON.stringify({
        //         filed_name: field.name
        //       })
        //     );
        // });
        new PivotTableBuilderFieldElt({
            inBox:'fields',
            name:field.name,
            checkbox:true,
            host:this.fieldNameEltsViewContent,
            removable:false
        });
      };
      if(args.empty){
        this.fieldNameEltsViewContent.empty();
      }
      for(let i =0; i< fields.length; i++){
        addOne({name:fields[i]});
      }
    }

    AllowDropOn(args){
        let target = args.target
        target.on("dragenter",(event)=>{
            event.preventDefault();
        });
        target.on("dragover",(event)=>{
            event.preventDefault();
            target.css({ border: "2px solid dodgerblue" });
          });
          target.on("dragleave",(event)=>{
            target.css({ border: "2px solid rgb(28,30,30)" });
          });
          target.on("drop", (event)=>{
            target.css({ border: "2px solid rgb(28,30,30)" });
            let data_x = event.originalEvent.dataTransfer.getData("info");
            let data = JSON.parse(data_x);
            args.onDrop(data);
          });
    }
    initWithData(args){
        let outcome = this.getInfoAboutData(args.data);
        console.log("getInfoAboutData",outcome);
        if(outcome && outcome.fields && outcome.rows){
           this.data_rows = outcome.rows;
           this.data_fields = outcome.fields;
           this.addFiedlNames({fields:this.data_fields});
        }else{
            alert(JSON.stringify(outcome));
            return false;
        }
    }
    initView(){
        this.view = $(`<div style='min-width:300px; min-height:500px;box-shadow: 0 0 5px steelblue;position:fixed; top:220px; left:30px; background-color:${this.getTheme("background-color")}; color:${this.getTheme("color")};display:flex; flex-direction:column;font-family: "Times New Roman", Times, serif;'></div>`);
        this.host.append(this.view);
        this.div0 = $(`<div class="dragg_area" style='display:flex; flex-direction:row;padding:3px;'></div>`);
        this.title_view = $(`<h6 class="dragg_area" style='width:100% ;margin-left:7px;'>PivotTable</h6>`);
        this.close_view = $(`<span style='display:table;'>X</span>`);
        this.div0.append(this.title_view,this.close_view);
        this.close_view.click((e)=>{
          this.close();
        });
        this.div1 = $(`<div style='display:flex; flex-direction:row;padding:3px;'></div>`);
        this.fieldName = $(`<div style='width:100%;'><span style='color:rgb(8,10,10);'>FIELD NAME</span></div>`);
        this.searchField = $(`<div style='width:100%; background-color:rgb(5,7,7);'>search</div>`);
        this.div1.append(this.fieldName,this.searchField);
        this.div2 = $(`<div display:flex; flex-direction:row;'></div>`);
        this.fieldNameEltsView = $(`<div style='width:100%; padding:3px;'></div>`);
        this.fieldNameEltsViewContent = $(`<div style='width:100%; height:100px; background-color:rgb(5,7,7);padding:2px;'></div>`);
        this.fieldNameEltsView.append(this.fieldNameEltsViewContent);
        this.div2.append(this.fieldNameEltsView);

        // this.div34 = $(`<div display:flex; flex-direction:row; padding:3px;></div>`);
        // this.table = $(`<table style='width:100%;'></table>`);
        // this.div34.append(this.table);
        // let table_row1 = $(`<tr style='border:none;'></tr>`);
        // let table_row1_col1 = $(`<td style='border:none;'>Filter</td>`);
        // let table_row1_col2 = $(`<td style='border:none;'>Column</td>`);
        // table_row1.append(table_row1_col1,table_row1_col2);
        // this.table.append(table_row1);
        // this.filterBox = $(`<div style='display:inline-block; width:100%;padding:3px;'><h6 style='padding-left:5px;'>Filters</h6></div>`);
        // this.filterBoxContent = $(`<div style='display:inline-block; width:100%;height:130px; background-color:rgb(5,7,7);'></div>`);
        // this.filterBox.append(this.filterBoxContent);
        // table_row1_col1.append(this.filterBox);
        // this.columnBox = $(`<div style='display:inline-block; width:100%;padding:3px;'><h6 style='padding-left:5px;'>Columns</h6></div>`);
        // this.columnBoxContent = $(`<div style='display:inline-block; width:100%;height:130px; background-color:rgb(5,7,7);'></div>`);
        // this.columnBox.append(this.columnBoxContent);
        // table_row1_col2.append(this.columnBox);

        this.div3 = $(`<div display:flex; flex-direction:row; padding:3px;></div>`);
        this.filterBox = $(`<div style='display:inline-block; width:50%;padding:3px;'><h6 style='padding-left:5px;'>Filters</h6></div>`);
        this.filterBoxContent = $(`<div style='display:inline-block; width:100%;height:130px; background-color:rgb(5,7,7);overflow:scroll;'></div>`);
        this.filterBox.append(this.filterBoxContent);
        this.columnBox = $(`<div style='display:inline-block; width:50%;padding:3px;'><h6 style='padding-left:5px;'>Columns</h6></div>`);
        this.columnBoxContent = $(`<div style='display:inline-block; width:100%;height:130px; background-color:rgb(5,7,7);overflow:scroll;'></div>`);
        this.columnBox.append(this.columnBoxContent);
        this.div3.append(this.filterBox,this.columnBox);
        this.div4 = $(`<div></div>`);
        this.rowsBox = $(`<div style='display:inline-block; width:50%;padding:3px;'><h6 style='padding-left:5px;'>Rows</h6></div>`);
        this.rowsBoxContent = $(`<div style='display:inline-block; width:100%;height:130px; background-color:rgb(5,7,7);overflow:scroll;'></div>`);
        this.rowsBox.append(this.rowsBoxContent);
        this.valueBox = $(`<div style='display:inline-block; width:50%;padding:3px;'><h6 style='padding-left:5px;'>Values</h6></div>`);
        this.valueBoxContent = $(`<div style='display:inline-block; width:100%;height:130px; background-color:rgb(5,7,7);overflow:scroll;'></div>`);
        this.valueBox.append(this.valueBoxContent);
        this.div4.append(this.rowsBox,this.valueBox);
        this.div5 = $(`<div></div>`);
        this.footer = $(`<div style='width:100%; height:30px;'><center>Drag fields between areas</center></div>`);
        this.div5.append(this.footer);
       // this.view.append(this.div0,'<br>',this.div1,'<br>',this.div2,'<br>',this.div34,this.div5);
        this.view.append(this.div0,'<br>',this.div1,'<br>',this.div2,'<br>',this.div3,this.div4,this.div5);

        //this.view.draggable();
        this.makeItDraggleWIthClassName({elt:this.view, className:"dragg_area",color:"steelblue"});
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