import React from 'react';
import { render } from 'react-dom';

import { FieldExtensionSDK, init, locations } from '@contentful/app-sdk';
import './index.css';

import Field from './components/Field';

init((sdk) => {
    const root = document.getElementById('root');
    const ComponentLocationSettings = [
        {
            location: locations.LOCATION_ENTRY_FIELD,
            component: <Field sdk={sdk as FieldExtensionSDK} />,
        },
    ];

    // Select a component depending on a location in which the app is rendered.
    ComponentLocationSettings.forEach((componentLocationSetting) => {
        if (sdk.location.is(componentLocationSetting.location)) {
            render(componentLocationSetting.component, root);
        }
    });
});
