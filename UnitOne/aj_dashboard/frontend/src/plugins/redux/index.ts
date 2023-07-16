import breadcrumbs from "./reducers/breadcrumbs";
import alert from './reducers/alert'
import {configureStore} from '@reduxjs/toolkit'
import httpLoader from "./reducers/httpLoader";
import counter from "./reducers/counter";

export const store = configureStore({
    reducer: {
        ...breadcrumbs,
        ...alert,
        ...httpLoader,
        ...counter
    }
})