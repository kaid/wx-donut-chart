const app = getApp()

class ArcRenderer {
  constructor({ color, context, arc, startArc, radius, width, origin = { x: 0, y: 0 } }) {
    this.context = context;
    this.origin = origin;
    this.color = color;

    this.radius = radius;
    this.innerRadius = radius - width;

    this.arc = arc;
    this.startArc = startArc * Math.PI;
    this.endArc = (startArc + arc) * Math.PI;
  }

  draw() {
    const {
      context,
      origin,
      color,
      radius,
      innerRadius,
      startArc,
      endArc,
    } = this;

    context.beginPath();
    context.setFillStyle(color);
    context.arc(origin.x, origin.y, radius, startArc, endArc, false);
    context.arc(origin.x, origin.y, innerRadius, endArc, startArc, true);
    context.fill();
  }
}

class LabelRenderer {
  constructor({ context, origin, radius, startArc, arc, length, color }) {
    this.context = context;
    this.color = color;
    this.radius = radius;

    this.labelArc = (startArc - arc / 2) * Math.PI; // 坐标系里角度

    const sinArc = Math.sin(this.labelArc);
    const cosArc = Math.cos(this.labelArc);
    console.log(this.labelArc, sinArc, cosArc);

    this.startPoint = {
      x: origin.x - sinArc * radius,
      y: origin.y + cosArc * radius,
    };

    const { x: startX, y: startY } = this.startPoint;

    this.middlePoint = {
      x: startX - sinArc * length,
      y: startY + cosArc * length,
    };

    const { x: middleX, y: middleY } = this.middlePoint;

    this.endPoint = {
      x: middleX + (middleX > origin.x ? length : -length),
      y: middleY,
    };
  }

  draw() {
    const {
      context,
      color,
      startPoint,
      middlePoint,
      endPoint,
    } = this;

    context.beginPath()
    context.setStrokeStyle(color);
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(middlePoint.x, middlePoint.y);
    context.lineTo(endPoint.x, endPoint.y);
    context.stroke();
  }
}

// 坐标轴计算是x加，y减

class DonutChart {
}

Page({
  data: {

  },
  onLoad: function () {
    const ctx = wx.createCanvasContext('canvas', this);
    const arc = new ArcRenderer({
      color: 'red',
      context: ctx,
      origin: { x: 100, y: 75 },
      radius: 50,
      width: 25,
      startArc: 0,
      arc: 1.5,
    })

    const label = new LabelRenderer({
      color: 'green',
      context: ctx,
      origin: { x: 100, y: 75 },
      radius: 50,
      length: 8,
      startArc: 0,
      arc: 1.5,
    });

    arc.draw();
    label.draw();


    // ctx.beginPath()
    // ctx.moveTo(40, 75)
    // ctx.lineTo(160, 75)
    // ctx.moveTo(100, 15)
    // ctx.lineTo(100, 135)
    // ctx.setStrokeStyle('#AAAAAA')
    // ctx.stroke()
    //   
    // ctx.setFontSize(12)
    // ctx.setFillStyle('black')
    // ctx.fillText('0', 165, 78)
    // ctx.fillText('0.5*PI', 83, 145)
    // ctx.fillText('1*PI', 15, 78)
    // ctx.fillText('1.5*PI', 83, 10)
    //   
    // Draw points
    // ctx.beginPath()
    // ctx.arc(100, 75, 2, 0, 2 * Math.PI)
    // ctx.setFillStyle('lightgreen')
    // ctx.fill()
    //   
    // ctx.beginPath()
    // ctx.arc(100, 25, 2, 0, 2 * Math.PI)
    // ctx.setFillStyle('blue')
    // ctx.fill()
    //   
    // ctx.beginPath()
    // ctx.arc(150, 75, 2, 0, 2 * Math.PI)
    // ctx.setFillStyle('red')
    // ctx.fill()
    //   
    // // Draw arc
    // ctx.beginPath()
    // ctx.arc(100, 75, 50, 0, 1.5 * Math.PI)
    // ctx.setStrokeStyle('#333333')
    // ctx.stroke()

    ctx.draw()

  },
})
