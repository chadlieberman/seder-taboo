import io from 'socket.io-client'
import store from './index'

import { removePlayer, setNotification, resetNotification } from './actions'

const NOTIFICATION_TIME = 3000

// Setup socket
const socket = io(window.location.href)
socket.on('connected', () => {
    //console.log('server connected')
    store.dispatch({type: 'CONNECTED'})
})
socket.on('reconnect', () => {
    //console.log('client reconnected')
    store.dispatch(setNotification(
        'success',
        'Server reconnected'))
    setTimeout(() => {
        store.dispatch(resetNotification())
    }, NOTIFICATION_TIME)
})
socket.on('message', data => {
    //console.log('got message')
    //console.log(data)
})
socket.on('action', action => {
    //console.log('received action', action)
    store.dispatch(action)
})
socket.on('disconnect', () => {
    //console.log('server disconnected')
    store.dispatch({type: 'DISCONNECTED'})
    store.dispatch(setNotification(
        'error',
        'Server disconnected'))
})

window.onbeforeunload = () => {
    const state = store.getState()
    const { me } = state
    const { player_number } = me
    if (player_number !== null) {
        store.dispatch(removePlayer(player_number))
    }
    socket.disconnect()
}

export default socket
