import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import Chart from "react-google-charts";

const ChartContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const labelCustom = styled.div`
  font-family: "Lato";
  font-size: 5px;
  color: red;
`;

export const Charts = (props) => {
  const [data, setData] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadChartData = async () => {
      if (!props.dataArray) return;

      const dataArray = [...props.dataArray]; // Create a copy to avoid mutating props

      // Convert string numbers to integers and add percentage to labels
      for (let i = 1; i < dataArray.length; i++) {
        if (dataArray[i] && dataArray[i][1]) {
          const value = parseInt(dataArray[i][1], 10);
          dataArray[i][1] = value;
          // Add percentage to the label
          dataArray[i][0] = `${dataArray[i][0]} (${value}%)`;
        }
      }

      setData(dataArray);
    };

    loadChartData();
  }, [props.dataArray]);

  // Configuración responsive
  const getChartOptions = () => {
    if (isMobile) {
      return {
        legend: {
          position: 'bottom',
          textStyle: {
            fontSize: 10,
            color: '#000000'
          },
          maxLines: 5,
          alignment: 'center'
        },
        pieHole: 0.5,
        is3D: false,
        animation: {
          startup: true,
          easing: "linear",
          duration: 1000,
        },
        backgroundColor: 'transparent',
        colors: ['#FFB718', '#0084FF', '#CD0000', '#23C520'],
        tooltip: {
          trigger: 'none'
        },
        pieSliceText: 'none',
        chartArea: {
          left: '10%',
          top: '5%',
          width: '80%',
          height: '70%'
        },
        width: '100%',
        enableInteractivity: false
      };
    } else {
      return {
        legend: {
          position: 'right',
          textStyle: {
            fontSize: 12,
            color: '#000000'
          },
          maxLines: 10,
          alignment: 'start' // Cambiado de 'center' a 'start'
        },
        pieHole: 0.5,
        is3D: false,
        animation: {
          startup: true,
          easing: "linear",
          duration: 1000,
        },
        backgroundColor: 'transparent',
        colors: ['#FFB718', '#0084FF', '#CD0000', '#23C520'],
        tooltip: {
          trigger: 'none'
        },
        pieSliceText: 'none',
        chartArea: {
          left: '5%',
          top: '5%',
          width: '65%', // Incrementado de 55% a 65%
          height: '85%'
        },
        width: '100%',
        enableInteractivity: false
      };
    }
  };

  return (
    <ChartContainer>
      <Chart
        chartType="PieChart"
        width="100%"
        height={isMobile ? "400px" : "350px"}
        data={data}
        options={getChartOptions()}
      />
    </ChartContainer>
  );
};