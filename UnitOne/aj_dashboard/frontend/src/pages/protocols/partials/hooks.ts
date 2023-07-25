import {useCallback, useEffect, useState} from "react";
import {addEdge, applyEdgeChanges, applyNodeChanges, Edge, Node} from "reactflow";
 
import {number} from "yup";
import useBreadcrumb from "../../../common/hooks/breadcrumbs";
import {actions} from "./actions";
import {http, useHttp} from "../../../plugins/axios";
import {useAlert} from "../../../common/hooks/alert";
import {useNavigator} from "../../../common/routes";
import {useParams} from "react-router-dom";
import {addParamsToEndpoint, getEndpoint} from "../../../common/http";
import {ListType, ProjectType, ProtocolType} from "../../../types/ModelTypes";
import {AlertTypes} from "../../../types/Enums";
import {ResponseType} from "../../../types/HttpTypes";
import BasicModal from "../components/protocols/components/extra-amount/index"
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "../../../plugins/redux/reducers/breadcrumbs";

/**
 * this hook handles the required operations for ReactFlow lib.
 * @param setNodes
 * @param setEdges
 * @author Amr
 */
const useFlowActions = (setNodes: React.Dispatch<React.SetStateAction<Array<Node>>>, setEdges: React.Dispatch<React.SetStateAction<Array<Edge>>>) => {

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

    return {onNodesChange, onEdgesChange, onConnect}

}

/**
 * this hook handles Nodes Loacation 
 * @author Bilal
 */
const useLocation= () => {

    const [x, setx] = useState<number>(0)
    const [y, sety] = useState<number>(0)

    const getX=()=> x
    const getY=()=> y

    const updateLocation =()=>{
        setx(x+30)
        sety(y+30)
    } 
    return {getX,getY,updateLocation}

}
const useCommon = (setNodes: React.Dispatch<React.SetStateAction<Array<Node>>>, setEdges: React.Dispatch<React.SetStateAction<Array<Edge>>>) => {
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

    return {onChildChange, random, onClose}

}

/**
 * this hook handles all ingredient's operations
 * @param nodes
 * @param setNodes
 * @param onChildChange
 * @author Amr
 */

const useIngredient = function(nodes: Array<Node>, setNodes: (nodes: any) => any, onChildChange: any, onClose: any ,counter :number,setCounter :any,location:any)   {
    
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


    /**
     * this function handles remove one Ingredient
     * @param parentId
     * @param name
     * @author Bilal
     */

    const removeIngredient = useCallback( async (parentId: string,id :string) => {
       await setNodes((nodes: Array<Node>) => {
            let parentIndex = nodes?.findIndex((node: Node) => node.id == parentId)
            const updatedNodes = [...nodes]
            const nextId = parentId + '-' + Math.random();
            console.log("node ",updatedNodes[parentIndex].data)
            updatedNodes[parentIndex].data =
                {
                    ...updatedNodes[parentIndex].data,
                    children: [...(updatedNodes[parentIndex].data.children.filter((ing :any)=>{
                         return ing?.id != id
                    }) )
                    ]
                };
           
            return updatedNodes;
        })
        setCounter((counter:number) => counter + 1)
    }, [setNodes])

 
    const ingredientActions = {
        onClose,
        addAction: addIngredient,
        onChange: onChildChange,
        removeIngredient:removeIngredient,
     }

    const addIngredientProtocol = (process: any = {}) => {
        
        const id = 'ingredient-' + (nodes?.length + 1);
        setNodes((nodes: Array<Node>) => [...nodes, {
            id: id,
            type: 'ingredient-container',
            position: {x: location.getX(), y: location.getY()},
            draggable: true,
            height: 100,
            data: {
                value: 123,
                ...ingredientActions,
                children: [],
                ...process
            }
        }
        ])
        location.updateLocation()
    }

    return {
        addIngredient,
        addIngredientProtocol,
        ingredientActions
    }

}
/**
 * this hook handles all merge component's operations
 * @param setNodes
 * @param random
 * @author Amr
 */
const useMerge = (setNodes: (nodes: any) => any, random: any, onClose: any,location:any) => {
    const mergeActions = {
        onClose,
    }
    const addMerge = (process: any = {}) => {
        const id = 'merge-' + (random(100));
        setNodes((nodes: Array<Node>) => [...nodes, {
            id: id,
            type: 'merge',
            position: {x: location.getX(), y: location.getY()},
            draggable: true,
            height: 100,
            data: {
                ...mergeActions,
                children: [],
            }
        }
        ])
        location.updateLocation()
    }

    return {addMerge, mergeActions}
}

const useServe = (setNodes: (nodes: any) => any, random: any, onClose: any,location:any) => {
    const serveActions = {
        onClose,
    }
    const addServe = (process: any = {}) => {
        const id = 'serve-' + (random(100));
        setNodes((nodes: Array<Node>) => [...nodes, {
            id: id,
            type: 'serve',
            position: {x: location.getX(), y: location.getY()},
            draggable: true,
            height: 100,
            data: {
                onClose,
                children: [],
            }
        }
        ])
        location.updateLocation()
    }

    return {addServe, serveActions}
}

const useProcess = (nodes: Array<Node>, setNodes: (nodes: any) => any, onChildChange: any, onClose: any,location:any) => {
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
    const processActions = {
        addAction: addProcessChild,
        onChange: onChildChange,
        onClose,
    }
    const addProcess = (process: any = {}) => {
        const id = 'process-' + (nodes?.length + 1);
        setNodes((nodes: Array<Node>) => [...nodes, {
            id: id,
            type: 'process',
            position: {x: location.getX(), y: location.getY()},
            draggable: true,
            height: 100,
            data: {
                ...processActions,
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
        location.updateLocation()
    }


    return {addProcess, addProcessChild, processActions}
}

const useProtocol = () => {

    const dispatch = useDispatch();


    const [nodes, setNodes] = useState<Array<Node>>([]);
    const [edges, setEdges] = useState<Array<Edge>>([]);
    const [extra, setExtra] = useState<any>([]);
    const [tasteIntensity, setTasteIntensity] = useState<any>([]);
    const [aromaIntensity, setAromaIntensity] = useState<any>([]);
    const [nutritionInfo, setNutritionInfo] = useState<any>([]);
    const [textureMetrics, setTextureMetrics] = useState<any>([]);
    const [isDraft, setIsDraft] = useState<number>(0);
    /* const [sensory , setSensory] = useState<any>({ }); */
    const [name, setName] = useState("");
    const [project, setProject] = useState<number>();
    const [projects, setProjects] = useState<Array<ProjectType>>([])
    const [counter, setCounter] = useState<number>(0)
    const [metaRecipesCount, setMetaRecipesCount] = useState<number>(0)
    const location = useLocation()
    const {onChildChange, random, onClose} = useCommon(setNodes, setEdges)
    const {
        addIngredient,
        addIngredientProtocol,
        ingredientActions
    } = useIngredient(nodes, setNodes, onChildChange, onClose,counter,setCounter,location)
    const {addMerge, mergeActions} = useMerge(setNodes, random, onClose,location)
    const {addServe, serveActions} = useServe(setNodes, random, onClose,location)
    const {addProcess, addProcessChild, processActions} = useProcess(nodes, setNodes, onChildChange, onClose,location)
    const {onNodesChange, onEdgesChange, onConnect} = useFlowActions(setNodes, setEdges)
    const [form , setForm] = useState<any>({});
    const {showAlert} = useAlert();
    const {navigator} = useNavigator()
    const {id , project_id} = useParams();
    const isEdit = !!id
    const {request} = useHttp();
    const [openModel, setOpenModel] = useState(false);
    const handleOpenModel = (value:boolean) => setOpenModel(value);
    const [rTabsValue, setRTabsValue] = useState(0);
    const [openSaveAsRicpeModel, setOpenSaveAsRicpeModel] = useState(false);
    const [saveAsDraf, setSaveAsDraf] = useState<number>(0);




    /**
     * this function binds the required actions to the nodes according
     * to node's type
     * @param nodes
     * @author Amr
     */
    const bindActions = (nodes: Array<Node>) => {
        // object that contains the node type as key and
        // list of actions as the value of that key
        const _actions:any = {
            'ingredient-container': ingredientActions,
            'process': processActions,
            serve: serveActions,
            merge: mergeActions,
        }
        // walk through the node list and connect their nodes
        // with suitable actions
      return  nodes?.map((node:Node) => {
          node.data = {
              ... node.data,
              ..._actions[node.type??'']
          }
          return node;

        })
    }
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
            label: 'new-protocol',
            path: "/protocols/create",
            isCurrent: true
        }
    ])

    /**
     * add a new protocol according to the name of protocol
     * @Note: check addNode function to reach to the function that adds the node
     * accordin' to its type
     * @param type
     * @author Amr
     */
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

    /**
     * fetch protocol once you get a valid id
     * @author Amr
     */
    useEffect(() => {
        fetchProtocol()
    }, [id])

    /**
     * dispatch protocol name after name is fetched
     * @author
     */
    useEffect(() => {
        dispatch(setBreadcrumbs([
            {
                label: 'Protocols',
                path: "/protocols"
            },
            {
                label: !!name ? name : 'new-protocol',
                path: "/protocols/create",
                isCurrent: true
            }
        ]))
    }, [name]);

    /**
     * fetch projects  
     * @author Bilal
     */
    useEffect(() => {
            http<ListType<ProjectType>>(addParamsToEndpoint(getEndpoint('all_projects'), {params: {}})).then(response => {
                setProjects(response.data.payload?.results)
            })
    }, [])


    /**
     * save protocol As Recipe  
     * @author Bilal
     */
    const saveAsRecipe = () => {
        /* saveProtocol() */
        saveAndPredict()
        setOpenSaveAsRicpeModel(false)
    }
    /**
     * fetch protocol Data
     * @author Bilal
     */
    const fetchProtocol = () => {
        if (id) {
            http<ResponseType<ProtocolType>>(addParamsToEndpoint(getEndpoint('find_protocol'), {id})).then(response => {
                setForm(response.data.payload);
                setNodes(bindActions(response.data.payload.flow.nodes))
                setEdges(response.data.payload.flow.edges)
                setExtra([...response.data.payload.custom_sensory_panels])
                setTasteIntensity({...response.data.payload.taste_intensity})
                setAromaIntensity({...response.data.payload.aroma_intensity})
                setNutritionInfo({...response.data.payload.nutrition_info})
                setTextureMetrics({...response.data.payload.texture_metrics})
                setName(response.data.payload.name)
                setProject(response.data.payload.project)
                setMetaRecipesCount(response.data.payload?.meta_recipes_count)
                setIsDraft(response.data.payload?.is_draft)
            })
        }
    }


    /**
     * revert Protocol
     * @author Bilal
     */
    const revertProtocol =   () => {
        if (id) {
            http<ResponseType<ProtocolType>>(addParamsToEndpoint(getEndpoint('find_protocol'), {id})).then(response => {
                setForm(response.data.payload);
                setNodes(bindActions(response.data.payload.flow.nodes))
                setEdges(response.data.payload.flow.edges)
                setExtra([...response.data.payload.custom_sensory_panels])
                setTasteIntensity({...response.data.payload.taste_intensity})
                setAromaIntensity({...response.data.payload.aroma_intensity})
                setNutritionInfo({...response.data.payload.nutrition_info})
                setTextureMetrics({...response.data.payload.texture_metrics})
                setName(response.data.payload.name)
                setProject(response.data.payload.project)
                setMetaRecipesCount(response.data.payload?.meta_recipes_count)
                setIsDraft(response.data.payload?.is_draft)
                setCounter((counter:number) => counter + 1)
            })
        }

    }



    /**
     * on save protocol check if save As Recipe  (show message )or as protocol  
     * @author Bilal
     */
    const onSave = () => {

        if(metaRecipesCount){
            setOpenSaveAsRicpeModel(true)
            
        }else{
            setIsDraft(0)
            setSaveAsDraf(saveAsDraf+1)
            
        }

    }
    /**
     * on save protocol  as Draft
     * @author Bilal
     */
    const onDraftSave = () => {
        setIsDraft(1)
        setSaveAsDraf(saveAsDraf+1)
    }

    useEffect(() => {
        if(saveAsDraf != 0){
            saveAndPredict()
        }
    }, [saveAsDraf])



    /**
     * save protocol   
     * @author Bilal
     */
    const saveProtocol = () => {

        let _form = {
            ...form,
            project:project/* project_id */,
            name:name,
            flow : {
                nodes: nodes,
                edges: edges
            },
            taste_intensity:tasteIntensity,
            aroma_intensity:aromaIntensity,
            nutrition_info:nutritionInfo,
            texture_metrics:textureMetrics,
            custom_sensory_panels:extra,
            is_draft:isDraft,
        }
        console.log('form', _form, JSON.stringify(_form))
        // change the endpoint according to the isEdit flag
        const endpoint = isEdit ? addParamsToEndpoint(getEndpoint('update_protocol'), {
            project_id,
            id: id
        }) : addParamsToEndpoint(getEndpoint('add_protocol'), {project_id, id: id})
        /**
         * save user
         * @author Amr
         */
        request<ProtocolType>(endpoint, _form).then((response) => {
            const protocol = response?.data?.payload
            showAlert({
                type: AlertTypes.SUCCESS,
                message: `Protocol ${protocol.name} ${isEdit ? 'updated' : 'added'}  successfully`
            })
           /*  navigator('/protocols'); */
        })
        
    }

    const onDuplicate = () => {
       /*  request<ListType<ProtocolType>>(getEndpoint('clone_protocols'), {ids : [id]} ).then(response => {
            showAlert({
                type: AlertTypes.SUCCESS,
                message: `Protocols cloned successfully`
            })
        }) */
        let _form = {
            ...form,
            project:project/* project_id */,
            name:name+"_colne_"+new Date().getUTCMilliseconds(),
            flow : {
                nodes: nodes,
                edges: edges
            },
            taste_intensity:tasteIntensity,
            aroma_intensity:aromaIntensity,
            nutrition_info:nutritionInfo,
            texture_metrics:textureMetrics,
            custom_sensory_panels:extra,
            is_draft:isDraft,
        }
        console.log('form', _form, JSON.stringify(_form))
        // change the endpoint according to the isEdit flag
        const endpoint = addParamsToEndpoint(getEndpoint('add_protocol'), {project_id, id: id})
        /**
         * Duplicate protocole
         * @author Bilal
         */
        request<ProtocolType>(endpoint, _form).then((response) => {
            const protocol = response?.data?.payload
            showAlert({
                type: AlertTypes.SUCCESS,
                message: `Protocols Duplicated successfully`
            })
             
            navigator('/protocols/'+protocol?.id);
        })
        
    }

       /**
     * save sensory   
     * @author Bilal
     */
    const onUploda = (e:any) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
          /* console.log("e.target.result", e?.target?.result); */
        if (!e?.target?.result) return;
        const Newprotocole: any = JSON.parse(e.target.result as string)
        console.log("Newprotocole", Newprotocole);
        setForm(Newprotocole);
        setNodes(bindActions(Newprotocole?.flow.nodes))
        setEdges(Newprotocole?.flow?.edges)
        setExtra([...Newprotocole?.custom_sensory_panels])
        setTasteIntensity({...Newprotocole?.taste_intensity})
        setAromaIntensity({...Newprotocole?.aroma_intensity})
        setNutritionInfo({...Newprotocole?.nutrition_info})
        setTextureMetrics({...Newprotocole?.texture_metrics})
        setName(Newprotocole?.name)
        setProject(Newprotocole?.project)
        setMetaRecipesCount(Newprotocole?.meta_recipes_count)
        setIsDraft(Newprotocole?.is_draft)
        setCounter((counter:number) => counter + 1)
        }; 
    }


       /**
     * save sensory   
     * @author Bilal
     */
       const saveSensory = () => {
        let protocol_id=id
        let _form = {
            protocol:protocol_id,
            sensors:extra,
            name:name,
            flow : {
                nodes: nodes,
                edges: edges
            }
          }
          console.log('form', _form, JSON.stringify(_form))
          // change the endpoint according to the isEdit flag
          const endpoint = addParamsToEndpoint(getEndpoint('amount_protocol'), {
            protocol_id,
            id: protocol_id
          }) 
          
          request<ProtocolType>(endpoint, _form).then((response) => {
              const protocol = response?.data?.payload
      
              // handleClose()
              // window.location.reload();
              onSaveAdjustment(response);
      
      
      
               // navigator('/protocols/'+protocol_id);
          })
    }
       /**
     * save sensory   
     * @author Bilal
     */
       const saveAndPredict = () => {
        let protocol_id=id
        let _form = {
            protocol:protocol_id,
            sensors:extra,
            name:name,
            flow : {
                nodes: nodes,
                edges: edges
            }
          }
          console.log('form', _form, JSON.stringify(_form))
          // change the endpoint according to the isEdit flag
          const endpoint = addParamsToEndpoint(getEndpoint('save_amount_protocol'), {
            protocol_id,
            id: protocol_id
          }) 
          
          request<ProtocolType>(endpoint, _form).then((response) => {
              const protocol = response?.data?.payload
      
              // handleClose()
              // window.location.reload();
              onSaveAdjustment(response);
      
      
      
               // navigator('/protocols/'+protocol_id);
          })
    }

    const onSaveAdjustment = (response:any)=> {
        console.log('response' , response.data.payload.flow.nodes)
        setNodes([...bindActions(response.data.payload.flow.nodes)])
        setEdges([...response.data.payload.flow.edges])
        setExtra([...response.data.payload.custom_sensory_panels])
        handleOpenModel(false)
        showAlert({
            type: AlertTypes.SUCCESS,
            message: `Protocol adjusted and save successfully`
        })
        setCounter((counter:number) => counter + 1)
    }
    const ExtraAmountModal = () => {
        // return BasicModal(openModel,handleOpenModel,id,extra,setNodes,setEdges,setForm , bindActions , setCounter,callback)
    }

    const handleFormChanges = (name: string , project: number)=>{
        setForm((form:any) => {
            return {
                ...form ,
                name,
                project
            }
        })
        setName(name)
        setProject(project)

        console.log("deeep shit",name , project , form)

    }

  

    return {onSave, onDuplicate, nodes, edges, onNodesChange, onEdgesChange, onConnect, addProtocol,
        counter,openModel , saveSensory ,handleOpenModel,id,extra,setExtra , setForm,projects
        ,openSaveAsRicpeModel,setOpenSaveAsRicpeModel,saveAsRecipe , form , handleFormChanges , isEdit,
        tasteIntensity,setTasteIntensity,aromaIntensity,setAromaIntensity,nutritionInfo,setNutritionInfo,textureMetrics, setTextureMetrics
        ,isDraft, onDraftSave,revertProtocol,onUploda,saveAndPredict}

}

export default useProtocol