import {useDispatch} from "react-redux";
import {increment,decrement,printCounter} from "../../plugins/redux/reducers/counter";

export const useCounter = ()=>{
    const dispatch = useDispatch();
    const incrementCounter= ()=> dispatch(increment())
    const decrementCounter= ()=> dispatch(decrement())
    const reCounter= ()=>  dispatch( printCounter() )
     return {incrementCounter,decrementCounter,reCounter}
}