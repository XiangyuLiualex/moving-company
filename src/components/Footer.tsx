import React from 'react';
import homeIcon from '../assets/home_icon.png';
import twiterIcon from '../assets/twitter.png';
import facebookIcon from '../assets/facebook.png';
import instagramIcon from '../assets/instagram.png';
import whatasppIcon from '../assets/whatsapp.png';

function Footer(){
  return (
    <footer>
      <div>
        <img src={homeIcon} alt="Moving company" />
        <p>
          It is along established fact that a reader will be distracted by the
          readable content of a page whenters
        </p>
        <div className="icons">
          <img src={twiterIcon} alt="" className="icon" />
          <img src={facebookIcon} alt="" className="icon" />
          <img src={instagramIcon} alt="" className="icon" />
        </div>
      </div>
      <ul className="info-list">
        <li>About Us</li>
        <li><a href="">About</a></li>
        <li><a href="">Privacy & Policy</a></li>
        <li><a href="">Terms & Conditions</a></li>
        <li><a href="">Faq</a></li>
      </ul>
      <ul className="info-list">
        <li>Navigate</li>
        <li><a href="">How We Work</a></li>
        <li><a href="">Services</a></li>
        <li><a href="">Faq</a></li>
        <li><a href="">Contact</a></li>
        <li><a href="">Free Qoute</a></li>
      </ul>
      <ul className="info-list">
        <li><a href="">Contact Us</a></li>
        <li>Ricardo Margain 444</li>
        <li>Call: +52 81 1234 5678</li>
        <li>Email: info@challenge.com</li>
        <img src={whatasppIcon} alt="" id="whatsapp"/>
      </ul>
    </footer>
  );

}

export default Footer