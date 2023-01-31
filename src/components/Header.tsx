import React from 'react';
import homeIcon from '../assets/home_icon.png';

function Header(){
  return(
    <header>
      <img src={homeIcon} alt="Moving Company" />
      <ul>
        <li><a href="http://">How We Work</a></li>
        <li><a href="http://">Services</a></li>
        <li><a href="http://">Free Quote</a></li>
        <li><a href="http://">Contact</a></li>
      </ul>
    </header>
  )

}

export default Header