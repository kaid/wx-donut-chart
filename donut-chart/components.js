import each from 'lodash.foreach';
import reduce from 'lodash.reduce';

const InnerRadius = 48;
const InnerWidth = 8;

const OuterWidth = 24;
const SelectedWidth = 8;

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

const pointQuadrant = ({ x, y }) => {
  if (x >= 0 && y >= 0) {
    return 1;
  }

  if (x < 0 && y >= 0) {
    return 2;
  }

  if (x < 0 && y < 0) {
    return 3;
  }

  return 4;
};

const pointRadianValues = absPointRadian => quadrant => ({
  1: () => absPointRadian - 2 * Math.PI,
  2: () => - (Math.PI + absPointRadian),
  3: () => - (Math.PI - absPointRadian),
  4: () => - absPointRadian,
})[quadrant]();

const pointInSeries = ({ point, outerRadius, innerRadius, startRadian, endRadian }) => {
  const { x, y } = point;

  const pointRadius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  const absPointRadian = Math.abs(Math.atan(y / x));
  const pointRadian = pointRadianValues(absPointRadian)(pointQuadrant(point));

  const isRadiusInRange = pointRadius >= innerRadius && pointRadius <= outerRadius;
  const isRadianInRange = pointRadian >= endRadian && pointRadian <= startRadian;

  return isRadiusInRange && isRadianInRange;
};

class Arc {
  constructor({ context, radius, color, startRadian, endRadian, width, origin }) {
    this.color = color;
    this.origin = origin;
    this.context = context;

    this.radius = radius;
    this.innerRadius = radius - width;

    this.startRadian = startRadian;
    this.endRadian = endRadian;
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
    context.arc(origin.x, origin.y, innerRadius, -startRadian, -endRadian, false);
    context.arc(origin.x, origin.y, radius, -endRadian, -startRadian, true);
    context.fill();

    return this;
  }
}

class Label {
  constructor({
    color,
    extra,
    origin,
    radius,
    length,
    context,
    text = '',
    labelRadian,
    fontSize = 10,
  }) {
    this.text = text;
    this.extra = extra;
    this.color = color;
    this.origin = origin;
    this.context = context;
    this.fontSize = fontSize;
    this.labelRadian = labelRadian; // 坐标系里角度

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
  }

  draw() {
    const {
      text,
      extra,
      color,
      origin,
      context,
      endPoint,
      fontSize,
      startPoint,
      middlePoint,
    } = this;

    const textPadding = 2;

    context.beginPath();
    context.setFontSize(fontSize);

    const { x: originX } = origin;
    const { x: endX, y: endY } = endPoint;
    const textContentWidth = context.measureText(text).width + textPadding;

    const textStartPoint = {
      x: endX < originX ? endX - textContentWidth : endX + textPadding,
      y: endY - textPadding,
    };

    context.setLineCap('round');
    context.setLineJoin('round');
    context.setStrokeStyle(color);

    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(middlePoint.x, middlePoint.y);
    context.lineTo(endPoint.x, endPoint.y);
    context.fillText(text, textStartPoint.x, textStartPoint.y)
    context.stroke();

    context.setFontSize(8);
    const extraWidth = context.measureText(extra).width + textPadding;

    context.setFillStyle('#888888');
    context.fillText(
      extra,
      endX < originX ? endX - extraWidth : endX + textPadding,
      endY + 8 + textPadding,
    );

    return this;
  }
}

class Series {
  constructor({ context, ratio, origin, startRadian, endRadian, label, selected }) {
    this.origin = origin;
    this.context = context;
    this.labelText = label;
    this.selected = selected;
    this.ratio = `${((ratio || 0) * 100).toFixed(1)}%`;
    this.labelExtra = `场次占比${this.ratio}`;

    const commonProps = {
      origin,
      context,
    };

    const Radius1 = InnerRadius + InnerWidth;

    this.innerArc = new Arc({
      ...commonProps,
      endRadian,
      startRadian,
      radius: Radius1,
      width: InnerWidth,
      color: this.color(1),
    });

    const Radius2 = Radius1 + OuterWidth;

    this.outerArc = new Arc({
      ...commonProps,
      endRadian,
      startRadian,
      radius: Radius2,
      color: this.color(0.8),
      width: OuterWidth,
    });

    this.label = new Label({
      ...commonProps,
      radius: Radius2,
      text: this.labelText,
      color: this.color(1),
      extra: this.labelExtra,
      length: selected ? 16 : 10,
      labelRadian: (startRadian + endRadian) / 2,
    });

    const Radius3 = Radius2 + SelectedWidth;

    this.selectedArc = new Arc({
      ...commonProps,
      endRadian,
      startRadian,
      radius: Radius3,
      color: this.color(0.4),
      width: SelectedWidth,
    });
  }

  color(opacity) {
    const { r, g, b } = stringToColor(this.labelText);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  drawSelectedText() {
    const { origin, context, ratio, labelText } = this;

    context.beginPath();
    context.setFontSize(20);

    const ratioColor = this.color(1);
    const ratioTextWidth = context.measureText(ratio).width;
    const { x: originX, y: originY } = origin;
    const textStartPoint = {
      x: originX - ratioTextWidth / 2,
      y: originY - 6,
    };

    context.setFillStyle(ratioColor)
    context.setStrokeStyle(ratioColor);
    context.fillText(ratio, textStartPoint.x, textStartPoint.y);
    context.strokeText(ratio, textStartPoint.x, textStartPoint.y)

    context.setFontSize(10);

    const labelTextWidth = context.measureText(labelText).width;
    const labelTextPoint = {
      x: originX - labelTextWidth / 2,
      y: originY + 16,
    };

    context.setFillStyle('#888888');
    context.fillText(labelText, labelTextPoint.x, labelTextPoint.y);
  }


  draw() {
    const { innerArc, outerArc, selectedArc, label, selected } = this;

    innerArc.draw();
    outerArc.draw();
    label.draw();

    if (selected) {
      selectedArc.draw();
      this.drawSelectedText();
    }

    return this;
  }
}
// 坐标轴计算是x加，y减

export class DonutChart {
  constructor({ context, data, origin, touch = { x: 0, y: 0 } }) {
    const LabelShowThreshold = 4;

    this.data = data;
    this.origin = origin;
    this.context = context;

    const sum = reduce(data, (result, { value = 0 }) => result + value, 0);

    const { seriesList } = reduce(
      data,
      ({ seriesList: sList, startRadian }, datum) => {
        const { value, label } = datum;
        const ratio = value * 1.0 / sum;
        const radian = ratio * 2 * Math.PI;
        const endRadian = startRadian - radian;

        const series = new Series({
          label,
          ratio,
          origin,
          context,
          endRadian,
          startRadian,
          selected: pointInSeries({
            endRadian,
            startRadian,
            point: touch,
            innerRadius: InnerRadius,
            outerRadius: InnerRadius + InnerWidth + OuterWidth,
          }),
        });

        return {
          seriesList: [
            ...sList,
            series,
          ],
          startRadian: endRadian,
        };
      },
      { seriesList: [], startRadian: 0 },
    );

    this.seriesList = seriesList;
  }

  draw() {
    const { context, seriesList = [] } = this;

    each(seriesList, series => series.draw());

    context.draw();

    return this;
  }
}
