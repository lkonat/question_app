class CoolModal{
    constructor(){
       this.host = $('body');
    }
    getView(args){
        if(this.view){
           this.view.remove();
        }
        this.view = $(`<div style='min-width:500px;min-height:200px; max-height:400px;overflow:scroll;position:fixed; top:${args.top}px; left:${args.left+30}px;padding:3px;box-shadow: 0 0 5px black;background-color:rgb(18,20,20); color:grey;font-family: "Times New Roman", Times, serif; border-radius:7px;z-index:3;'></div>`);
        let div0 = $(`<div style='text-align:right;'></div>`);
        this.del = $(`<span style='cursor:pointer;'>X</span>`);
        div0.append(this.del);
        this.view.append(div0);
        this.host.append(this.view);
        this.del.click((e)=>{
           e.stopPropagation();
           this.destroy();
        });
        return this.view;
    }
    destroy(){
        if(this.view){
         this.view.remove();
            this.view = false;
        }
    }
    addSection(args){
      let section = $(`<div style='width:100%; ${args.on_click?"color:black;cursor:pointer;":"color:grey;"} background-color:inherit; margin-top:3px;'>${args.name}</div>`);
      this.view.append(section);
      if(args.on_click){
        section.click((e)=>{
            e.stopPropagation();
            args.on_click();
        });
      }
    }
}