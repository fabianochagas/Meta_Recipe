import Grid from "@mui/material/Grid";
import {Card, CardContent, CardHeader, IconButton} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {ResponsiveRadar} from "@nivo/radar";
import React from "react";
import { kMaxLength } from "buffer";

const SensoryChart:React.FC<any> = ({data, title,keys})=>{
    return (
        <Grid item xs={4}>
            <Card className='chart-card'>
                <CardHeader
                    className='chart-card-header'
                    action={
                        <IconButton aria-label="settings">
                            <MoreVertIcon/>
                        </IconButton>
                    }
                    title={title}
                />

                <CardContent className='chart-card-content'>
                    <ResponsiveRadar

                        data={data}
                        keys={keys}
                        indexBy="taste"
                        valueFormat=" >-.2f"
                        margin={{top: 10, right: 45, bottom: 50, left: 45}}
                        borderColor={{from: 'color'}}
                        gridLevels={7}
                        gridShape="linear"
                        gridLabelOffset={20}
                        dotSize={4}
                        dotColor={{from: 'color', modifiers: []}}
                        dotBorderWidth={3}
                        dotLabelYOffset={-13}
                        colors={{scheme: 'nivo'}}
                        blendMode="multiply"
                        motionConfig="wobbly"
                        legends={[
                            {
                                anchor: 'bottom',
                                direction: 'row',
                                translateX: -70,
                                translateY: -70,
                                itemWidth: 80,
                                itemHeight: 20,
                                itemTextColor: '#999',
                                symbolSize: 12,
                                symbolShape: 'circle',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemTextColor: '#000'
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                </CardContent>
            </Card>
        </Grid>
    );
}

export default SensoryChart;