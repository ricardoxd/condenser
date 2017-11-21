import React from 'react';
import { storiesOf } from '@storybook/react';
import PasswordInput from './PasswordInput';

storiesOf('Elements', module)
    .add('PasswordInput', () => (
        <PasswordInput />
    ));