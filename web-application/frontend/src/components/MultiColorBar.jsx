import React from 'react'
import './multiColorBar.css'
import { Box } from "@mui/material";

export default function MultiColorBar({readings}) {
  
  return (
    <div className="multicolor-bar">
      <div className="values">
        {Object.values(readings).map((item, i) => (
        <div className="value" style={{'color': item.color, 'width': item["percentage"] + '%'}}  key={i}>
          <span>{item["percentage"]}%</span>
        </div>
      ))}
      </div>
      <div className="scale">
        {Object.values(readings).map((item, i) => (
          <div className="graduation" style={{'color': item.color, 'width': item["percentage"] + '%'}}  key={i}>
            <span>|</span>
          </div>
        ))}
      </div>
      <Box className="bars">
        {Object.values(readings).map((item, i) => (
          <div className="bar" style={{'backgroundColor': item.color, 'width': item["percentage"] + '%'}}  key={i}/>
        ))}
      </Box>
      <Box className="legends">
        {Object.values(readings).map((item, i) => (
          <Box className="legend" key={i}>
            <span className="dot" style={{'color': item.color}}>●</span>
            <span className="label">{item["language_name"]}</span>
          </Box>
        ))}
      </Box>
    </div>
  );
}


