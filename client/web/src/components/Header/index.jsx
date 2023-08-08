/**
 * src/components/Header/index.jsx
 * logo
 *
 * created by Lynchee on 7/16/23
 */

import React from 'react';
import logo from '../../assets/svgs/logo.svg';
import './style.css';
import SignIn from '../Auth/SignIn';
import SignOut from '../Auth/SignOut';
import { Navbar, NavbarBrand, NavbarContent } from '@nextui-org/react';

const Header = ({ user, isLoggedIn, setToken, handleDisconnect }) => (
  <Navbar className='dark'>
    <a href='/'>
      <NavbarBrand id='navbar-brand'>
        <img src={logo} alt='Logo' />
      </NavbarBrand>
    </a>

    <NavbarContent justify='end'>
      {user ? (
        <SignOut
          isLoggedIn={isLoggedIn}
          user={user}
          handleDisconnect={handleDisconnect}
        />
      ) : (
        <SignIn isLoggedIn={isLoggedIn} setToken={setToken} />
      )}
    </NavbarContent>
  </Navbar>
);

export default Header;
