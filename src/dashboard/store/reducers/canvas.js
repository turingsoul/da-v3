/**
 * canvas reducer
 * create time: 2018/10/26
 */

const DEFALT_STATE = {
    mapcfg:null
};

export default (state = DEFALT_STATE, action = {}) => {
    const { type, payload } = action;
    switch (type) {
        case 'ADD_MAP_CFG':{
            return {...state,...{mapcfg: action.mapcfg}}
            break;
        }
        default: {
            return state;
        }
    }
};
