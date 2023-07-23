import React, {useEffect, useState} from 'react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import './partials/style.scss'
import IngredientGroup from './components/ingredient/index';
import { Button, Stack, TextField, Select, MenuItem, FormControl, InputLabel, Tabs, Tab } from "@mui/material";
import Box from "@mui/material/Box";
import Ingredient from './components/ingredient-row/index'
import IngredientRow from "./components/ingredient-row/index";
import Merge from "./components/merge";
import Serve from "./components/serve";
import ProtocolsOptions from "./components/protocols";
import Process from "./components/process";
import { IconButton } from "@mui/material";
import useProtocol from "./partials/hooks";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BasicModal from "./components/protocols/components/extra-amount/index"
import MessageModal from "./components/protocols/components/save-as-racipt/index"
import {a11yProps} from "../protocols/components/tabs/index"
import DropdownMenu from "../../components/menu/index";
import {TabContext, TabList} from "@mui/lab";
import TabPanel from '@mui/lab/TabPanel';
import AppTabs from "../../components/tabs";
import AddTab from "./components/tabs/Add";
import Design from "./components/tabs/design";
import Generate from "./components/tabs/generate";
import Charts from "./components/tabs/charts";
import Projects from "./components/tabs/projects";
import {useCounter} from "../../common/hooks/counter";
import {useSelector} from "react-redux";

const rfStyle = {
    backgroundColor: 'trasparent',
};


// we define the nodeTypes outside the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = {
    Ingredient,
    'ingredient-container': IngredientGroup,
    'ingredient': IngredientRow,
    merge: Merge,
    serve: Serve,
    process: Process
};

const menuList = [
    {
        name:"Save As Recipe",
        action:()=>{}
    },
];


const EXTRA_HEIGHT = 55;

const CreateEditProtocol: React.FC = () => {



    const { onSave, onDuplicate, nodes, edges, onNodesChange, onEdgesChange, onConnect, addProtocol,
        counter, openModel, handleOpenModel,  saveSensory, id, extra, setExtra, setForm,
          projects,openSaveAsRicpeModel,setOpenSaveAsRicpeModel  , form ,saveAsRecipe, handleFormChanges , isEdit,
          tasteIntensity,setTasteIntensity,aromaIntensity,setAromaIntensity,nutritionInfo,setNutritionInfo,textureMetrics, setTextureMetrics,
          isDraft, onDraftSave,revertProtocol,onUploda}

        = useProtocol();

        const {incrementCounter,reCounter} = useCounter();
        const state = useSelector(state => state)

    const [tabs , setTabs] = useState<any>([]);
    useEffect(()=> {
        setTabs([
            {
                label : "Add",
                component : ProtocolsOptions,
                props : {
                    handleFormChanges: handleFormChanges,
                    allProjects: projects,
                    protocolName: form?.name,
                    protocolProject : form?.project
                }
            },
            // {
            //     label : "Design",
            //     component : ProtocolsOptions,
            //     props : {
            //         handleFormChanges: handleFormChanges,
            //         allProjects: projects,
            //         protocolName: form?.name,
            //         project : form?.project
            //     }
            // }
        ])
    } , [form])
    const [value, setValue] = React.useState('1');

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

console.log("(state as any).counter",(state as any))
    return (
        <>

            <Stack flexDirection='row'>
                <Box width="100%" style={{ height: '80ch' }} key={'nodes-' + counter}>
                    <Stack spacing={2} direction="row" justifyContent="right" className="list-master-actions" width="100%">
                        <Button variant="text" color="info" onClick={onDuplicate}>Duplicate</Button>
                        <Button variant="text" color="primary" className='primary' onClick={saveSensory/* onSave */}>Save</Button>
                        {/*{isEdit && <Button variant="text" color="info" onClick={() => handleOpenModel(true)}>Predict</Button>} */}
                        {/*  <DropdownMenu menuList={menuList}/> */}
                        <label htmlFor="upload-photo">
                            <input
                                style={{ display: 'none' }}
                                id="upload-photo"
                                name="upload-photo"
                                type="file"
                                onChange={(e)=>onUploda(e)}
                            />

                            <Button color="info" variant="text" className='upload_protocol_button' component="span">
                                Upload 
                            </Button>
                        </label>
                    </Stack>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        // fitView
                        style={rfStyle}
                    />
                   <Charts 
                   sensory={[...extra]}
                   tasteIntensity={tasteIntensity}
                   aromaIntensity={aromaIntensity}
                   nutritionInfo={nutritionInfo}
                   textureMetrics={textureMetrics}
                    protocol_id={id}/> 
                </Box>
                <BasicModal
                    open={openModel}
                    setOpen={handleOpenModel}
                    protocol_id={id}
                    sensory={extra}
                    setSensory={setExtra}
                    afterSave={saveSensory}
                    setForm={setForm}
                />
                <MessageModal
                    open={openSaveAsRicpeModel}
                    setOpen={(status : boolean) => setOpenSaveAsRicpeModel(status)}
                    message="Are you sure that you want to save the changes as a new Recipe? "
                    onSave={saveAsRecipe}
                />


                <Box width='20%' className="protocols-items" mr={-3} mt={-11}>

                    <AppTabs tabs={
                        [
                            {
                                label : "Form",
                                component : ProtocolsOptions,
                                props : {
                                    handleFormChanges: handleFormChanges,
                                    allProjects: projects,
                                    protocolName: form?.name,
                                    protocolProject : form?.project,
                                    addProtocol : addProtocol
                                }
                            },
                            {
                                label : "Add",
                                component : AddTab,
                                props : {
                                    handleFormChanges: handleFormChanges,
                                    addProtocol : addProtocol
                                },
                                tabProps : {
                                    style: {padding : 0}
                                }
                            },
                            {
                                label : "Design",
                                component : Design,
                                props : {
                                    handleFormChanges: handleFormChanges,
                                    protocol_id:id,
                                    sensory:extra,
                                    setSensory:setExtra,
                                    afterSave:saveSensory,
                                    onSave:onSave,
                                    revertProtocol:revertProtocol,
                                    tasteIntensity:tasteIntensity,
                                    setTasteIntensity:setTasteIntensity,
                                    aromaIntensity:aromaIntensity,
                                    setAromaIntensity:setAromaIntensity,
                                    nutritionInfo:nutritionInfo,
                                    setNutritionInfo:setNutritionInfo,
                                    textureMetrics:textureMetrics,
                                    setTextureMetrics:setTextureMetrics,
                                    isDraft:isDraft,
                                    onDraftSave:onDraftSave,
                                    onDuplicate:onDuplicate,
                                    incrementCounter:incrementCounter
                                },
                                tabProps : {
                                    style: {padding : 0}
                                }
                            },
                            {
                                label : "Generate",
                                component : Generate,
                                props : {
                                    handleFormChanges: handleFormChanges,
                                    protocol_id:id,
                                    sensory:extra,
                                    setSensory:setExtra,
                                    afterSave:saveSensory,
                                    tasteIntensity:tasteIntensity,
                                    setTasteIntensity:setTasteIntensity,
                                    aromaIntensity:aromaIntensity,
                                    setAromaIntensity:setAromaIntensity,
                                    nutritionInfo:nutritionInfo,
                                    setNutritionInfo:setNutritionInfo,
                                    textureMetrics:textureMetrics,
                                     setTextureMetrics:setTextureMetrics
                                },
                                tabProps : {
                                    style: {padding : 0}
                                }
                            },
                           /*  {
                                label : "Charts",
                                component : Charts,
                                props : {
                                    protocol_id:id
                                },
                                tabProps : {
                                    style: {padding : 0}
                                }
                            }, */
                            {
                                label : "Projects",
                                component : Projects,
                                props : {
                                    protocol_id:id
                                },
                                tabProps : {
                                    style: {padding : 0}
                                }
                            }
                        ]
                    }></AppTabs>
                </Box>

            </Stack>
        </>



    );
}

export default CreateEditProtocol;