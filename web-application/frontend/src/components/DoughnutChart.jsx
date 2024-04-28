import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Box } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  plugins: {
    uniqueid5: false
  },
};

export default function DoughnutChart({doughnutChartData, riskScoreInfo}) {

  const textCenter = {
    id: "textCenter",
    beforeDatasetsDraw(chart, args, pluginOptions) {
      const { ctx, data } = chart;
      ctx.save();
      ctx.font = "bolder 30px sans-serif";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        riskScoreInfo.riskScore,
        chart.getDatasetMeta(0).data[0].x,
        chart.getDatasetMeta(0).data[0].y
      );
      ctx.restore();
    }
  };

  return (
    <Box display="flex" flexDirection="row" justifyContent="center" sx={{width: "60%"}}>
      <Box sx={{width: 400, height: "auto", mr: 4}}>
        <Doughnut
          data={doughnutChartData}
          options={options}
          plugins={[textCenter]}
        ></Doughnut>
      </Box>
    </Box>
  );
}
