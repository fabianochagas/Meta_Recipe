import List from "@mui/material/List";
import { Collapse, Divider, ListItem } from "@mui/material";
import options from "../../protocols/partials/options";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import React, { useEffect, useState } from "react";
import SensoryChart from "./sensory";
import './style.scss'
import { ProtocolType, ListType } from "../../../../../types/ModelTypes";
import { addParamsToEndpoint, getEndpoint } from "../../../../../common/http";
import { http, useHttp } from "../../../../../plugins/axios";


const Charts: React.FC<any> = ({ protocol_id }) => {
    //const [protocols, setProtocols] = useState<Array<ProtocolType>>([])
    const [sensoryPanelChart, setSensoryPanelChart] = useState([])
    const [tasteIntensityChart, setTasteIntensityChart] = useState([])
    const [aromaIntensityChart, setAromaIntensityChart] = useState([])
    const [nutritionInfoChart, setNutritionInfoChart] = useState([])
    const [textureMetricsChart, setTextureMetricsChart] = useState([])
    const [protocolsKeys, setProtocolsKeys] = useState<any>([])
    const [finsh, setFinsh] = useState<number>(0)
    const { request } = useHttp();

    useEffect(() => {
        if (protocol_id) {
            http<ListType<ProtocolType>>(addParamsToEndpoint(getEndpoint('similar_protocols'), { id: protocol_id })).then(response => {
               // console.log("response>>>>>>", response)

                buildChartData([...response.data.payload])
            })
        }
    }, [protocol_id])

    const buildChartData = async (protocols: any) => {
        let dataSensoryPanel: any = [];
        let dataTasteIntensity: any = [];
        let dataAromaIntensity: any = [];
        let dataNutritionInfo: any = [];
        let dataTextureMetrics: any = [];
        let  pKeys: any = []
        if (protocols.length) {
            for (let protocol of protocols) {
                 pKeys.push(protocol.name);  
                let protocolSensoryPanel = protocol?.custom_sensory_panels
                let protocolTasteIntensity = protocol?.taste_intensity
                let protocolAromaIntensity = protocol?.aroma_intensity
                let protocolNutritionInfo = protocol?.nutrition_info
                let protocolTextureMetrics = protocol?.texture_metrics

                //genarate sensoryPanel chart opject for Chart
                for (const sensoryPanel of protocolSensoryPanel){
                    let index = dataSensoryPanel.findIndex((dataSensoryPanel: any) => dataSensoryPanel["taste"] == sensoryPanel.variable)
                    if (index > -1) {
                        dataSensoryPanel[index][protocol.name] = sensoryPanel.value || 0;
                    } else {
                        dataSensoryPanel.push({
                            "taste": sensoryPanel.variable,
                            [protocol.name]: sensoryPanel.value || 0
                        });
                    }
                }
                //genarate Taste Intensity chart opject for Chart
                Object.keys(protocolTasteIntensity).map((key,index)=>{
                    var nValue : number = Number(protocolTasteIntensity[key]);
                    let indexm = dataTasteIntensity.findIndex((dataTasteIntensity: any) => dataTasteIntensity["taste"] == key)
                    if (indexm > -1) {
                        dataTasteIntensity[index][protocol.name] = nValue || 0;
                    } else {
                        dataTasteIntensity.push({
                            "taste": key,
                            [protocol.name]: nValue || 0
                        });
                    }

                })
                //genarate Aroma Intensity chart opject for Chart
               Object.keys(protocolAromaIntensity).map((key,index)=>{
                    var nValue : number = Number(protocolAromaIntensity[key]);
                    let indexm = dataAromaIntensity.findIndex((dataAromaIntensity: any) => dataAromaIntensity["taste"] == key)
                    if (indexm > -1) {
                        dataAromaIntensity[index][protocol.name] = nValue || 0;
                    } else {
                        dataAromaIntensity.push({
                            "taste": key,
                            [protocol.name]: nValue || 0
                        });
                    }

                })

                //genarate Nutrition Info chart opject for Chart
               Object.keys(protocolNutritionInfo).map((key,index)=>{
                    var nValue : number = Number(protocolNutritionInfo[key]);
                    let indexm = dataNutritionInfo.findIndex((dataNutritionInfo: any) => dataNutritionInfo["taste"] == key)
                    if (indexm > -1) {
                        dataNutritionInfo[index][protocol.name] = nValue || 0;
                    } else {
                        dataNutritionInfo.push({
                            "taste": key,
                            [protocol.name]: nValue || 0
                        });
                    }

                })

                //genarate  Texture Metrics chart opject for Chart
               Object.keys(protocolTextureMetrics).map((key,index)=>{
                    var nValue : number = Number(protocolTextureMetrics[key]);
                    let indexm = dataTextureMetrics.findIndex((dataTextureMetrics: any) => dataTextureMetrics["taste"] == key)
                    if (indexm > -1) {
                        dataTextureMetrics[index][protocol.name] = nValue || 0; 
                    } else {
                        dataTextureMetrics.push({
                            "taste": key,
                            [protocol.name]: nValue  || 0
                        });
                    }

                })
                
            }
            setProtocolsKeys(pKeys)
            setSensoryPanelChart(dataSensoryPanel)
            setTasteIntensityChart(dataTasteIntensity)
            setAromaIntensityChart(dataAromaIntensity)
            setNutritionInfoChart(dataNutritionInfo)
            setTextureMetricsChart(dataTextureMetrics)

        }

    }
  /*   useEffect(() => {
        console.log("tasteIntensityChart>>>>>>>>>", tasteIntensityChart)
    }, [tasteIntensityChart]) */

   console.log("sensoryPanelChart>>>>>>>>>", sensoryPanelChart)
    //console.log("protocolsKeys>>>>>>>>>", protocolsKeys)

    const data = [
        {
            "taste": "fruity",
            "p1": 107,
            "p2": 110,
            "p3": 113
        },
        {
            "taste": "bitter",
            "p1": 96,
            "p2": 61,
            "p3": 80
        },
        {
            "taste": "heavy",
            "p1": 86,
            "p2": 23,
            "p3": 69
        },
        {
            "taste": "strong",
            "p1": 74,
            "p2": 39,
            "p3": 110
        },
        {
            "taste": "sunny",
            "p1": 115,
            "p2": 77,
            "p3": 108
        }
    ]

    

    return (
        <List>
            {sensoryPanelChart.length > 0 && <SensoryChart title="Sensory Panel" keys={protocolsKeys} data={sensoryPanelChart} />}
            {tasteIntensityChart.length > 0  && <SensoryChart title="Taste" keys={protocolsKeys}  data={tasteIntensityChart} />}
            {aromaIntensityChart.length > 0  && <SensoryChart title="Aroma Intensity" keys={protocolsKeys}  data={aromaIntensityChart} />}
            {nutritionInfoChart.length > 0  && <SensoryChart title="Nutrition Info" keys={protocolsKeys}  data={nutritionInfoChart} />}
            {textureMetricsChart.length > 0  && <SensoryChart title="TextureMetrics" keys={protocolsKeys}  data={textureMetricsChart} />}
        </List>
    );
}

export default Charts;