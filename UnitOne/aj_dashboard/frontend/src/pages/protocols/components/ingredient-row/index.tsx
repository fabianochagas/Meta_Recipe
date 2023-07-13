import React, {useEffect, useState} from "react";
import Grid from "@mui/material/Grid";
import {FormControl, InputAdornment, OutlinedInput} from "@mui/material";
import {Handle, Position, useReactFlow} from "reactflow";
import target from '../../../../images/target.svg'
import {IngredientType} from "../../../../types/ModelTypes";
import { IconButton,} from "@mui/material";
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowLeftOutlinedIcon from '@mui/icons-material/ArrowLeftOutlined';
import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined';
const IngredientRow:React.FC<any> = ({ data, isConnectable, index  , onChange, onRemove})=>{
    const [value , setValue] = useState<IngredientType>((data?.data.value ?? {}) as IngredientType)
    const [amount , setAmount] = useState(data?.data?.value?.amount ?? '')
    const [name , setName] = useState(data?.data?.value?.name ?? '')
    const [unit, setUnit] = useState(data?.data?.value?.unit ?? 'g')
  
    /**
     * this object includes the set methods of component's states
     * so, you can call whatever set method you want by passing the name of state
     * @param name
     * @author Amr
     */
    const set = (name:string)=> {
        const setMethods:any =  {
            'amount' : setAmount,
            'name' : setName
        }
        return  setMethods[name]
    }

    /**
     * handle the changes of component's inputs
     * @param event
     * @author Amr
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>)=> {
        set(event.target.name)( ''+ event.target.value)
        onChange(index , {name , amount , unit , [event.target.name] : event.target.value });
    }

    const isValidConnection = (connection:any)=>  true

    const handelIncresing = (ingName:string)=>{
       /*  value <= 10 && handelItems(value,name) */
        let newAmount=Number(amount)+1
        setAmount(newAmount)
        onChange(index , {name , amount:newAmount , unit , [ingName] :newAmount });
       
    }

    const handelDecresing = (ingName:string)=>{
        let newAmount=Number(amount)-1        
        onChange(index , {name , amount:newAmount , unit , [ingName]: newAmount });
        setAmount(newAmount)
    }


    return (

        <Grid container spacing={0} className="ing-row">
            <Grid item xs={1} className='handle-container-nopdding handle-container'  >
            <IconButton aria-label="settings"   onClick={()=> onRemove(data?.id)} >
                <CancelIcon className='deleteingicon' sx={{ fontSize: 40 }}  />
            </IconButton>       
            </Grid>
            <Grid xs={10} container spacing={0} className="ing_controll"> 
                <Grid xs={1} onClick={() => handelDecresing(name)} className="design-arrow-ingredient">
                    <ArrowLeftOutlinedIcon />
                </Grid>
                <Grid item xs={5} width='7ch' >
                    <FormControl sx={{ m: 1}} variant="outlined"   size="small"  >
                        <OutlinedInput
                            value={name}
                            onInput={handleChange}
                            name='name'
                            id="outlined-adornment-weight"
                            aria-describedby="outlined-weight-helper-text"
                            inputProps={{
                                'aria-label': 'weight',
                                disableUnderline: true,
                            }}
                            sx={{
                                "& fieldset": { border: 'none' },
                            }}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={5}>
                    <FormControl sx={{ m: 1 }} variant="outlined"   size="small">
                        <OutlinedInput
                            className={'number-input'}
                            type='number'
                            value={amount}
                            onInput={handleChange}
                            name='amount'
                            id="outlined-adornment-weight"
                            endAdornment={<InputAdornment position="end">{unit}</InputAdornment>}
                            aria-describedby="outlined-weight-helper-text"
                            inputProps={{
                                'aria-label': 'weight',
                            }}
                            sx={{
                                "& fieldset": { border: 'none' },
                            }}
                        />
                    </FormControl>
                </Grid>
                <Grid xs={1} onClick={() =>handelIncresing(name)} className="design-arrow-ingredient">
                    <ArrowRightOutlinedIcon />
                </Grid>
            </Grid>
            <Grid item xs={1} className='handle-container'>
                <Handle type={data.type} position={Position.Right} id={index} isConnectable={isConnectable}
                        className="handle-circle"
                        onConnect={data.onConnect}
                        style={{
                            backgroundImage : `url(${target})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                        isValidConnection={isValidConnection} />

            </Grid>
           

        </Grid>
    );
}

export default IngredientRow;