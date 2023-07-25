import {HttpMethodTypes} from "../types/Enums";

export default {
    login : {
        url : '/auth/token',
        method: HttpMethodTypes.POST
    },
    logout:{
        url : '/auth/token/logout',
        method: HttpMethodTypes.POST
    },
    add_user:{
        url : 'users/',
        method: HttpMethodTypes.POST
    },
    find_user : {
        url : 'users/:id',
        method: HttpMethodTypes.GET
    },
    update_user : {
        url : 'users/:id',
        method: HttpMethodTypes.PUT
    },
    all_users : {
        url : 'users/',
        method: HttpMethodTypes.GET
    },
    delete_user : {
        url : 'users/:id',
        method: HttpMethodTypes.DELETE
    },
    delete_users:{
        url : 'users/bulk_destroy',
        method: HttpMethodTypes.POST
    },
    add_protocol : {
        url : 'protocols/',
        method: HttpMethodTypes.POST
    },
    clone_protocols : {
        url : 'protocols/clone',
        method: HttpMethodTypes.POST
    },
    all_protocols:{
        url : 'protocols/',
        method: HttpMethodTypes.GET
    },
    delete_protocol:{
        url : 'protocols/:id',
        method: HttpMethodTypes.DELETE
    },
    delete_protocols:{
        url : 'protocols/bulk_destroy',
        method: HttpMethodTypes.POST
    },
    similar_protocols:{
        url : 'protocols/:id/similar',
        method: HttpMethodTypes.GET
    },
    find_protocol:{
        url : 'protocols/:id',
        method: HttpMethodTypes.GET
    },
    amount_protocol:{
        url : 'protocols/:id/adjustments',
        method: HttpMethodTypes.POST
    },
    save_amount_protocol:{
        url : 'protocols/:id/save_adjustments',
        method: HttpMethodTypes.POST
    },
    update_protocol:{
        url : 'protocols/:id',
        method: HttpMethodTypes.PUT
    },
    add_project : {
        url : 'project/',
        method: HttpMethodTypes.POST
    },
    clone_project : {
        url : 'project/clone',
        method: HttpMethodTypes.POST
    },
    edit_project : {
        url : 'project/:id',
        method: HttpMethodTypes.PATCH
    },
    all_projects : {
        url : 'project/',
        method: HttpMethodTypes.GET
    } ,
    delete_project : {
        url : 'project/:id',
        method: HttpMethodTypes.DELETE
    },
    delete_projects : {
        url : 'project/bulk_destroy',
        method: HttpMethodTypes.POST
    },
    find_project : {
        url : 'project/:id',
        method: HttpMethodTypes.GET
    },
    all_sensors : {
        url : 'sensory-panels/abstract',
        method: HttpMethodTypes.GET
    } ,
    find_setup : {
        url : 'setups/:id',
        method: HttpMethodTypes.GET
    },
    update_setup:{
        url : 'setups/:id',
        method: HttpMethodTypes.PUT
    },
    add_setup : {
        url : 'setups/',
        method: HttpMethodTypes.POST
    },
    delete_setup : {
        url : 'setups/:id',
        method: HttpMethodTypes.DELETE
    },
    all_setups : {
        url : 'setups/',
        method: HttpMethodTypes.GET
    } ,
    cooking_process : {
        url : 'process/',
        method: HttpMethodTypes.GET
    } ,
}
