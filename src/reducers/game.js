const COLORS = ['red', 'orange', 'blue', 'green', 'purple', 'yellow']
const CARD_TYPES = ['rose', 'skull']

let cards = [...Array(24).keys()].map(num => ({
    id: `card_${num}`,
    color: COLORS[Math.floor(num / 4)],
    type: CARD_TYPES[(num % 4 === 0) ? 1 : 0],
    is_flipped: false
}))

let mats = [...Array(6).keys()].map(num => ({
    id: `mat_${num}`,
    color: COLORS[num],
    is_flipped: false
}))

// Sample card positions
// first position of player 3's hand
// position = 'player-3-hand-0'
// player 2's stack
// position = 'player-2-stack'
// discard pile
// position = 'discard'

const initial_state = {
    discards: [],
    players: Array(6).fill(null),
    cards: cards.reduce((curr, next) => {
        return Object.assign({}, curr, {
            [next.id]: next
        })
    }, {}),
    hands: [
        cards.slice(0, 4).map(card => card.id),
        cards.slice(4, 8).map(card => card.id),
        cards.slice(8, 12).map(card => card.id),
        cards.slice(12, 16).map(card => card.id),
        cards.slice(16, 20).map(card => card.id),
        cards.slice(20, 24).map(card => card.id)],
    mats: mats.reduce((curr, next) => {
        return Object.assign({}, curr, {
            [next.id]: next
        })
    }, {}),
    stacks: Array(6).fill([]),
    last_stack_idx: null,
}

const removeCard = (removed_card_id) => (card_id) => {
    if (card_id === null){ return null }
    return card_id === removed_card_id ? null : card_id
}

const filterOutCard = (removed_card_id) => (card_id) => {
    return card_id !== removed_card_id
}

const STACK_RE = /player-(?<player_number>\d)-stack/
const HAND_RE = /player-(?<player_number>\d)-hand-(?<hand_position>\d)/

const removeFromAreas = (state, card_ids) => {
    let { discards, hands, stacks } = state
    card_ids.forEach(card_id => {
        discards = discards.filter(filterOutCard(card_id))
        hands = hands.map(hand => {
            return hand.map(removeCard(card_id))
        })
        stacks = stacks.map((stack, idx) => {
            return stack.filter(filterOutCard(card_id))
        })
    })
    return { discards, hands, stacks }
}

const sameColorCards = (color) => (c) => {
    return c.color === color
}

const game = (state = initial_state, action) => {
    let discards, hands, stacks, found, players, mats, areas, last_stack_idx, cards
    const { player_number, name, card_id, to_position, mat_id, perm } = action
    switch (action.type) {

        case 'REPLACE':
            return Object.assign({}, state, {...action.game})

        case 'ADD_PLAYER':
            players = state.players
            players[player_number] = {
                name,
                color: COLORS[player_number]
            }
            return Object.assign({}, state, {
                players
            })

        case 'REMOVE_PLAYER':
            players = state.players
            players[player_number] = null
            return Object.assign({}, state, {
                players
            })

        case 'COLLECT_CARDS':
            if (player_number === null) return state
            const color = COLORS[player_number]
            cards = state.cards
            Object.values(state.cards).forEach(card => {
                if (card.color === color) {
                    cards[card.id].is_flipped = false
                }
            })
            const color_cards_ids = Object.values(cards).filter(sameColorCards(color)).map(c => c.id)
            last_stack_idx = state.last_stack_idx
            areas = removeFromAreas(state, color_cards_ids)
            discards = areas.discards
            stacks = areas.stacks
            hands = areas.hands
            hands[player_number] = color_cards_ids
            if (last_stack_idx && !stacks[last_stack_idx].length) {
                last_stack_idx = null
            }
            return Object.assign({}, state, {
                discards,
                hands,
                stacks,
                cards,
                last_stack_idx,
            })

        case 'FLIP_CARD':
            if (card_id === null || card_id === '') return state
            let new_cards = state.cards
            new_cards[card_id].is_flipped = !new_cards[card_id].is_flipped
            return Object.assign({}, state, {
                cards: new_cards
            })

        case 'MOVE_CARD':
            if (card_id === null || card_id === '') return state
            if (to_position === null || card_id === null || to_position === '' || card_id === '') return state
            // Remove the card from where it is now
            cards = state.cards
            last_stack_idx = state.last_stack_idx
            const card_color = cards[card_id].color
            areas = removeFromAreas(state, [card_id])
            discards = areas.discards
            stacks = areas.stacks
            hands = areas.hands
            if (last_stack_idx && !stacks[last_stack_idx].length) {
                last_stack_idx = null
            }
            // Put the card in it's to_position
            if (to_position.includes('discard')) {
                discards.push(card_id)
                cards[card_id].is_flipped = false
            } else if (to_position.includes('stack')) {
                found = to_position.match(STACK_RE)
                let { player_number } = found.groups
                if (COLORS[player_number] !== card_color) return state
                stacks[player_number].push(card_id)
                last_stack_idx = player_number
            } else if (to_position.includes('hand')) {
                found = to_position.match(HAND_RE)
                let { player_number, hand_position } = found.groups
                if (COLORS[player_number] !== card_color) return state
                hands[player_number][hand_position] = card_id
                cards[card_id].is_flipped = false
            } else {
                console.error(`Could not move card ${card_id} to ${to_position}`)
            }
            return Object.assign({}, state, {
                discards,
                hands,
                stacks,
                cards,
                last_stack_idx,
            })

        case 'SHUFFLE_HAND':
            let new_hand = perm.map(idx => {
                return state.hands[player_number][idx]
            })
            hands = state.hands
            hands[player_number] = new_hand
            return Object.assign({}, state, { hands })

        case 'FLIP_MAT':
            mats = state.mats
            mats[mat_id].is_flipped = !mats[mat_id].is_flipped
            return Object.assign({}, state, { mats })

        default:
            return state
    }
}

export default game
