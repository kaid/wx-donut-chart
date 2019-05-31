import { DonutChart, pointInSeries } from './components';

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
      const { chartId } = this.data;

      this.canvasContext = wx.createCanvasContext(chartId, this);

      const data = [
        { value: 12345, label: '不过是只小狗' },
        { value: 23456, label: '犹豫，就会败北' },
        { value: 18181, label: '我，曾见过修罗' },
        { value: 4560, label: '有死之荣，无生之辱' },
        { value: 11111, label: '苇名剑法是无敌的' },
        { value: 8888, label: '罗伯特' },
      ];

      const chartRender = new DonutChart({
        data,
        origin: this.getOrigin(),
        context: this.canvasContext,
      });

      chartRender.draw();
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
      const { chartHeight, chartWidth } = this.data;

      const origin = this.getOrigin();

      const point = {
        x: relX - origin.x,
        y: origin.y - relY,
      };

      this.canvasContext.clearRect(0, 0, chartWidth, chartHeight);

      const data = [
        { value: 12345, label: '不过是只小狗' },
        { value: 23456, label: '犹豫，就会败北' },
        { value: 18181, label: '我，曾见过修罗' },
        { value: 4560, label: '有死之荣，无生之辱' },
        { value: 11111, label: '苇名剑法是无敌的' },
        { value: 8888, label: '罗伯特' },
      ];

      new DonutChart({
        data,
        origin: this.getOrigin(),
        context: this.canvasContext,
        touch: point,
      }).draw();
    },
  },
});
