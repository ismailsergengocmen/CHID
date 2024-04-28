import QualityGate from "../components/QualityGate";
import Feedback from "../components/Feedback";
import Papers from "../components/Papers";
import { Grid, Box, } from "@mui/material";


const branchCardKeys = ["riskScore", "technicalDebt", "codeCov"];
const branchCardKeyCats = ["riskScoreCat", "technicalDebtCat", "codeCovCat"];
const branchCardTitles = ["Risk Score", "Technical Debt Analysis", "Code Coverage"];
const branchCardUnits = ["Risk",  "Debt", "Coverage"];

export default function BranchSummary({branchInfo}) {
  return(
    <>
      <Box sx={{ width: `calc(100% - 13%)`, ml: `13%`}}>
        <Box display="flex" justifyContent="space-around">
          <QualityGate qualityStatus = {branchInfo["isPassed"]}/>
          <Feedback />
        </Box>
        <Box sx={{width: 9/10, mt:15, ml: 8}}>
          <Papers 
              branchInfo={branchInfo} cardKeys={branchCardKeys} 
              cardKeyCats={branchCardKeyCats} cardTitles={branchCardTitles}
              cardUnits={branchCardUnits}/>
        </Box>
      </Box>
    </>
  )
}