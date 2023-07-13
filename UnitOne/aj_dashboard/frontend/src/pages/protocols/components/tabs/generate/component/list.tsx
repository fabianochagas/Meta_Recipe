import List from "@mui/material/List";
import { Box, Divider, ListItem, Stack } from "@mui/material";

import React, { useState,useEffect } from "react";
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { ClassNames } from "@emotion/react";
import ViewItme from "./view-item";
import ArrowLeftOutlinedIcon from '@mui/icons-material/ArrowLeftOutlined';
import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined';

const ListSensory: React.FC<any> = ({ items, name, newTitle,orgTitle, sensory,handleSensory }) => {
    const [copy, setCopy] = useState<boolean>(true)
    const [orgSensory, setOrgSensory] = useState<Array<any>>([]);
    const handelIncresing = (value:number,name:string,id:number)=>{
        value <= 10 && handleSensory(value,name,id)
         
    }
    const handelDecresing = (value:number,name:string,id:number)=>{
        value >= 0 && handleSensory(value,name,id)
    }

    useEffect(() => {
        copy && setOrgSensory([...sensory])
        setCopy(false)
      }, [sensory])

    return (
        <>
            <ListItem className="justify-center">{name}</ListItem>
            
            <List sx={{ maxHeight: 350, position: 'relative', overflow: 'auto', }}>
                <Grid container spacing={2} m={1}>
                    <Grid xs={10}>
                        <Box >
                            <Grid container>
                                <Grid xs={8} >
                                </Grid>
                                <Grid xs={4} className="generate-new-title">
                                     {newTitle}
                                </Grid>
                               
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid xs={2} className="generate-org-title">
                         {orgTitle}
                    </Grid>
                </Grid>
                {
                    items.map((item: any)=>{
                        let sValue= sensory?.length ? sensory?.find((s:any)=> s?.variable == item.name) : {}
                        let orgValue= orgSensory?.length ? orgSensory?.find((s:any)=> s?.variable == item.name) : {}
                        return(
                            <Grid container spacing={2} m={1}>
                            <Grid xs={10} className="generate-taste-items" style={{ background: `linear-gradient(90deg, rgba(255, 97, 102, 0.1) ${sValue.value*10}%, #FFF 0%)` }}>
                                <Box className="generate-taste-bg">
                                    <Grid container>
                                        <Grid xs={1} onClick={() => handelDecresing(sValue?.value-.5, item.name,sValue?.id)} className="generate-arrow">
                                        <ArrowLeftOutlinedIcon />
                                        </Grid>
                                        <Grid xs={7} className="generate-taste-name">
                                            {item.name}
                                        </Grid>
                                        <Grid xs={3} className="generate-taste-new-value">
                                            {sValue.value}
                                        </Grid>
                                        <Grid xs={1} onClick={() =>handelIncresing(sValue?.value+.5, item.name,sValue?.id)} className="generate-arrow">
                                        <ArrowRightOutlinedIcon />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                            <Grid xs={2}>
                                {orgValue.value}
                            </Grid>
                        </Grid>
                        )
                        

                    })
                }
                
            </List>
            
        </>
    );
}

export default ListSensory;