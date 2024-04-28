import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip } from 'chart.js'
import { Box } from '@mui/material'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip)

const commonStyles = {
  bgcolor: 'background.paper',
  borderColor: 'text.primary',
  m: 1,
  border: 1,
};

export default function BasicChart({chartInfo, filter}){
  const [data, setData] = useState({labels: [], datasets: [{}]})
  const [header, setHeader] = useState("Months")

  const changeLabel = (label) => {
    if (label === "Risk Score Average(%)") {
      return "Risk Score"
    } else if (label === "Highly Churned File Average(%)") {
      return "File Average(%)"
    } else if (label === "Highly Buggy File Average(%)") {
      return "File Average(%)"
    } else if (label === "Lines of Code Average") {
      return "Lines of Code"
    }
  }

  useEffect(() => {
    setData(chartInfo)

    if(filter == "years"){
      setHeader("Years")
    }
    else if(filter == "months"){
      setHeader("Months")
    }
    else if(filter == "weeks"){
      setHeader("Weeks")
    }
    else if(filter == "days"){
      setHeader("Days")
    }
  }, [chartInfo])

  const options = {
    plugins: {
      legend: true
    },
    scales: {
      x: {
        title: {
          display: true,
          text: header
        }
      },
      y: {
        title: {
          display: true,
          text: changeLabel(chartInfo.datasets[0].label)
        }
      }
    },
  }

  return (
    <Box sx={{...commonStyles, borderRadius: 1}}>
      <Line key={Math.random()} data={data} options={options}/>
    </Box>
  )
}
