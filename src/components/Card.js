import React from 'react'
import { connect } from 'react-redux'

const NullCard = ({ position, moveCard }) => {
    const onDrop = (e) => {
        e.preventDefault()
        const card_id = e.dataTransfer.getData('draggable_id')
        moveCard(card_id, position)
    }
    return (
        <div className='card null'
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
        />
    )
}

const NonNullCard = ({ id, color, type, is_flipped, flipCard, is_me, in_hand }) => {
    const onDragStart = (e) => {
        e.dataTransfer.setData('draggable_id', e.target.id)
    }
    const onDoubleClick = () => {
        flipCard(id)
    }
    const src = `/static/img/${type}.png`
    return (
        <div className={`card ${color}`} id={id}
            draggable={true}
            onDragStart={onDragStart}
            onDoubleClick={onDoubleClick}
        >
            {in_hand && is_me && !is_flipped && (
                <img className={'is_me'} alt={'card front'} src={src} />
            )}
            {is_flipped && (
                <img src={src} alt={'card back'} />
            )}
        </div>
    )
}

const Card = ({ position, card, moveCard, flipCard, is_me, in_hand }) => {
    if (card === null) {
        return <NullCard position={position} moveCard={moveCard} />
    } else {
        return <NonNullCard {...card} flipCard={flipCard} is_me={is_me} in_hand={in_hand} />
    }
}

Card.defaultProps = {
    in_hand: false
}

const Cards = ({ cards }) => (
    <div className='cards'>
        {cards.map(card => (
            <Card card={card} key={card.id} />
        ))}
    </div>
)

class CardsContainer extends React.Component {
    componentDidMount() {
        console.log('CardsContainer.componentDidMount')
    }

    render() {
        const { cards } = this.props
        return (
            <Cards cards={cards} />
        )
    }
}

CardsContainer = connect(
    state => {
        const { items, item_ids} = state.cards
        const cards = [...item_ids].map(id => items[id])
        return {cards}
    }
)(CardsContainer)

export {
    Card,
    Cards,
    CardsContainer,
}
