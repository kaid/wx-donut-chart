const pointInSeries = ({ point, radius, innerRadius, startRadian, radian }) => {
  return false;
};

class ArcRenderer {
  constructor({ context, color, radian, startRadian, radius, width, origin }) {
    this.color = color;
    this.origin = origin;
    this.context = context;

    this.radius = radius;
    this.innerRadius = radius - width;

    this.radian = radian;
    this.startRadian = - startRadian * Math.PI;
    this.endRadian = - (startRadian - radian) * Math.PI;
  }

  draw() {
    const {
      color,
      radius,
      origin,
      context,
      endRadian,
      innerRadius,
      startRadian,
    } = this;

    context.beginPath();
    context.setFillStyle(color);
    context.arc(origin.x, origin.y, innerRadius, startRadian, endRadian, false);
    context.arc(origin.x, origin.y, radius, endRadian, startRadian, true);
    context.fill();
  }
}

class LabelRenderer {
  constructor({
    color,
    origin,
    radius,
    radian,
    length,
    context,
    text = '',
    startRadian,
    fontSize = 14,
  }) {
    const textPadding = 2;

    this.text = text;
    this.color = color;
    this.context = context;
    this.fontSize = fontSize;
    this.labelRadian = (startRadian - radian / 2) * Math.PI; // 坐标系里角度

    const sinRadian = Math.sin(this.labelRadian); // y ratio
    const cosRadian = Math.cos(this.labelRadian); // x ratio

    const { x: originX, y: originY } = origin;

    this.startPoint = {
      x: originX + cosRadian * radius,
      y: originY - sinRadian * radius,
    };

    const { x: startX, y: startY } = this.startPoint;

    this.middlePoint = {
      x: startX + cosRadian * length,
      y: startY - sinRadian * length,
    };

    const { x: middleX, y: middleY } = this.middlePoint;

    this.endPoint = {
      x: middleX + (middleX > originX ? length : -length),
      y: middleY,
    };

    const { x: endPointX, y: endPointY } = this.endPoint;

    context.setFontSize(fontSize);
    const textContentWidth = context.measureText(text).width + textPadding;

    this.textStartPoint = {
      x: endPointX < originX ? endPointX - textContentWidth : endPointX + textPadding,
      y: endPointY - textPadding, // endPointY - textPadding,
    };
  }

  draw() {
    const {
      text,
      color,
      context,
      endPoint,
      startPoint,
      middlePoint,
      textStartPoint,
    } = this;

    context.beginPath()
    context.setStrokeStyle(color);
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(middlePoint.x, middlePoint.y);
    context.lineTo(endPoint.x, endPoint.y);
    context.fillText(text, textStartPoint.x, textStartPoint.y)
    context.stroke();
  }
}

// 坐标轴计算是x加，y减

export class DonutChartRender {
  constructor({ context, data, origin }) {
    const LabelShowThreshold = 4;

    this.data = data;
    this.context = context;
  }

  draw() {
    const { context } = this;
    const radius = 50;
    const color = 'purple';
    const radian = 1.6;
    const startRadian = 0.4;
    const origin = { x: 100, y: 100 }
    const arc = new ArcRenderer({
      color,
      origin,
      radius,
      radian,
      context,
      width: 25,
      startRadian,
    })

    const label = new LabelRenderer({
      color,
      origin,
      radian,
      radius,
      context,
      length: 12,
      startRadian,
      text: 'haha你好',
    });

    arc.draw();
    label.draw();
    context.draw();
  }
}
