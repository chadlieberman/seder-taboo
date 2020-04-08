
const initial_state = {
    members: []
}

const room = (state = initial_state, action) => {
    let members
    const { name } = action
    switch (action.type) {
        case 'REPLACE':
            return Object.assign({}, state, {...action.room})

        case 'ADD_MEMBER':
            members = state.members
            members.push(name)
            return Object.assign({}, state, {
                members
            })
        case 'REMOVE_MEMBER':
            members = state.members.filter(member => {
                return member !== name
            })
            return Object.assign({}, state, {
                members
            })
        default:
            return state
    }
}

export default room
