import List from "@mui/material/List";
import { Box, Divider, ListItem, Stack } from "@mui/material";
 
import React, { useState } from "react";
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
 import { ClassNames } from "@emotion/react";
 import CheckIcon from '@mui/icons-material/Check';
 import {useNavigator} from "../../../../../../common/routes";

const ViewItme: React.FC<any> = ({ name, value,protocol_id,isCheckd }) => {
    const [open, setOpen] = useState<boolean>(false)
    const {navigator} = useNavigator()

    const viewProtocole = () =>{
        navigator('/protocols/'+protocol_id);
    }
  
     return (
        <Grid container spacing={2} m={1} height={30} onClick={viewProtocole}>
            <Grid xs={1}>
                 {isCheckd && <CheckIcon/>}
            </Grid>
            <Grid xs={7} className="protocol_name"  >
               {name} 
            </Grid>
            <Grid xs={4}>
                {value}   
            </Grid>
        </Grid>
    );
}

export default ViewItme;