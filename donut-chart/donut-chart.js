import { DonutChart } from './components';

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
      const { chartId, chartHeight, chartWidth } = this.data;

      this.canvasContext = wx.createCanvasContext(chartId, this);

      const data = [
        { value: 12345, label: '一出好戏' },
        { value: 23456, label: '复仇者联盟4' },
        { value: 13579, label: '大侦探皮卡丘' },
      ];

      const origin = {
        x: chartWidth / 2,
        y: chartHeight / 2,
      };

      const chartRender = new DonutChart({
        data,
        origin,
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
