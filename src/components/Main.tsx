import React from 'react';
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
        <Item name="Beds" image={bedsIcon} quantity={0} />
        <Item name="Fridge" image={fridgeIcon} quantity={0} />
        <Item name="Furniture" image={furnitureIcon} quantity={0} />
        <Item name="Oven" image={ovenIcon} quantity={0} />
        <Item name="Sofa" image={sofaIcon} quantity={0} />
        <Item name="Tv" image={tvIcon} quantity={0} />
        <Item name="Washer-dryer" image={washerIcon} quantity={0} />
        <Item name="Dining" image={diningIcon} quantity={0} />
        <Item name="Desk" image={deskIcon} quantity={0} />
        <Item name="Wardrobe" image={wardrobeIcon} quantity={0} />
      </div>
      <div className="buttons">
        <button id="clear">Clear</button>
        <button id="calculate">Calculate</button>
      </div>
      <div className="summary">
        <h1>Summary</h1>
        <table>
          <tr>
            <td>Total Items</td>
            <td>12</td>
          </tr>
          <tr>
            <td>Total M2</td>
            <td>8.55</td>
          </tr>
          <tr>
            <td>Subtotal</td>
            <td>$1710</td>
          </tr>
          <tr>
            <td>Tax</td>
            <td>$273.6</td>
          </tr>
          <tr>
            <td>Total</td>
            <td>$1983.6</td>
          </tr>
          <tr>
            <td>Due Today 50%</td>
            <td>$991.8</td>
          </tr>
        </table>
      </div>
    </main>
  );

}

export default Main