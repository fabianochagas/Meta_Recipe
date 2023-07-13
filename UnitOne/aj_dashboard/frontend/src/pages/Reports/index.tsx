import {Box, Card, CardActions, CardContent, CardHeader, CardMedia, Collapse, IconButton} from "@mui/material";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TimelineDot from '@mui/lab/TimelineDot';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './partials/style.scss'
import ReportStatistics from "./components/statistics";
import Avatar from "@mui/material/Avatar";
import {ExpandMore} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useChartsData } from "./partials/charts";

import {ResponsiveRadar} from '@nivo/radar'
import {ResponsiveBullet} from '@nivo/bullet'
import ReportCharts from "./components/charts";
import ProductProcess from "./components/product-process";
import useBreadcrumb from "../../common/hooks/breadcrumbs";
import { ProjectType, ProtocolType } from "../../types/ModelTypes";
import ReportSensors from './components/sensors'

const colors = [
    '#FF6F67',
    '#FFAF68',
    '#66B2FE'
]


const Report: React.FC = () => {

    const { 
        project, 
        selectedProtocols,
        duration, 
        panelists, 
        chartData, 
        emouthData, 
        processData, 
        recipeData,
        nutritionData,
        textureData,
        textureScale
    } = useChartsData();

    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    /**
     * set the breadcrumbs of the current page
     * @author Amr
     */
    useBreadcrumb([
        {
            label: 'Reports',
            path: "/reports"
        }
    ]);

    return (
        <Box>
            {!!project ? (
                <>
                    <ReportStatistics 
                        selectedProject={project} 
                        selectedProtocols={selectedProtocols} 
                        duration={duration} 
                        panelists={panelists} 
                        colors={colors} 
                        />
                    <ReportCharts 
                        chartData={chartData} 
                        keys={selectedProtocols} 
                        emouthData={emouthData} 
                        recipeData={recipeData}
                        textureData={textureData}
                        textureScale={textureScale}
                        colors={colors} 
                        />
                        {/* <ReportSensors/> */}
                    <ProductProcess 
                        processData={processData} 
                        nutritionData={nutritionData}
                        />
                </>
            ) : (
                <p>Loading...</p>
            )}
            
        </Box>
    )
}

export default Report;