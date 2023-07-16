import List from "@mui/material/List";
import { Button, Divider, ListItem, Stack } from "@mui/material";
import options from "../../protocols/partials/options";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import React, { useState,useEffect } from "react";
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import './style.scss'
import { ClassNames } from "@emotion/react";
import ListSensory from "./component/list";
import ExtraList from "./component/extraList";
import { ListType, ProjectType } from "../../../../../types/ModelTypes";
import { getEndpoint } from "../../../../../common/http";
import { http } from "../../../../../plugins/axios";
import SplitButton from "./component/savebutton";


const Design: React.FC<any> = ({  protocol_id, sensory ,setSensory,afterSave, onSave,
    tasteIntensity,setTasteIntensity,aromaIntensity,setAromaIntensity,nutritionInfo,setNutritionInfo,textureMetrics, setTextureMetrics,
    isDraft, onDraftSave,revertProtocol,onDuplicate,incrementCounter }) => {
    const [sensorsList, setSensorsList] = useState<any>([]);

    useEffect(() => {
        http<ListType<ProjectType>>(getEndpoint('all_sensors'), { params: { page_size: 12 } }).then(response => {
          setSensorsList(response.data.payload?.results)
        })
    
      }, [])
    
      const handleSensory = ( newValue: number | number[], key: string,id : number) => {
          setSensory(sensory.map((el:any) => (el.id === id ? {...el, ["value"]:newValue} : el)))
          incrementCounter()
      };


    return (
        <List  >
           
        <ListSensory name="Sensory panel" newTitle="" orgTitle="Org" items={sensorsList} sensory={sensory}  handleSensory={handleSensory} />
        <Divider />
        {Object.keys(tasteIntensity).length != 0 && <ExtraList name="Taste intensityl" newTitle="" orgTitle="Org" items={tasteIntensity} setitems={setTasteIntensity}    />}
        <Divider />
        {Object.keys(aromaIntensity).length != 0 && <ExtraList name="Aroma Intensity" newTitle="" orgTitle="Org" items={aromaIntensity} setitems={setAromaIntensity}    />}
        <Divider />
        {Object.keys(nutritionInfo).length != 0 && <ExtraList name="Nutrition Info" newTitle="" orgTitle="Org" items={nutritionInfo} setitems={setNutritionInfo}    />}
        <Divider />
        {Object.keys(textureMetrics).length != 0 && <ExtraList name="Texture Metrics" newTitle="" orgTitle="Org" items={textureMetrics} setitems={setTextureMetrics}    />}
        <Divider />
        <Stack direction="row" spacing={2}>
            <Button onClick={revertProtocol}>Revert</Button>
            <Button onClick={onDuplicate}>Fork</Button>
           {/*  <Button variant="contained" onClick={onSave}>Save</Button> */}
            <SplitButton onSave={onSave} onDraftSave={onDraftSave} />
        </Stack>
    </List>
    );
}

export default Design;