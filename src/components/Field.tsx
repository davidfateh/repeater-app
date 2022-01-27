import React, {useEffect, useState} from 'react';
import {
    EditorToolbarButton,
    Option,
    Select,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField
} from '@contentful/forma-36-react-components';
import {FieldExtensionSDK} from '@contentful/app-sdk';
import {v4 as uuid} from 'uuid';
import {ReturnSettings} from '../classes/ReturnsSettings';
import {GlobalSettings} from '../classes/GlobalSettings';
import {Item} from '../classes/Item';
import {BaseSettings} from '../classes/BaseSettings';

interface FieldProps {
    sdk: FieldExtensionSDK;
}

interface InitialState {
    selectedValue: string
    items: Item[]
    dirty: boolean,
    class: BaseSettings
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
*/
function createItem(): Item {
    return {
        id: uuid(),
        key: '',
        value: '',
    };
}

function getClass(value: string): any {
    if(value === 'returnsSettings'){
        return new ReturnSettings()
    } else if(value === 'globalSettings'){
        return new GlobalSettings()
    }
}

function buildFields(fields: any): Item[] {

    const fieldKeys = Object.keys(fields)
    return [...Array(fieldKeys.length)].map((_, i) => {
        const fieldName = fieldKeys[i]
        const field = fields[fieldName];
        return {
            id: uuid(),
            key: fieldName,
            value: field
        }
    })
}

/** The Field component is the Repeater App which shows up
 * in the Contentful field.
 *
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {

    const initState : any = {
        selectedValue: '',
        items: [],
        dirty: false,
        class: null
    }
    const { template = 'globalSettings' } = props.sdk.parameters.instance as any;
    const [state, setState] = useState<InitialState>(initState);

    if (state.items.length === 0){
        //setState({...state, selectedValue: template})
        let settings = getClass(template)
        const fields = settings.getFields()
        const items = buildFields(fields)
        setState({...state, selectedValue: template, items: items, class: settings, dirty: true})
        console.log( state );
    }

    useEffect(() => {
        // This ensures our app has enough space to render
        props.sdk.window.startAutoResizer();

        // Every time we change the value on the field, we update internal state
        props.sdk.field.onValueChanged((value: InitialState) => {
            if (value && state.dirty) {
                console.log( 'State is dirty.' );
                setState({...state, items: value.items, dirty: false});
                console.log( state.class );
                state.class.validate(state.items)
            }
        });
    });

    /** Creates an `onChange` handler for an item based on its `property`
     * @returns A function which takes an `onChange` event
    */
    const createOnChangeHandler = (item: Item, property: 'key' | 'value') => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const itemList = state.items.concat();
        // Find the index by the unique ID which is assigned to each item.
        const index = itemList.findIndex((i) => i.id === item.id);
        //Change the field which has been changed by updating the internal state.
        itemList.splice(index, 1, { ...item, [property]: e.target.value });
        // Set the state to dirty before we update the field so it can actually be updated.
        setState({...state, dirty: true})
        // Update the actual contentful JSON field behind the scenes.
        props.sdk.field.setValue({...state, items: itemList});
    };

    const dropDownChangeHandler = () => (e: React.ChangeEvent<HTMLSelectElement>) => {
        // Get the selected element val.
        const selected = e.target.value
        // Grab the correct class.
        const settings = getClass(selected)
        //Grab the fields from the json settings file.
        const fields = settings.getFields()
        // Build the items based on the fields.
        const items = buildFields(fields)
        // Set the state to dirty ready to update.
        setState({...state, dirty: true})
        props.sdk.field.setValue({...state, selectedValue: selected, items: items});
    };

    return (
        <div>
            <div className="TypeDropDown" style={{marginBottom: '15px'}}>
                <Select className="TypeDropDown_Select"
                        onChange={dropDownChangeHandler()}
                        value={state.selectedValue}
                >
                    <Option value="globalSettings">Global Settings</Option>
                    <Option value="returnsSettings">Returns Settings</Option>
                </Select>
            </div>
            <Table>
                <TableBody>
                    {state.items.length > 0 && state.items.map((item) => {
                        const key = item.key.replace( /([A-Z])/g, " $1" );
                        const styledWord = key.charAt(0).toUpperCase() + key.slice(1);
                        console.log( 'value', item.value );
                        return (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <TextField
                                        id="value"
                                        name="value"
                                        labelText={styledWord}
                                        value={item.value}
                                        onChange={createOnChangeHandler(item, 'value')}
                                        textInputProps={{placeholder: 'Enter a value and press enter'}}
                                    />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default Field;
