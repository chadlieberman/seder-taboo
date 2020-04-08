const initial_state = {
    name: null,
    player_number: null,
}

const me = (state = initial_state, action) => {
    const { name, player_number, game } = action
    switch (action.type) {
        case 'SET_NAME':
            return Object.assign({}, state, { name })
        case 'ADD_PLAYER':
            if (name === state.name) {
                return Object.assign({}, state, { player_number })
            }
            return state
        case 'REMOVE_PLAYER':
            if (player_number === state.player_number) {
                return Object.assign({}, state, { player_number: null })
            }
            return state
        case 'REPLACE':
            const my_name = state.name
            const saved_player_number = game.players.findIndex(p => {
                return p && p.name === my_name
            })
            return Object.assign({}, state, {
                player_number: saved_player_number > -1 ? saved_player_number : null
            })
        default:
            return state
    }
}

export default me
