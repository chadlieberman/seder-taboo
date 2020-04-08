export const logger = store => next => action => {
    //console.log('action =', action)
    let result = next(action)
    return result
}
