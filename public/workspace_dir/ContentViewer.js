class ContentViewer{
    constructor(args){
        this.data = args.data;
        this.height = args.height ? args.height : 500;
        this.width = args.width ? args.width : "100%";
        this.host = args.host;
        this.cEvents = {};
        this.link = args.link;
        this.styles = {
          subtitles: "color:grey; font-size:0.7em;"
        };
        if (args.theme && args.theme === "white") {
          this.styles.objects = "color:black; font-size:0.7em;";
        }
        this.main_view = $(
          `<div style='width:${this.width}; height:${this.height}px; display:flex; flex-direction:column;'></div>`
        );
        this.tools_div = $(`<div style='width:100%;height:30px;'></div>`);
        this.range = $(`<input type="range" name="points" min="3" max="16">`);
        this.tools_div.append(this.range);
        this.display_area = $(
          `<div style='width:100%;height:${this.height -
            30}px; overflow:scroll;'></div>`
        );
        this.main_view.append(this.tools_div, this.display_area);
        this.host.append(this.main_view);
        this.range.on("input", par => {
          if (this.cEvents["on_range"]) {
            this.cEvents["on_range"](this.range.val());
          }
        });
        this.init();
    }
    onEvent(what, that) {
        this.cEvents[what] = that;
    }
    init() {
        this.textarea = $(
          `<textarea  style='width:100%; height:100%; border:none;background-color:rgb(5,7,7); color:grey;'></textarea>`
        );
        this.textarea.val(this.data);
        this.onEvent("on_range", value => {
            this.textarea[0].style.fontSize = `${value}px`;
        });
        this.display_area.append(this.textarea);
      }
}