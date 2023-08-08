/**
 * src/pages/CreateChar.jsx
 *
 * created by kivinju on 8/5/23
 */

import React from 'react';

import { Avatar } from '@nextui-org/react';

const Create = theme => {
  return (
    <div className='container dark text-white'>
      <h1 className='flex justify-center mb-8'>Create a Character</h1>
      <div className='flex justify-center'>
        <Avatar showFallback className='' />
      </div>
      <p className='flex justify-center'>Upload an avartar</p>
    </div>
  );
};

export default Create;
