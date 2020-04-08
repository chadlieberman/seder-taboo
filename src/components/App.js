import React from 'react';
import { Card } from './Card'

const COLORS = ['red', 'orange', 'blue', 'green', 'purple', 'yellow']
const noOp = () => {}

const Discards = ({ discards, moveCard, flipCard }) => {
    const onDrop = (e) => {
        e.preventDefault()
        const card_id = e.dataTransfer.getData('draggable_id')
        moveCard(card_id, 'discard')
    }
    return (
        <div id='discards-container'>
            <h2>Discards</h2>
            <div id='discards'
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                {discards.map((card, idx) => (
                    <Card card={card} key={idx}
                        position={`discard-${idx}`}
                        moveCard={moveCard}
                        flipCard={noOp}
                    />
                ))}
            </div>
        </div>
    )
}

class Collect extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            confirming: false
        }
        this.doCollect = this.doCollect.bind(this)
        this.askConfirm = this.askConfirm.bind(this)
    }

    askConfirm() {
        this.setState({
            confirming: true
        }, () => {
            setTimeout(() => {
                this.setState({
                    confirming: false
                })
            }, 1000)
        })
    }

    doCollect() {
        this.props.collectCards(this.props.player_number)
        this.setState({
            confirming: false
        })
    }

    render() {
        const { confirming } = this.state
        if (confirming) {
            return (
                <button onClick={() => this.doCollect()}>
                    Confirm
                </button>
            )
        } else {
            return (
                <button onClick={() => this.askConfirm()}>
                    Collect
                </button>
            )
        }
    }
}

const Hand = ({ player_number, cards, moveCard, flipCard, shuffleHand, is_me, collectCards }) => {
    return (
        <div className='hand'>
            {cards.map((card, idx) => (
                <Card card={card} key={idx}
                    position={`player-${player_number}-hand-${idx}`}
                    moveCard={moveCard}
                    flipCard={is_me ? flipCard : noOp}
                    is_me={is_me}
                    in_hand={true}
                />
            ))}
            {is_me && (
                <div className='hand-actions'>
                    <button className='shuffle' onClick={() => shuffleHand(player_number)}>
                        Shuffle
                    </button>
                    <Collect player_number={player_number} collectCards={collectCards} />
                </div>
            )}
        </div>
    )
}

const Stack = ({ player_number, cards, moveCard, flipCard, is_last_stack }) => {
    const onDrop = (e) => {
        e.preventDefault()
        const card_id = e.dataTransfer.getData('draggable_id')
        const position = `player-${player_number}-stack`
        moveCard(card_id, position)
    }
    const class_name = is_last_stack ? 'last' : ''
    return (
        <div className={`stack ${class_name}`}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            {cards.map((card, idx) => (
                <Card card={card} key={idx}
                    position={`player-${player_number}-stack`}
                    moveCard={moveCard}
                    flipCard={flipCard}
                />
            ))}
        </div>
    )
}

const Seat = (props) => {
    if (props.player === null) {
        return <NullPlayer {...props} />
    } else {
        return <NonNullPlayer {...props} />
    }
}

const NullPlayer = ({ player_number, player, me, addPlayer }) => {
    const sitDown = () => {
        if (me.name === null) return
        addPlayer(player_number, me.name)
    }
    return (
        <div id={`player-${player_number}`} className='player-section'>
            <div className={`player ${COLORS[player_number]}`} />
            <div className='buttons'>
                {me.name !== null && me.player_number === null &&
                    <button onClick={sitDown}>
                        Sit Down
                    </button>
                }
            </div>
        </div>
    )
}

const NonNullPlayer = ({ player_number, player, me, removePlayer }) => {
    const standUp = () => {
        removePlayer(player_number)
    }
    return (
        <div id={`player-${player_number}`} className='player-section'>
            <div className={`player ${COLORS[player_number]}`}>
                {player.name}
            </div>
            <div className='buttons'>
                {me.player_number !== null && player_number === me.player_number &&
                    <button onClick={standUp}>
                        Stand Up
                    </button>
                }
            </div>
        </div>
    )
}

class GetName extends React.Component {
    constructor(props) {
        super(props)
        this.onChangeName = this.onChangeName.bind(this)
        this.enterGame = this.enterGame.bind(this)
        this.state = {
            name: '',
            error: null
        }
    }

    componentDidMount() {
        //console.log('GetName.componentDidMount()')
    }

    onChangeName(e) {
        this.setState({
            name: e.target.value
        })
    }

    enterGame() {
        const { name } = this.state
        if (this.props.taken_names.includes(name)) {
            this.setState({
                error: 'That name is already taken'
            })
            return
        }
        if (name.length > 10) {
            this.setState({
                error: 'Name cannot be more than ten characters'
            })
            return
        }
        if (name.length < 2) {
            this.setState({
                error: 'Name must be at least two characters'
            })
            return
        }
        if (!(/[a-z]+$/.test(name))) {
            this.setState({
                error: 'Name must be only [a-z] characters'
            })
            return
        }
        this.props.setName(name)
    }

    render() {
        const { name, error } = this.state
        const { connection } = this.props
        return (
            <div id='intro'>
                <h1>Skull</h1>
                <img alt={'skull'} src={'/static/img/skull.png'} />
                <h3>It is always a skull</h3>
                {connection.is_connected && (
                    <div id='set-name'>
                        <p>Enter your name (only use [a-z])</p>
                        <input type='text' value={name} onChange={this.onChangeName} />
                        <button onClick={this.enterGame}>
                            Enter
                        </button>
                        {error && (
                            <div className='error'>{error}</div>
                        )}
                    </div>
                )}
                {!connection.is_connected && (
                    <div id='set-name'>
                        <h3>Connecting...</h3>
                    </div>
                )}
            </div>
        )
    }
}

const PlayerSection = ({ player_section, is_me, me, addPlayer, removePlayer, player_number, flipCard, moveCard, flipMat, shuffleHand, is_last_stack, collectCards }) => {
    const { player, hand, stack, mat } = player_section
    return (
        <div className='player-section'>
            <Stack
                player_number={player_number}
                cards={stack}
                moveCard={moveCard}
                flipCard={flipCard}
                is_last_stack={is_last_stack}
            />
            <Mat {...mat}
                flipMat={flipMat}
            />
            <Seat
                player={player}
                me={me}
                addPlayer={addPlayer}
                removePlayer={removePlayer}
                player_number={player_number}
            />
            <Hand
                player_number={player_number}
                cards={hand}
                moveCard={moveCard}
                flipCard={flipCard}
                shuffleHand={shuffleHand}
                collectCards={collectCards}
                is_me={is_me}
            />
        </div>
    )
}

PlayerSection.defaultProps = {
    is_last_stack: false
}

const Mat = ({id, color, is_flipped, flipMat}) => {
    const onDoubleClick = () => {
        flipMat(id)
    }
    return (
        <div className={`mat ${color}`} onDoubleClick={onDoubleClick}>
            {is_flipped && (
                <img alt={'flipped mat'} src={'/static/img/mat-flipped.png'} />
            )}
            {!is_flipped && (
                <img alt={'unflipped mat'} src={'/static/img/mat-unflipped.png'} />
            )}
        </div>
    )
}

let App = ({me, room, game, connection, moveCard, flipCard, flipMat, addPlayer, removePlayer, setName, shuffleHand, collectCards}) => {
    if (me.name === null) {
        return (
            <GetName setName={setName} taken_names={room.members} connection={connection} />
        )
    }
    let {discards, cards, hands, mats, stacks} = game
    discards = discards.map(card_id => {
        return card_id === null ? null : cards[card_id]
    })
    hands = hands.map(hand => {
        hand = hand.map(card_id => {
            return card_id === null ? null : cards[card_id]
        })
        return hand
    })
    stacks = stacks.map(stack => {
        stack = stack.map(card_id => {
            return card_id === null ? null : cards[card_id]
        })
        return stack
    })
    const player_sections = game.players.map((player, idx) => {
        return {
            player,
            hand: hands[idx],
            stack: stacks[idx],
            mat: mats[`mat_${idx}`]
        }
    })
    return (
        <div id='app'>
            <div id='main'>
                {player_sections.map((player_section, player_number) => {
                    const is_me = me.player_number === player_number
                    const is_last_stack = game.last_stack_idx !== null && player_number - game.last_stack_idx === 0
                    return <PlayerSection player_section={player_section} is_me={is_me} me={me} addPlayer={addPlayer} removePlayer={removePlayer} player_number={player_number} key={player_number} moveCard={moveCard} flipCard={flipCard} flipMat={flipMat} shuffleHand={shuffleHand} is_last_stack={is_last_stack} collectCards={collectCards} />
                })}
            </div>
            <div id='sidebar'>
                <Discards discards={discards} moveCard={moveCard} flipCard={flipCard} />
                <div id='room-container'>
                    <h2>Room</h2>
                    <ul id='members'>
                        {room.members.map((member, idx) => (
                            <li key={idx}>
                                <img alt={'user icon'} src={'/static/img/fa-user.png'} /><span>{member}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default App
