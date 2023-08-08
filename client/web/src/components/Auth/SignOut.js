/**
 * src/components/Auth/SignOut.jsx
 * sign out
 *
 * created by Lynchee on 7/20/23
 */

import React from 'react';
import auth from '../../utils/firebase';
import { signOut } from 'firebase/auth';
import Avatar from '@mui/material/Avatar';
import {
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import './styles.css';

const SignOut = ({ isLoggedIn, user, handleDisconnect }) => {
  const signout = async () => {
    signOut(auth)
      .then(() => {
        console.log('Sign-out successful.');
        isLoggedIn.current = false;
      })
      .catch(error => {
        console.log(`Sign-out failed: ${error.message}`);
      });

    handleDisconnect();
  };

  const handleSignout = async () => {
    await signout();
  };

  const handleDropdownAction = async actionKey => {
    if (actionKey === 'logout') {
      // when a dropdown button is pressed using its "key" ,which we set, we can tell when its pressed , so when the key "logout" is pressed we sign the user out, in the future you can use the key "profile" to navigate the user to his dashboard for example
      await handleSignout();
    }
  };

  return (
    <NavbarContent justify='end'>
      <Dropdown placement='bottom-right' className='dropdown'>
        <NavbarItem>
          {/* This is what triggers user info dropdown */}
          <DropdownTrigger>
            <Avatar
              className='usericon'
              color='warning'
              size='md'
              src={user.photoURL}
              alt={user.displayName}
            />
          </DropdownTrigger>
        </NavbarItem>
        <DropdownMenu
          aria-label='User menu actions'
          onAction={actionKey => handleDropdownAction(actionKey)}
          className='dropdown-menu'
        >
          {/* This ^ is probably gonna be needed for future features,actionkey tells you what dropdown the user clicked*/}
          <DropdownItem className='dropdown-item' key='profile'>
            Signed in as
            <br />
            {user.email}
          </DropdownItem>
          <DropdownItem
            key='logout'
            className='dropdown-logout'
            withDivider
            color='warning'
          >
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </NavbarContent>
  );
};

export default SignOut;
