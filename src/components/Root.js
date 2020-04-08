import React from 'react'
import PropTypes from 'prop-types'
import { Provider, connect } from 'react-redux'
import TABOO_CARDS from './taboo-cards.json'
console.log(TABOO_CARDS)



class Timer extends React.Component {
    constructor(props) {
        super(props)
        this.countDown = this.countDown.bind(this)
        this.state = {
            time: 30,
            timer_id: null
        }
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

    componentDidMount() {
        const timer_id = setInterval(
            this.countDown, 1000);
        this.setState({timer_id})
    }

    render() {
        const {time} = this.state
        let text = ''
        if (time > 0) {
            text = `${time} seconds remaining`
        } else {
            text = "TIME'S UP!"
        }

        return (
            <div id='timer'>{text}</div>
        )
    }

}

class TabooCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            card: TABOO_CARDS[Math.floor(Math.random() * TABOO_CARDS.length)]
        }
    }

    componentDidMount() {
        console.log('[TabooCard.ComponentDidMount]')
    }

    render() {
        const {main_word, banned_words} = this.state.card
        return (
            <div id='taboo-card'>
                <div id='main-word'>
                    {main_word}
                </div>
                <div id='banned-words'>
                    <p>Do NOT mention these words:</p>
                    <ul>
                        {banned_words.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>
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
            <div>
                <Timer />
                <TabooCard />
            </div>
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
