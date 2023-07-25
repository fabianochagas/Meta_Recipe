import List from "@mui/material/List";
import { Collapse, Divider, ListItem } from "@mui/material";
import options from "../../protocols/partials/options";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import React, { useState, useEffect } from "react";
import { http, useHttp } from "../../../../../plugins/axios";
import { addParamsToEndpoint, getEndpoint } from "../../../../../common/http";

const AddTab: React.FC<any> = ({ addProtocol }) => {
    const [open, setOpen] = useState<boolean>(false)
    const [optionsList, setOptionsList] = useState<any>([])
    const [prtocessList, setPrtocessList] = useState<any>([])
    const [prtocessOptionsList, setPrtocessOptionsList] = useState<any>([])

    const handleClick = () => {
        setOpen(!open);
    };

    useEffect(() => {
        http<any>(getEndpoint('cooking_process'), {}).then(response => {
            setPrtocessList([...response.data.payload])
        })
    }, [])
    useEffect(() => {
        setPrtocessOptionsList(prtocessList.map((process: any) => {
            if (process?.parameters?.length) {
                return {
                    label: process?.name,
                    protocol: 'process',
                    inputs: process?.parameters?.map((parameter: any) => {
                        if (parameter.name != "target_state") {
                            return {
                                type: 'TimePicker',
                                props: {
                                    name: parameter?.name,
                                    unit: parameter?.unit,
                                    format: 'hh:mm',
                                    style: {
                                        height: '45px'
                                    }

                                }
                            }
                        }
                    }).filter((notUndefined: any) => notUndefined !== undefined)
                }
            }
        }).filter((notUndefined: any) => notUndefined !== undefined))
    }, [prtocessList])

    useEffect(() => {
        setOptionsList(options.map((op) => op.label == "Process" ? { ...op, ["children"]: prtocessOptionsList } : op))
    }, [prtocessOptionsList])

    useEffect(() => {
        console.log("optionsList", optionsList)
    }, [optionsList])


    return (
        <List>
            <ListItem className="justify-center">Add Protocol</ListItem>
            <Divider />
            {optionsList.map((node: any, index: number) => (
                node?.children ?
                    <>
                        <ListItem key={'protocol-list-items-' + index} disablePadding>

                            <ListItemButton onClick={handleClick}>

                                <ListItemText primary={node.label} />
                                <ListItemIcon>
                                    {open ? <ExpandLess /> : <ExpandMore />}
                                </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                        <Divider key={'divider-protocol-list-items-nested' + index} />
                        <Collapse in={open} timeout="auto" unmountOnExit key={'Collapse-items-nested' + index}>
                            <List component="div" style={{ paddingLeft: '25px' }}>
                                {node?.children?.map((nestedNode: any, index: number) => (
                                    <ListItemButton onClick={() => addProtocol(nestedNode)} key={`${node.label}-${nestedNode.label}-${index}`} >
                                        <ListItemText primary={nestedNode.label} />
                                        <ListItemIcon>
                                            <AddCircleIcon />
                                        </ListItemIcon>
                                    </ListItemButton>
                                ))}

                            </List>
                        </Collapse>
                    </>

                    :
                    <>
                        <ListItem key={'protocol-list-items-' + index} disablePadding>

                            <ListItemButton onClick={() => addProtocol(node)}>
                                <ListItemText primary={node.label} />
                                <ListItemIcon>
                                    <AddCircleIcon />
                                </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                        <Divider key={'divider-protocol-list-items-' + index} />
                    </>

            ))}
        </List>
    );
}

export default AddTab;