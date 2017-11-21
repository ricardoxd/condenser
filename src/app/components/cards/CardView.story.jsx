import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import rootReducer from 'app/redux/RootReducer';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CardView from './CardView';

const store = createStore(rootReducer);


storiesOf('Cards', module)
    .addDecorator(getStory => (
        <Provider
            store={store}
        >
            {getStory()}
        </Provider>
    ))
    .add('CardView', () => (
        <CardView
        />
    ));
