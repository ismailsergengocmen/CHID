import { useState, useEffect, useRef } from 'react';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Button, Box } from '@mui/material';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);
ChartJS.register(zoomPlugin);
ChartJS.register({
  id: 'uniqueid5', 
  afterDraw: function (chart, easing) {
    if (chart.tooltip._active && chart.tooltip._active.length) {
      const ctx = chart.ctx;
      ctx.save();
      const activePoint = chart.tooltip._active[0];
      
      ctx.beginPath();
      ctx.setLineDash([5,7]);
      ctx.moveTo(activePoint.element.x, chart.chartArea.top);
      ctx.lineTo(activePoint.element.x, activePoint.element.y);
      ctx.lineWdith = 2;
      ctx.strokeStyle = "gray";
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(activePoint.element.x, activePoint.element.y);
      ctx.lineTo(activePoint.element.x, chart.chartArea.bottom);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 99, 132, 1)";
      ctx.stroke();
      ctx.restore();
    }
  }
})

export default function LineChart({prInfos, filterSet}) {
  const chartRef = useRef(null)
  const [filteredPrInfo, setFilteredPrInfo] = useState({labels:[],datasets:[]})
  const [maxX, setMaxX] = useState(100)
  const [maxY, setMaxY] = useState(100)

  const resetZoom = () => {
    chartRef.current.resetZoom()
  }

  useEffect (() => {
    const calculateGraphInfo = async (prInfos) => {
      let temp = prInfos;
      
      if(filterSet.category && filterSet.category != ""){
        temp = temp.filter((prInfo) => prInfo[filterSet.measure + "Cat"] == filterSet.category);
      }
      
      if(filterSet.startDate && filterSet.startDate != "" && filterSet.startDate.$d != "Invalid Date"){
        temp = temp.filter((prInfo) => prInfo.day >= filterSet.startDate.toISOString());
      }

      if(filterSet.endDate && filterSet.endDate != "" && filterSet.endDate.$d != "Invalid Date"){
        temp = temp.filter((prInfo) => prInfo.day <= filterSet.endDate.toISOString());
      }

      if(filterSet.name && filterSet.name != "" && filterSet.role){
        if (filterSet.role == "author"){
          temp = temp.filter((prInfo) => prInfo[filterSet.role] == filterSet.name);
        }
        else{
          temp = temp.filter((prInfo) => prInfo[filterSet.role]?.includes(filterSet.name));
        }
      }

      const {label, labelAvg} = determineHeaders(filterSet.measure);

      const filteredData = {
        labels: temp.map((prInfo) => "PR - " + prInfo.number),
        datasets: [{
          label: label,
          data: temp.map((prInfo) => prInfo.infos[filterSet.measure]),
          borderColor: "black",
          pointBorderColor: "green",
          fill: true,
          tension: 0.4,
          pointHoverBorderColor: "white",
          pointHoverBackgroundColor:"rgba(255, 99, 132, 1)",
          pointBorderWidth: 2,
          pointHoverBorderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 8
        }, {
          label: labelAvg,
          data: temp.map((prInfo) => prInfo.infos[filterSet.measure + "Avg"]),
          borderColor: "grey",
          pointBorderColor: "aqua",
          fill: true,
          tension: 0.4,
        }]
      };

      const maxNumber = temp.reduce((max, pr) => (pr.number > max ? pr.number : max), 0);
      setFilteredPrInfo(filteredData);
      setMaxY(Math.max(filteredData.datasets[0].data) + 10)
      setMaxX(maxNumber)
      console.log("temp:", temp)
      console.log("max y:", Math.max(filteredData.datasets[0].data) + 10)
      console.log("max x:", maxNumber)
    }

    const determineHeaders = (measure) => {
      let label = "";
      let labelAvg = "";
      
      if (measure == "riskScore"){
        label = "Risk Score";
        labelAvg = "Risk Score Average";
      }
      else if(measure == "codeChurn"){
        label = "Code Churn";
        labelAvg = "Code Churn Average";
      }
      else if(measure == "bugFreq"){
        label = "Bug Frequency";
        labelAvg = "Bug Frequency Average";
      }
      else if(measure == "prSize"){
        label = "Pull Request Size";
        labelAvg = "Pull Request Size Average";
      }
      return {label, labelAvg};
    }

    calculateGraphInfo(prInfos);

  }, [prInfos, filterSet])

  const qualityGate = prInfos.map((prInfo) => prInfo.qualityGate);

  const changeHeader = (measure) => {
    if (measure == "riskScore"){
      return "Risk Score";
    }
    else if(measure == "codeChurn"){
      return "Code Churn";
    }
    else if(measure == "bugFreq"){
      return "Bug Frequency";
    }
    else if(measure == "prSize"){
      return "Pull Request Size";
    }
  }

  const options = {
    plugins: {
      legend: true,
      zoom: {
        pan: {
          // pan options and/or events
          enabled: true,
          mode: "x",
        },
        limits: {
          // axis limits
          x: {min: 0, max: maxX, minRange: 10},
          y: {min: 0, max: maxY, minRange: 10}
        },
        zoom: {
          // zoom options and/or events
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          pinch: {
            enabled: true
          },
          mode: "x",
        },
      },
      tooltip: {
        callbacks:{
          title: function(context) {
            return `${context[0].label}`
          },
          afterTitle: function() {
            return "============";
          },
          beforeFooter: function() {
            return "Quality Gate";
          },
          footer: function(context) {
            if(qualityGate[context[0].dataIndex] === 1) 
              return "Passed";
            else
              return "Failed";
          },
        },
        yAlign:"bottom",
        intersect: false,
        mode:"index",
      },
      tooltipLine: {
        beforeDraw: chart => {
          const ctx = chart.ctx;
        },
      }
    },
    scales: {
      x:{
        title: {
          display: true,
          text: "Pull Request"
        }
      },
      y:{
        title: {
          display: true,
          text: changeHeader(filterSet.measure)
        }
      }
    }
  }
  
  if(filteredPrInfo.labels && filteredPrInfo.labels.length > 0){
    return (
      <Box>
        <Box>
          <Line ref={chartRef} data={filteredPrInfo} options={options}/> 
        </Box>
        <Box display={"flex"} justifyContent={"center"} sx={{my:2}}>
          <Button onClick={resetZoom}> Reset Zoom </Button> 
        </Box>
      </Box>
    )
  }
  else{
    return (
      <div>
        <h1> No PR found with this filters </h1>
      </div>
    )
  }
}