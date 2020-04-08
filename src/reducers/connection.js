const initial_state = {
    is_connected: false,
    has_connected: false,
}

const connection = (state = initial_state, action) => {
    switch (action.type) {
        case 'CONNECTED':
            return Object.assign({}, state, {
                is_connected: true,
                has_connected: true,
            })
        case 'DISCONNECTED':
            return Object.assign({}, state, {
                is_connected: false
            })
        default:
            return state
    }
}

export default connection
