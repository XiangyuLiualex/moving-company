import React, { useState, useEffect } from 'react';

interface ItemProps {
  name: string;
  image: string;
  multiplier: number;
  reset: boolean;
  addItem: (arg0: number, arg1: number) => void;
}

function Item({ name, image, multiplier, reset, addItem }: ItemProps){
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if(reset){
      setQuantity(0);
    }
  }, [reset]);

  function add(){
    addItem(1, multiplier);
      setQuantity(prevQuantity => prevQuantity + 1);
  }

  function remove(){
    if(quantity > 0){
      addItem(-1, -multiplier);
      setQuantity(prevQuantity => prevQuantity -  1);
    }
  }

  return (
    <article>
      <div className="item-name">
        <img src={image} alt={name} />
        <h1>{name}</h1>
      </div>
      <div className="item-quantity">
        <button onClick={remove}>-</button>
        <h1>{quantity}</h1>
        <button onClick={add}>+</button>
      </div>
    </article>
  );
}

export default Item;