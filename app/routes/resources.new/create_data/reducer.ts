// TODO: Add reducer logic for the create_data page

export function reducer(state, action) {
    switch (action.type) {
        case "set":
            return { ...state, ...action.data };
        case "reset":
            return { ...action.data };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}