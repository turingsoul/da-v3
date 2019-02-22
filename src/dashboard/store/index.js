import { createStore, combineReducers, applyMiddleware } from "redux";
import * as reducers from "./reducers";

const reducer = combineReducers(reducers);

// Store
const store = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
