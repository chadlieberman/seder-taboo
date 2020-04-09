import React from 'react'
import PropTypes from 'prop-types'
import { Provider, connect } from 'react-redux'
import fetch$ from 'kefir-fetch'

const base_url = window.location.href.includes('localhost')
    ? 'http://localhost:5000/'
    : window.location.href

const API_BASE_URL = base_url + 'api'

const Card = ({main_word, banned_words}) => (
    <div id='taboo-card'>
        <div id='main-word'>
            {main_word}
        </div>
        <div id='banned-words'>
            <ul>
                {banned_words.map((w, i) => (
                    <li key={i}>{w}</li>
                ))}
            </ul>
        </div>
    </div>
)

const initial_state = {
    time: 30,
    timer_id: null,
    cards: null,
    card_idx: null,
    got: 0,
    pass: 0,
    buzz: 0
}

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.countDown = this.countDown.bind(this)
        this.shuffle = this.shuffle.bind(this)
        this.start = this.start.bind(this)
        this.setCards = this.setCards.bind(this)
        this.gotIt = this.gotIt.bind(this)
        this.buzz = this.buzz.bind(this)
        this.pass = this.pass.bind(this)
        this.markUsed = this.markUsed.bind(this)
        this.state = initial_state
    }

    componentDidMount() {
        fetch$('get', API_BASE_URL + '/cards')
            .onValue(this.setCards)
            .onError((resp) => {
                console.error(resp)
            })
    }

    setCards(resp) {
        console.log('setCards', resp)
        const {cards} = resp
        console.log('cards =', cards)
        this.setState({cards})
    }

    shuffle() {
        const {timer_id} = this.state
        clearTimeout(timer_id)
        fetch$('post', API_BASE_URL + '/cards/shuffle')
            .onValue((resp) => {
                console.log('shuffle response =', resp)
                this.setState(initial_state)
                this.setCards(resp)
            })
            .onError((resp) => {
                console.error(resp)
            })
    }

    countDown() {
        const {time, timer_id} = this.state
        if (time === 0) {
            clearTimeout(timer_id)
        } else {
            this.setState({
                time: time - 1
            })
        }
    }

    buzz(card_id) {
        const {buzz} = this.state
        this.setState({buzz: buzz+1})
        this.markUsed(card_id)
    }

    gotIt(card_id) {
        const {got} = this.state
        this.setState({got: got + 1})
        this.markUsed(card_id)
    }

    pass(card_id) {
        const {pass} = this.state
        this.setState({pass: pass + 1})
        this.markUsed(card_id)
    }

    markUsed(card_id) {
        let {cards, card_idx} = this.state
        cards = cards.map((c, idx) => {
            if (c.id === card_id) {
                c.used = true
            }
            return c
        })
        card_idx = Math.min(cards.length - 1, card_idx + 1)
        this.setState({
            cards,
            card_idx
        })
        fetch$('post', API_BASE_URL + `/cards/${card_id}`, {body: {used: true}})
            .onValue(() => {})
            .onError((v) => {console.error(v)})
    }

    start() {
        const {card_idx} = this.state
        if (card_idx !== null) return
        this.setState({
            card_idx: 0
        }, () => {
            const timer_id = setInterval(
                this.countDown, 1000);
            this.setState({timer_id})
        })
    }

    render() {
        const {time, card_idx, cards, got, pass, buzz} = this.state
        let timer_text = ''
        let timer_style = {}
        if (time >= 10) {
            timer_text = `00:${time}`
        } else if (time > 0) {
            timer_text = `00:0${time}`
            timer_style = {
                background: '#ffd387',
            }
        } else {
            timer_text = "00:00"
            timer_style = {
                background: '#b81200',
                color: 'white'
            }
        }

        const card = card_idx !== null ? cards[card_idx] : null
        const num_cards = cards !== null ? cards.filter((c) => !c.used).length : null
        return (
            <div id='appscreen'>
                <div id='game'>
                    <div id='score-area'>
                        <div id='score'>Score: {got - pass - buzz}</div>
                        <div id='timer'><span style={timer_style}>{timer_text}</span></div>
                    </div>
                    {card !== null && (
                        <div id='card-area'>
                            <div id='play-controls'>
                                <button id='got' onClick={() => this.gotIt(card.id)}><i className='fa fa-check-square' />Got it!</button>
                                <button id='buzz' onClick={() => this.buzz(card.id)}><i className='fa fa-bell' />Buzz!</button>
                                <button id='pass' onClick={() => this.pass(card.id)}><i className='fa fa-arrow-right' />Pass</button>
                            </div>
                            <Card {...card} />
                        </div>
                    )}
                    {card === null && num_cards > 0 && (
                        <div id='card-area'>
                            <button id='start' onClick={this.start}>Start</button>
                        </div>
                    )}
                    {card === null && num_cards == 0 && (
                        <div id='card-area'>
                            <p>No more cards remaining. <a onClick={this.shuffle}>Shuffle</a> to play again.</p>
                        </div>
                    )}
                </div>
                {num_cards !== null && (
                    <p id='remaining'>There are {num_cards} cards remaining in the deck</p>
                )}
                <div id='shuffling'>
                    <p>Only click this when the whole game is over... it completely resets everything!</p>
                    <button onClick={this.shuffle}>Shuffle</button>
                </div>
            </div>
        )
    }
}

class Container extends React.Component {

    componentDidMount() {
        //console.log('Container.componentDidMount')
        //console.log('this.props.connection.is_connected', this.props.connection.is_connected)
    }

    render() {
        //console.log('props = ', this.props)
        return (
            <Game />
        )
    }
}

Container = connect(
    state => {
        return state
    },
    dispatch => {
        return {}
    }
)(Container)

const Root = ({ store }) => (
    <Provider store={store}>
        <Container />
    </Provider>
)

Root.propTypes = {
    store: PropTypes.object.isRequired
}

export {
    Root,
}
