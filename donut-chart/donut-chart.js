import { DonutChartRender } from './components';

const sysInfo = wx.getSystemInfoSync();

Component({
  properties: {
    chartId: String,
    chartWidth: {
      type: String,
      value: '100%',
    },
    chartHeight: {
      type: String,
      value: `${sysInfo.screenWidth}px`,
    },
  },

  lifetimes: {
    ready() {
      const { chartId } = this.data;

      this.chartRender = new DonutChartRender({
        chartId,
        drawInContext: this,
      });

      this.chartRender.draw();
    },
  },

  methods: {
    onTouchStart(e) {
      console.log(e);
    },
  },
});
