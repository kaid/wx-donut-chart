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
      const { chartId, data } = this.data;

      this.canvasContext = wx.createCanvasContext(chartId, this);

      new DonutChart({
        data,
        origin: this.getOrigin(),
        context: this.canvasContext,
      }).draw();
    },
  },

  methods: {
    getOrigin() {
      const { chartHeight, chartWidth } = this.data;

      return {
        x: chartWidth / 2,
        y: chartHeight / 2,
      };
    },

    onTouchStart({ touches: [{ x: relX, y: relY }] }) {
      const { chartHeight, chartWidth, data } = this.data;

      const origin = this.getOrigin();

      const point = {
        x: relX - origin.x,
        y: origin.y - relY,
      };

      this.canvasContext.clearRect(0, 0, chartWidth, chartHeight);

      new DonutChart({
        data,
        origin: this.getOrigin(),
        context: this.canvasContext,
        touch: point,
      }).draw();
    },
  },
});
