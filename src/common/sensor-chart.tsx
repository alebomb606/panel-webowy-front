import React, { useEffect, useState } from 'react';

import SVG from 'svg.js';
import { Sensor } from '../sensors/reducer';

interface ChartProps {
  size: number;
  sensor: Sensor;
  chartOptions: { [key in string]: string };
}

const getChartColor = (color: string) => {
  return color ? color : 'rgba(242,242,242,0.85)';
};

const formatLabelText = (value: string | number, unit: string, defaultLabel: string) => {
  return value !== null && value !== undefined ? `${value}${unit}` : defaultLabel.replace(/\s+/g, ' ').split(' ');
};

const getLabelText = (formattedText: string | string[]) => (add: SVG.Tspan | SVG.Text) => {
  if (typeof formattedText === 'string') {
    add.tspan(formattedText).newLine();
  } else {
    formattedText.forEach(word => {
      add.tspan(word).newLine();
    });
  }
};

const getTextY = (formattedText: string | string[], size: number, textFontSize: number) => {
  if (typeof formattedText === 'string') {
    const position = (size - textFontSize) / 2;
    return position;
  } else {
    const position = (size - formattedText.length * (1.25 * textFontSize)) / 2;
    return position;
  }
};

const calculateCircumference = (size: number) => {
  const sizeWithoutPadding = size - 10;
  const chartThickness = (0.275 * sizeWithoutPadding) / 2.275;
  const diameter = sizeWithoutPadding - chartThickness;
  const radius = diameter / 2;
  return 2 * Math.PI * radius;
};

const calculateTextFontSize = (size: number) => {
  const sizeWithoutPadding = size - 10;
  const chartThickness = (0.275 * sizeWithoutPadding) / 2.275;
  return chartThickness * 1.5;
};

export default function NewChart({ size, sensor, chartOptions }: ChartProps) {
  const [chart, setChart] = useState<SVG.Path | null>(null);
  const [chartLabel, setChartLabel] = useState<SVG.Text | null>(null);
  const [circumference, setCircumference] = useState(calculateCircumference(size));
  const [textFontSize, setTextFontSize] = useState(calculateTextFontSize(size));

  const updateChart = () => {
    if (!chart || !chartLabel) {
      return null;
    }
    chart.stop(false, true);
    const currentColor = getChartColor(chartOptions.color);
    const currentTextLabel = formatLabelText(sensor.value, chartOptions.unit, chartOptions.defaultLabel);
    const currentTextY = getTextY(currentTextLabel, size, textFontSize);
    const currentPercentageValue = (sensor.percentage * circumference) / 100;
    chart.stroke(currentColor);
    chartLabel.text(getLabelText(currentTextLabel));
    chartLabel.y(currentTextY);
    chart.animate(500, '>', 0).attr({ 'stroke-dasharray': [currentPercentageValue, circumference] });
    return null;
  };

  const drawChart = () => {
    const { id, percentage, value } = sensor;
    const { unit, defaultLabel, color } = chartOptions;
    const chartThickness = (0.275 * (size - 10)) / 2.275;
    const diameter = size - 10 - chartThickness;
    const radius = diameter / 2;
    setCircumference(2 * Math.PI * radius);
    const x = size / 2;
    const y = (size - diameter) / 2;
    const percentageValue = (percentage * circumference) / 100;

    let pathD = `M${x} ${y} a ${radius} ${radius} 0 0 1 0 ${diameter} a ${radius} ${radius} 0 0 1 0 -${diameter}`;
    let backgroundPathFill = { color: 'none', opacity: 1 };
    let backgroundPathStroke = {
      color: 'rgba(242,242,242,0.85)',
      width: chartThickness,
      opacity: 1,
      linecap: 'butt',
      dasharray: '0',
    };
    let pathFill = { color: 'none', opacity: 0.85 };
    let pathStroke = {
      color: getChartColor(color),
      width: chartThickness,
      opacity: 1,
      linecap: 'butt',
      dasharray: `0, ${circumference}`,
    };
    let textLabel = formatLabelText(value, unit, defaultLabel);
    setTextFontSize(chartThickness * 1.5);
    let textY = getTextY(textLabel, size, textFontSize);
    let textFont = { family: 'Helvetica', size: `${textFontSize}`, anchor: 'middle' };
    let textFill = { color: '#373d3f', opacity: 1 };

    let chartWrapper = SVG(id).size(size, size);

    chartWrapper
      .path(pathD)
      .fill(backgroundPathFill)
      .stroke(backgroundPathStroke);

    const chart = chartWrapper
      .path(pathD)
      .fill(pathFill)
      .stroke(pathStroke);

    chart.animate(500, '>', 0).attr({ 'stroke-dasharray': [percentageValue, circumference] });

    setChart(chart);

    const chartLabel = chartWrapper
      .text(getLabelText(textLabel))
      .font(textFont)
      .fill(textFill)
      .x(x)
      .y(textY);

    setChartLabel(chartLabel);
  };

  useEffect(() => {
    if (SVG.supported) {
      drawChart();
    }
  }, []);

  useEffect(() => {
    updateChart();
  }, [sensor, chartOptions]);

  return <div id={sensor.id} />;
}
