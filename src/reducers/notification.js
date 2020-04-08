const initial_state = {
    notification_type: 'hidden',
    message: null
}

const notification = (state = initial_state, action) => {
    const { notification_type, message } = action
    switch (action.type) {
        case 'SET_NOTIFICATION':
            return Object.assign({}, state, {
                notification_type,
                message
            })
        case 'RESET_NOTIFICATION':
            return initial_state
        default:
            return state
    }
}

export default notification
