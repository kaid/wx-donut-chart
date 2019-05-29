import { DonutChartRender } from './components';

const sysInfo = wx.getSystemInfoSync();

Component({
  properties: {
    chartId: String,
    data: {
      type: Array,
      value: [],
    },
    chartWidth: {
      type: Number,
      value: sysInfo.screenWidth,
    },
    chartHeight: {
      type: Number,
      value: sysInfo.screenWidth,
    },
  },

  lifetimes: {
    ready() {
      const { chartId, data, chartWidth, chartHeight } = this.data;
      this.canvasContext = wx.createCanvasContext(chartId, this);

      console.log(this.canvasContext);
      const chartRender = new DonutChartRender({
        data,
        context: this.canvasContext,
      });

      chartRender.draw();
    },
  },

  methods: {
    onTouchStart(e) {
      console.log(e);
    },
  },
});
