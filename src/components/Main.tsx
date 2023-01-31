import React, { useState } from 'react';
import Item from './Item';
import bedsIcon from '../assets/bed.png';
import fridgeIcon from '../assets/fridge.png';
import furnitureIcon from '../assets/furniture.png';
import ovenIcon from '../assets/oven.png';
import sofaIcon from '../assets/sofa.png';
import tvIcon from '../assets/tv.png';
import washerIcon from '../assets/washer.png';
import diningIcon from '../assets/dining.png';
import deskIcon from '../assets/desk.png';
import wardrobeIcon from '../assets/wardrobe.png';

import '../styles/main.scss';

function Main(){
  const [totalItems, setTotalItems] = useState(0);
  const [totalm2, setTotalm2] = useState(0);
  const [reset, setReset] = useState(false);

  function resetItems(): void {
    setReset(true);
    setTotalItems(0);
    setTotalm2(0);
    setTimeout(() => {
      setReset(false);
    }, 0);
  }
  
  function addItem(quantity: number, meterMultiplier: number): void {
    setTotalItems(prevNumber => prevNumber + quantity);
    setTotalm2(prevNumber => prevNumber + meterMultiplier)
  }

  function roundDecimals(num: number){
    return Math.round(num * 100) / 100;
  }

  return (
    <main>
      <div className="title">
        <h1>What items to store?</h1>
        <p>
          Select which items you wish to store before moving to your new home.
          We'll keep 'em safe!
        </p>
      </div>
      <div className="items">
        <Item
          name="Beds"
          image={bedsIcon}
          multiplier={1.2}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name="Fridge"
          image={fridgeIcon}
          multiplier={1}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name="Furniture"
          image={furnitureIcon}
          multiplier={0.5}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name="Oven"
          image={ovenIcon}
          multiplier={0.6}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name="Sofa"
          image={sofaIcon}
          multiplier={1.5}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name="Tv"
          image={tvIcon}
          multiplier={0.25}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name="Washer-dryer"
          image={washerIcon}
          multiplier={0.5}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name="Dining"
          image={diningIcon}
          multiplier={2}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name="Desk"
          image={deskIcon}
          multiplier={0.75}
          reset={reset}
          addItem={addItem}
        />
        <Item
          name="Wardrobe"
          image={wardrobeIcon}
          multiplier={3.2}
          reset={reset}
          addItem={addItem}
        />
      </div>
      <div className="buttons">
        <button id="clear" onClick={resetItems}>
          Clear
        </button>
        <button id="calculate">Calculate</button>
      </div>
      <div className="summary">
        <h1>Summary</h1>
        <table>
          <tbody>
            <tr>
              <td>Total Items</td>
              <td>{totalItems}</td>
            </tr>
            <tr>
              <td>Total M2</td>
              <td>{roundDecimals(totalm2)}</td>
            </tr>
            <tr>
              <td>Subtotal</td>
              <td>{`$${roundDecimals(totalm2 * 200)}`}</td>
            </tr>
            <tr>
              <td>Tax</td>
              <td>{`$${roundDecimals(totalm2 * 200 * 0.16)}`}</td>
            </tr>
            <tr>
              <td>Total</td>
              <td>{`$${roundDecimals(
                totalm2 * 200 + totalm2 * 200 * 0.16
              )}`}</td>
            </tr>
            <tr>
              <td>Due Today 50%</td>
              <td>{`$${roundDecimals(
                (totalm2 * 200 + totalm2 * 200 * 0.16) / 2
              )}`}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );

}

export default Main