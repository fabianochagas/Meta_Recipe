import {hasExpectedRequestMetadata} from "@reduxjs/toolkit/dist/matchers";
import {Card, CardActions, CardContent, CardHeader, IconButton} from "@mui/material";
import Typography from "@mui/material/Typography";
import CancelIcon from "@mui/icons-material/Cancel";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {Handle, Position} from "reactflow";
import source from "../../../../images/source.svg";
import target from "../../../../images/target.svg";
import React, {useEffect, useState} from "react";
import {IngredientType} from "../../../../types/ModelTypes";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import {TimePicker} from "antd";
import ProtocolSelect from "../protocols/components/select";
import dayjs from "dayjs";
import ProtocolTimePicker from "../protocols/components/time-picker";

const Process:React.FC<any> = ({data , isConnectable , id , type}) => {
    const [label , setLabel] = useState<string>('');
    const [value , setValue] = useState<any>('')

    useEffect(()=> setLabel(data.label) , [data])

    const handleChange = (newValue:any , childId:string)=> {
       setValue( newValue.toString())
        data.onChange(id ,childId,newValue?.toString());
    }

    const getComponent = (componentName:string)=>{
        const _components:any = {
            'TimePicker' : ProtocolTimePicker,
            'ProtocolSelect' : ProtocolSelect
        }
        return _components[componentName] as any
    }


 

    return (
        <div >
            <Card sx={{ maxWidth: 345 , width: 300  }} className='node-item '>
                <CardHeader

                    className="node-item-header process"

                    title={
                        <Typography variant="h6">
                            {label}
                        </Typography>
                    }
                    action={
                        <IconButton aria-label="settings" className='icon' onClick={()=> data.onClose(id)}>
                            <CancelIcon />
                        </IconButton>
                    }


                />


                <CardContent>
                    <Grid  container spacing={1}  alignItems={'center'}>
                        {(data.children || [] ).map((input:any , index:number) => (
                            <>
                                <Grid item xs={2} key={`process-target-${index}`}>
                                    <Handle type="target" position={Position.Left} id={`${input.id}-target`} isConnectable={isConnectable}
                                            className="handle-circle target"
                                            style={{
                                                backgroundImage : `url(${source})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                    />
                                </Grid>
                                {console.log("input",input)}
                                <Grid item xs={8} key={`process-field-${index}`}>
                                    {React.createElement(getComponent(input.type) , {...(input.props || {}) , extra:input.props, value:dayjs(input.data.value) ,locale:'en_US', data:input.data, size: 'small'  , onChange: (newValue:any)=>handleChange(newValue ,input.id )})}
                                </Grid>
                                <Grid item xs={2} key={`process-source-${index}`} >
                                    <Handle type="source" position={Position.Right} id={`${input.id}-source`} isConnectable={isConnectable}
                                            className="handle-circle"
                                            style={{
                                                backgroundImage : `url(${target})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                    />
                                </Grid>
                            </>


                        ))}
                        {/*<Grid item xs >*/}
                        {/*    <Handle type="source" position={Position.Right} id="merge-source" isConnectable={isConnectable}*/}
                        {/*            className="handle-circle"*/}
                        {/*            style={{*/}
                        {/*                backgroundImage : `url(${target})`,*/}
                        {/*                backgroundSize: 'cover',*/}
                        {/*                backgroundPosition: 'center',*/}
                        {/*            }}*/}
                        {/*    />*/}
                        {/*</Grid>*/}

                    </Grid>
                </CardContent>




                <CardActions disableSpacing className='node-item-actions'>
                    <IconButton aria-label="add to favorites" onClick={()=> data.addAction(id , type)}>
                        <AddCircleIcon/>
                    </IconButton>
                </CardActions>
            </Card>

            {/*<Handle*/}
            {/*    type="source"*/}
            {/*    position={Position.Bottom}*/}
            {/*    id="a"*/}
            {/*    style={handleStyle}*/}
            {/*    isConnectable={isConnectable}*/}
            {/*/>*/}

        </div>
           );
}

export default Process;