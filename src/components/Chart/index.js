import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Chart from "react-google-charts";
import {
  Colors,
  ChartWrapper,
  ChartContainer,
  FloatingLabels,
  FloatingLabel,
} from "../Styling";
import { Devices, Break } from "../Responsive";

const StyledChart = styled(Chart)`
  height: 260px;

  @media ${Break.sm} {
    height: 260px;
  }
`;

export const Charts = (props) => {
  const [data, setData] = useState([]);
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    const loadChartData = async () => {
      if (!props.dataArray) return;

      const dataArray = [...props.dataArray];
      const processedLabels = [];
      let totalValue = 0;

      // Calculate total for percentages and angles
      for (let i = 1; i < dataArray.length; i++) {
        if (dataArray[i] && dataArray[i][1]) {
          totalValue += parseInt(dataArray[i][1], 10);
        }
      }

      let cumulativeAngle = -Math.PI / 2; // Start from top (-90 degrees)

      // Process each data point
      for (let i = 1; i < dataArray.length; i++) {
        if (dataArray[i] && dataArray[i][1]) {
          const value = parseInt(dataArray[i][1], 10);
          const originalLabel = dataArray[i][0];

          // Keep original label in chart data
          dataArray[i][0] = originalLabel;
          dataArray[i][1] = value;

          // Calculate angle for this segment (center of the slice)
          const segmentAngle = (value / totalValue) * 2 * Math.PI;
          const centerAngle = cumulativeAngle + segmentAngle / 2;

          processedLabels.push({
            label: `${originalLabel}: ${value} (${value}%)`,
            value: value,
            originalLabel: originalLabel,
            angle: centerAngle,
          });

          cumulativeAngle += segmentAngle;
        }
      }

      setData(dataArray);
      setProcessedData(processedLabels);
    };

    loadChartData();
  }, [props.dataArray]);

  // Configuración responsive
  const getChartOptions = () => {
    return {
      legend: {
        position: "none", // No legend - we use floating labels for both mobile and desktop
      },
      pieHole: 0.5,
      is3D: false,
      animation: {
        startup: true,
        easing: "linear",
        duration: 1000,
      },
      backgroundColor: "transparent",
      colors: [Colors.yellow, Colors.blue, Colors.red, Colors.green],
      tooltip: {
        trigger: "none",
      },
      pieSliceText: "none",
      chartArea: { left: 0, top: 0, width: "100%", height: "100%" },
      width: "100%",
      enableInteractivity: false,
    };
  };

  return (
    <ChartWrapper>
      <ChartContainer>
        <StyledChart
          chartType="PieChart"
          width="100%"
          data={data}
          options={getChartOptions()}
        />

        {/* Floating labels for both mobile and desktop */}
        {processedData.length > 0 && (
          <FloatingLabels>
            {processedData.map((item, index) => (
              <FloatingLabel key={index} angle={item.angle}>
                {item.label}
              </FloatingLabel>
            ))}
          </FloatingLabels>
        )}
      </ChartContainer>
    </ChartWrapper>
  );
};
