class CsvViewer {
    constructor(args) {
      this.data = args.data;
      this.height = args.height ? args.height : 500;
      this.width = args.width ? args.width : "100%";
      this.host = args.host;
      this.last_data_idx = 0;
      this.start_at1 = true;
      this.border_color = "lightgrey";
      this.cEvents = {};
      this.table_color = {
        background: "rgb(18,20,20)",
        color: "grey",
        border: "black"
      };
      this.headSticky = {
        background: "rgb(38,40,40)",
        color: "grey",
        border: "black"
      };
      this.styles = {
        subtitles: "color:grey; font-size:0.7em;"
      };
      if (args.theme && args.theme === "white") {
        this.styles.objects = "color:black; font-size:0.7em;";
      }
      this.main_view = $(
        `<div style='width:${this.width}px; height:${this.height}px; display:flex; flex-direction:column;background-color:white; color:black;position:relative;'></div>`
      );
      this.tools_div = $(`<div style='width:100%;height:30px;'></div>`);
      this.range = $(`<input type="range" name="points" min="3" max="16">`);
      this.tools_div.append(this.range);
      this.display_area2 = $(
        `<div style='width:100%;height:${this.height -
          30}px; overflow:scroll;padding:0px; margin:0px;position:relative;'></div>`
      );
  
      this.main_view.append(this.tools_div, this.display_area2);
      this.table = $(
        `<table style='padding:0px; margin:0px;border-collapse: collapse;width:100%;position:relative;background-color:${this.table_color.background};'></table>`
      );
      this.display_area2.append(this.table);
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
    showLoading(args) {
      if (args) {
        if (this.loading_sign) {
          this.loading_sign.show();
        } else {
          this.loading_sign = $(
            `<div style='width:100%; height:30px; position:absolute; bottom:0px;left:0px; text-align:center; background:rgba(100,100,100,0.5);'>Loading moore...</div>`
          );
          this.main_view.append(this.loading_sign);
        }
      } else {
        if (this.loading_sign) {
          this.loading_sign.hide();
        }
      }
    }
    showHeader(args) {
      let header_data = args.data ? args.data : false;
      let limit = args.limit;
      let tr = $(
        `<tr class='columns' style='border:none;font-size:${
          this.current_size ? this.current_size : "8px"
        };'></tr>`
      );
      let blank_row = $(
        `<th class='rows headers' style='position: sticky; top: 0;left:0;text-align:center;border:1px solid  ${this.headSticky.border};font-size:inherit; color:grey;background-color:rgb(18,20,20);z-index:4;'></th>`
      );
      tr.append(blank_row);
      for (let i = 0; i < limit; i++) {
        (i => {
          let row = $(
            `<th class='rows headers' style='position: sticky; top: 0;text-align:center;border:1px solid ${
              this.headSticky.border
            };font-size:inherit; color:${
              this.headSticky.color
            };background-color:${this.headSticky.background};z-index:3;'>${
              header_data ? header_data[i] : this.start_at1 ? i + 1 : i
            }</th>`
          );
          tr.append(row);
        })(i);
      }
      this.table.append(tr);
    }
    showOne(args) {
      let data = this.data[args.idx];
      let tr = $(
        `<tr class='columns' style='border:none;font-size:${
          this.current_size ? this.current_size : "8px"
        };z-index:1;'></tr>`
      );
      let idx = $(
        `<td class='rows' style='position: sticky; left: 0;text-align:center;border:1px solid ${
          this.headSticky.border
        };font-size:inherit; background-color:${
          this.headSticky.background
        }; color:${this.headSticky.color};z-index:2;'>${
          this.start_at1 ? args.idx + 1 : args.idx
        }</td>`
      );
      tr.append(idx);
      for (let i = 0; i < data.length; i++) {
        (i => {
          let row = $(
            `<td class='rows' style=' text-align:left; border:1px solid ${this.headSticky.border};font-size:inherit;color:${this.table_color.color};white-space:nowrap;'>${data[i]}</td>`
          );
          tr.append(row);
        })(i);
      }
      this.table.append(tr);
      this.last_column = tr;
    }
    reachBottom() {
      if (!this.displayed_all) {
        this.fecthMore();
      }
    }
    fecthMore() {
      this.showLoading(true);
      setTimeout(() => {
        let limit = this.last_data_idx + 1 + 100;
        for (let i = this.last_data_idx + 1; i < limit; i++) {
          if (this.data[i]) {
            this.last_data_idx = i;
            this.showOne({ idx: i });
          } else {
            console.log(`broke at ${i}`);
            this.displayed_all = true;
            break;
          }
        }
        this.showLoading(false);
      }, 0);
    }
    init() {
      this.last_data_idx = -1;
      this.showHeader({ data: this.data[0], limit: this.data[0].length });
      this.fecthMore();
      this.onEvent("on_range", value => {
        this.current_size = `${value}px`;
        this.display_area2.find(".columns").css({ "font-size": `${value}px` });
      });
  
      this.display_area2.on("scroll", e => {
        console.log(
          Math.ceil(this.display_area2[0].scrollTop),
          this.display_area2[0].scrollHeight - this.display_area2[0].clientHeight,
          "yyyy",
          this.display_area2[0].scrollLeft
        );
        if (
          Math.ceil(this.display_area2[0].scrollTop) >=
          this.display_area2[0].scrollHeight - this.display_area2[0].clientHeight
        ) {
          this.reachBottom();
        }
      });
    }
  }
  