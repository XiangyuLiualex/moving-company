import React from 'react';
import homeIcon from '../assets/home_icon.png';

function Header(){
  return(
    <header>
      <img src={homeIcon} alt="Moving Company" />
      <ul>
        <li><a href="">How We Work</a></li>
        <li><a href="">Services</a></li>
        <li><a href="">Free Quote</a></li>
        <li><a href="">Contact</a></li>
      </ul>
    </header>
  )

}

export default Header