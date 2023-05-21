import {useCallback, useEffect, useState} from "react";
import {addEdge, applyEdgeChanges, applyNodeChanges, Edge, Node} from "reactflow";
import {number} from "yup";
import useBreadcrumb from "../../../common/hooks/breadcrumbs";
import {actions} from "./actions";
import {useHttp} from "../../../plugins/axios";
import {useAlert} from "../../../common/hooks/alert";
import {useNavigator} from "../../../common/routes";
import {useParams} from "react-router-dom";
import {addParamsToEndpoint, getEndpoint} from "../../../common/http";
import {ProtocolType} from "../../../types/ModelTypes";
import {AlertTypes} from "../../../types/Enums";

/**
 * this hook handles the required operations for ReactFlow lib.
 * @param setNodes
 * @param setEdges
 * @author Amr
 */
const useFlowActions = (setNodes: React.Dispatch<React.SetStateAction<Array<Node>>>, setEdges: React.Dispatch<React.SetStateAction<Array<Edge>>>)=>{

    /**
     * update nodes in the nodes when it receives updates
     * @author Amr
     */
    const onNodesChange = useCallback(
        (changes: any) => {
            setNodes((nds) => applyNodeChanges(changes, nds))
        },
        [setNodes]
    );
    /**
     * update edges in the edges when it receives updates
     * @author Amr
     */
    const onEdgesChange = useCallback(
        (changes: any) => {
            setEdges((eds) => applyEdgeChanges(changes, eds))
        },
        []
    );
    /**
     * start draw edge once user click on the handler of node
     * @author Amr
     */
    const onConnect = useCallback(
        (connection: any) => {
            setEdges((eds) => addEdge(connection, eds))
        },
        []
    );

    return {onNodesChange ,onEdgesChange ,  onConnect}

}
const useCommon = (setNodes: React.Dispatch<React.SetStateAction<Array<Node>>>, setEdges: React.Dispatch<React.SetStateAction<Array<Edge>>>)=> {
    /**
     * this method updates the value of children in the nodes list according to the
     * incoming value from child's component
     * @author Amr
     */
    const onChildChange = useCallback((parentId: string, childIndex: string, value: any) => {
        setNodes((nodes: Array<Node>) => {
            // find parent according to the passed parentId
            let parentIndex = nodes?.findIndex((node: Node) => node.id == parentId)
            // clone nodes, so we can update the reference of nodes
            const updatedNodes = [...nodes]
            let childrenIndex = updatedNodes[parentIndex].data.children?.findIndex((node: Node) => node.id == childIndex)
            updatedNodes[parentIndex].data.children[childrenIndex].data = {
                ...updatedNodes[parentIndex].data.children[childrenIndex].data,
                value
            }
            return updatedNodes;
        })
    }, [setNodes])

    const random = (max: number) => Math.floor(Math.random() * max) + 1
    /**
     * remove node from nodes and from edges
     * @param id
     * @author Amr
     */
    const onClose = (id: string) => {
        setNodes((nodes: Array<Node>) => nodes.filter((node: Node) => node.id != id))
        setEdges((edges: Array<Edge>) => edges.filter((edge: Edge) => edge.source != id || edge.target != id))
    }

    return {onChildChange , random ,onClose }

}

/**
 * this hook handles all ingredient's operations
 * @param nodes
 * @param setNodes
 * @param onChildChange
 * @author Amr
 */
const useIngredient = (nodes: Array<Node>, setNodes: (nodes: any) => any, onChildChange: any) => {
    const addIngredient = useCallback((parentId: string) => {
        setNodes((nodes: Array<Node>) => {
            let parentIndex = nodes?.findIndex((node: Node) => node.id == parentId)
            const updatedNodes = [...nodes]
            const nextId = parentId + '-' + Math.random();
            updatedNodes[parentIndex].data =
                {
                    ...updatedNodes[parentIndex].data,
                    children: [...(updatedNodes[parentIndex].data.children ?? []),
                        {
                            id: nextId,
                            type: 'Ingredient',
                            data: {type: 'target'},
                        },
                    ]
                };
            return updatedNodes;
        })
    }, [setNodes])
    const addIngredientProtocol = (process: any = {}) => {
        const id = 'ingredient-' + (nodes?.length + 1);
        setNodes((nodes: Array<Node>) => [...nodes, {
            id: id,
            type: 'ingredient-container',
            position: {x: 10, y: 1},
            draggable: true,
            height: 100,
            data: {
                value: 123,
                addAction: () => addIngredient(id),
                onChange: onChildChange,
                children: [],
                ...process
            }
        }
        ])
    }

    return {
        addIngredient,
        addIngredientProtocol
    }

}
/**
 * this hook handles all merge component's operations
 * @param setNodes
 * @param random
 * @author Amr
 */
const useMerge = (setNodes: (nodes: any) => any, random: any) => {
    const addMerge = (process: any = {}) => {
        const id = 'merge-' + (random(100));
        setNodes((nodes: Array<Node>) => [...nodes, {
            id: id,
            type: 'merge',
            position: {x: 10, y: 1},
            draggable: true,
            height: 100,
            data: {
                children: [],
            }
        }
        ])
    }

    return {addMerge}
}

const useServe = (setNodes: (nodes: any) => any, random: any) => {
    const addServe = (process: any = {}) => {
        const id = 'serve-' + (random(100));
        setNodes((nodes: Array<Node>) => [...nodes, {
            id: id,
            type: 'serve',
            position: {x: 10, y: 1},
            draggable: true,
            height: 100,
            data: {
                children: [],
            }
        }
        ])
    }

    return {addServe}
}

const useProcess = (nodes: Array<Node>, setNodes: (nodes: any) => any, onChildChange: any, onClose: any) => {
    const addProcess = (process: any = {}) => {
        const id = 'process-' + (nodes?.length + 1);
        setNodes((nodes: Array<Node>) => [...nodes, {
            id: id,
            type: 'process',
            position: {x: 10, y: 1},
            draggable: true,
            height: 100,
            data: {
                addAction: addProcessChild,
                onChange: onChildChange,
                onClose,
                children: process.inputs?.map((input: any, index: number) => {
                    const childId = `process-${id}-${index}`
                    return {
                        id: childId,
                        type: input.type,
                        position: {x: 10, y: 1},
                        draggable: true,
                        height: 100,
                        props: input.props,
                        data: {}
                    }
                }),
                ...process
            }
        }
        ])
    }
    const addProcessChild = useCallback((parentId: string) => {
        setNodes((nodes: Array<Node>) => {
            let parentIndex = nodes?.findIndex((node: Node) => node.id == parentId)
            const updatedNodes = [...nodes]
            const nextId = parentId + '-' + (updatedNodes[parentIndex]?.data?.children?.length) + 1
            updatedNodes[parentIndex].data =
                {
                    ...updatedNodes[parentIndex].data,
                    children: [...(updatedNodes[parentIndex].data.children ?? []),
                        {
                            ...updatedNodes[parentIndex]?.data?.children[0],
                            id: nextId,
                        },
                    ]
                };
            return updatedNodes;
        })
    }, [setNodes])
    return {addProcess , addProcessChild}
}

const useProtocol = () => {

    const [nodes, setNodes] = useState<Array<Node>>( [
        {
            "id": "ingredient-1",
            "type": "ingredient-container",
            "position": {
                "x": 89,
                "y": 31
            },
            "draggable": true,
            "height": 204,
            "data": {
                "value": 123,
                "children": [
                    {
                        "id": "ingredient-1-0.14956229258083664",
                        "type": "Ingredient",
                        "data": {
                            "type": "target",
                            "value": {
                                "name": "water",
                                "amount": "26"
                            }
                        }
                    },
                    {
                        "id": "ingredient-1-0.7308646710299707",
                        "type": "Ingredient",
                        "data": {
                            "type": "target",
                            "value": {
                                "name": "botato"
                            }
                        }
                    }
                ],
                "label": "Ingredient",
                "protocol": "ingredient"
            },
            "width": 345,
            "selected": false,
            "dragging": false,
            "positionAbsolute": {
                "x": 89,
                "y": 31
            }
        },
        {
            "id": "process-2",
            "type": "process",
            "position": {
                "x": 490,
                "y": 155.39999999999998
            },
            "draggable": true,
            "height": 148,
            "data": {
                "children": [
                    {
                        "id": "process-process-2-0",
                        "type": "ProtocolSelect",
                        "position": {
                            "x": 10,
                            "y": 1
                        },
                        "draggable": true,
                        "height": 100,
                        "props": {
                            "options": [
                                {
                                    "label": "Big",
                                    "value": "big"
                                },
                                {
                                    "label": "Medium",
                                    "value": "medium"
                                },
                                {
                                    "label": "Small",
                                    "value": "small"
                                }
                            ]
                        },
                        "data": {
                            "value": "small"
                        }
                    }
                ],
                "label": "Chop",
                "protocol": "process",
                "inputs": [
                    {
                        "type": "ProtocolSelect",
                        "props": {
                            "options": [
                                {
                                    "label": "Big",
                                    "value": "big"
                                },
                                {
                                    "label": "Medium",
                                    "value": "medium"
                                },
                                {
                                    "label": "Small",
                                    "value": "small"
                                }
                            ]
                        }
                    }
                ]
            },
            "width": 250,
            "selected": false,
            "positionAbsolute": {
                "x": 490,
                "y": 155.39999999999998
            },
            "dragging": false
        },
        {
            "id": "process-3",
            "type": "process",
            "position": {
                "x": 493,
                "y": -28
            },
            "draggable": true,
            "height": 137,
            "data": {
                "children": [
                    {
                        "id": "process-process-3-0",
                        "type": "TimePicker",
                        "position": {
                            "x": 10,
                            "y": 1
                        },
                        "draggable": true,
                        "height": 100,
                        "props": {
                            "format": "hh:mm",
                            "style": {
                                "height": "45px"
                            }
                        },
                        "data": {
                            "value": "Sat, 20 May 2023 21:03:00 GMT"
                        }
                    }
                ],
                "label": "Boil",
                "protocol": "process",
                "inputs": [
                    {
                        "type": "TimePicker",
                        "props": {
                            "format": "hh:mm",
                            "style": {
                                "height": "45px"
                            }
                        }
                    }
                ]
            },
            "width": 250,
            "selected": false,
            "positionAbsolute": {
                "x": 493,
                "y": -28
            },
            "dragging": false
        },
        {
            "id": "merge-23",
            "type": "merge",
            "position": {
                "x": 841,
                "y": 46
            },
            "draggable": true,
            "height": 126,
            "data": {
                "children": []
            },
            "width": 150,
            "selected": false,
            "positionAbsolute": {
                "x": 841,
                "y": 46
            },
            "dragging": false
        },
        {
            "id": "serve-39",
            "type": "serve",
            "position": {
                "x": 1103,
                "y": 40
            },
            "draggable": true,
            "height": 126,
            "data": {
                "children": []
            },
            "width": 150,
            "selected": true,
            "positionAbsolute": {
                "x": 1103,
                "y": 40
            },
            "dragging": false
        }
    ],);
    const [edges, setEdges] = useState<Array<Edge>>( [
        {
            "source": "ingredient-1",
            "sourceHandle": "ingredient-1-0.7308646710299707",
            "target": "process-2",
            "targetHandle": "process-process-2-0-target",
            "id": "reactflow__edge-ingredient-1ingredient-1-0.7308646710299707-process-2process-process-2-0-target"
        },
        {
            "source": "ingredient-1",
            "sourceHandle": "ingredient-1-0.14956229258083664",
            "target": "process-3",
            "targetHandle": "process-process-3-0-target",
            "id": "reactflow__edge-ingredient-1ingredient-1-0.14956229258083664-process-3process-process-3-0-target"
        },
        {
            "source": "process-3",
            "sourceHandle": "process-process-3-0-source",
            "target": "merge-23",
            "targetHandle": "merge-target",
            "id": "reactflow__edge-process-3process-process-3-0-source-merge-23merge-target"
        },
        {
            "source": "process-2",
            "sourceHandle": "process-process-2-0-source",
            "target": "merge-23",
            "targetHandle": "merge-target",
            "id": "reactflow__edge-process-2process-process-2-0-source-merge-23merge-target"
        },
        {
            "source": "merge-23",
            "sourceHandle": "merge-source",
            "target": "serve-39",
            "targetHandle": "merge-target",
            "id": "reactflow__edge-merge-23merge-source-serve-39merge-target"
        }
    ]);
    const [counter, setCounter] = useState<number>(0)
    const  {onChildChange , random ,onClose } = useCommon(setNodes , setEdges)
    const {addIngredient, addIngredientProtocol} = useIngredient(nodes, setNodes, onChildChange)
    const {addMerge} = useMerge(setNodes, random)
    const {addServe} = useServe(setNodes, random)
    const {addProcess , addProcessChild} = useProcess(nodes, setNodes , onChildChange , onClose)
    const {onNodesChange ,onEdgesChange ,  onConnect} = useFlowActions(setNodes , setEdges)
    const {showAlert} = useAlert();
    const {navigator} = useNavigator()
    const {id} = useParams();
    const isEdit = !!id
    const {request} = useHttp();

    /**
     * set the breadcrumbs of the current page
     * @author Amr
     */
    useBreadcrumb([
        {
            label: 'Protocols',
            path: "/protocols"
        },
        {
            label: '230201-v01 Vegan Croissant',
            path: "/protocols/create",
            isCurrent: true
        }
    ])


    const addProtocol = (type: any) => {
        const action = addNode(type.protocol?.toLowerCase());
        action(type);

    }


    const addChild = (type: string) => {
        const actions: any = {
            serve: addServe,
            process: addProcess,
            ingredient: addIngredientProtocol,
            merge: addMerge
        }
        return actions[type] as Function
    }



    /**
     * this one is used to add node to the flow board
     * @param type
     * @author Amr
     */
    const addNode = (type: string): any => {
        const actions: NodeActions = {
            ingredient: addIngredientProtocol,
            merge: addMerge,
            serve: addServe,
            process: addProcess
        }
        return actions[type] as Function
    }


    const onSave = ()=>{
        let _form = {
            project_id : 1,
            nodes : nodes,
            edges : edges
        }
        alert('sd')
        console.log('form' , JSON.stringify(_form))
        // change the endpoint according to the isEdit flag
        const endpoint = isEdit? addParamsToEndpoint(getEndpoint('update_protocol'), {project_id : 1 , id: id} )  : addParamsToEndpoint(getEndpoint('add_protocol'), {project_id :1 ,id: id})
        /**
         * save user
         * @author Amr
         */
        request<ProtocolType>(endpoint, _form).then((response) => {
            const user = response?.data?.payload

        })
    }

    const onDuplicate = ()=>{

    }




    return { onSave , onDuplicate, nodes , edges,onNodesChange,onEdgesChange, onConnect , addProtocol ,counter}

}

export default useProtocol