import {TimePicker} from "antd";
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import {InputLabel, FormControl, InputAdornment, makeStyles, OutlinedInput, Theme} from "@mui/material";


const ProtocolTimePicker: React.FC<any> = ({props, onChange, data, value,extra}) => {

    const [localValue, setLocalValue] = useState<any>(data.value);
    /**
     * handle the changes of input
     * @param event
     * @author Amr
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setValues(event.target.value)
    /**
     * update local values and the node's value as well
     * @param _value
     * @author Amr
     */
    const setValues = (_value: string) => {
        setLocalValue(_value);
        onChange(_value);
    }

    console.log("extra",extra)

    return (
        <FormControl sx={{m: 1}} variant="outlined" size="small">
            <InputLabel size="small" id="process-options-label">{extra?.name || ""}</InputLabel>
            <OutlinedInput
                className={'number-input'}
                type='number'
                label="Number"
                value={localValue}
                onChange={handleChange}
                name='time'
                id="outlined-adornment-weight"
                endAdornment={<InputAdornment position="end">{extra?.unit?.slice(0, 3) || "min"}</InputAdornment>}
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                    'aria-label': 'weight',
                }}
            />
        </FormControl>
    );
}

export default ProtocolTimePicker;