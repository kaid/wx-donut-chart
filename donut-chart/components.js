import reduce from 'lodash.reduce';

const stringToColor = str => {
  const hash = reduce(
    str,
    (result, _, i) => {
      const ihash = result + Math.pow(str.charCodeAt(i) * 31, str.length - i);
      return ihash & ihash;
    },
    0,
  );

  return {
    r: (hash & 0xFF0000) >> 16,
    g: (hash & 0x00FF00) >> 8,
    b: hash & 0x0000FF,
  };
}

const pointInSeries = ({ point, radius, innerRadius, startRadian, radian }) => {
  return false;
};

class Arc {
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

    return this;
  }
}

class Label {
  constructor({
    color,
    origin,
    radius,
    radian,
    length,
    context,
    text = '',
    startRadian,
    fontSize = 12,
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

    return this;
  }
}

class Series {
  constructor({ context, origin, radian, startRadian, label }) {
    const InnerRadius = 48;
    const InnerWidth = 8;

    const OuterWidth = 24;
    const SelectedWidth = 16;

    const { r, g, b } = stringToColor(label);
    const color = opacity => `rgba(${r}, ${g}, ${b}, ${opacity})`;

    const commonProps = {
      radian,
      origin,
      context,
      startRadian,
    };

    const Radius1 = InnerRadius + InnerWidth;

    this.innerArc = new Arc({
      ...commonProps,
      radius: Radius1,
      width: InnerWidth,
      color: color(1),
    });


    const Radius2 = Radius1 + OuterWidth;

    this.outerArc = new Arc({
      ...commonProps,
      radius: Radius2,
      color: color(0.8),
      width: OuterWidth,
    });

    this.label = new Label({
      ...commonProps,
      length: 8,
      text: label,
      startRadian,
      radius: Radius2,
      color: color(0.8),
    });
  }

  draw() {
    const { innerArc, outerArc, label } = this;

    innerArc.draw();
    outerArc.draw();
    label.draw();

    return this;
  }
}
// 坐标轴计算是x加，y减

export class DonutChart {
  constructor({ context, data, origin }) {
    const LabelShowThreshold = 4;

    this.data = data;
    this.origin = origin;
    this.context = context;
  }

  draw() {
    const { context, origin, data } = this;
    const sum = reduce(data, (result, { value = 0 }) => result + value, 0);

    const { seriesList } = reduce(
      data,
      ({ seriesList: sList, startRadian }, datum) => {
        const { value, label } = datum;
        const radian = (value * 1.0 / sum) * 2;

        const series = new Series({
          label,
          origin,
          radian,
          context,
          startRadian,
        });

        return {
          seriesList: [
            ...sList,
            series.draw(),
          ],
          startRadian: startRadian - radian,
        };
      },
      { seriesList: [], startRadian: 0 },
    );

    this.seriesList = seriesList;

    console.log(this);
    context.draw();

    return this;
  }
}
