import React from 'react';

interface ItemProps {
  name: string;
  image: string;
  quantity: number;
}

function Item({ name, image, quantity }: ItemProps){
  return (
    <article>
      <div className="item-name">
        <img src={image} alt={name} />
        <h1>{name}</h1>
      </div>
      <div className="item-quantity">
        <button>-</button>
        <h1>{quantity}</h1>
        <button>+</button>
      </div>
    </article>
  );
}

export default Item;