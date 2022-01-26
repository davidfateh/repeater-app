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

interface FieldProps {
    sdk: FieldExtensionSDK;
}

interface InitialState {
    selectedValue: string
    items: Item[]
    dirty: boolean
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
*/
function createItem(): Item {
    return {
        id: uuid(),
        key: '',
        value: [''],
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
        dirty: false
    }
    const { template = 'globalSettings' } = props.sdk.parameters.instance as any;
    const [state, setState] = useState<InitialState>(initState);

    if (state.items.length === 0){
        setState({...state, selectedValue: template})
        const settings = getClass(template)
        const fields = settings.getFields()
        const items = buildFields(fields)
        setState({...state, items: items, dirty: true})
    }

    // Just in case there are single text in the json change to array.
    state.items.map(item =>{
        if (!Array.isArray(item.value)){
            item.value = [item.value]
            return item
        }
        return item
    })

    useEffect(() => {
        // This ensures our app has enough space to render
        props.sdk.window.startAutoResizer();

        // Every time we change the value on the field, we update internal state
        props.sdk.field.onValueChanged((value: Item[]) => {
            if (Array.isArray(value) && state.dirty) {
                console.log( 'state is dirty', value );
                setState({...state, items: value, dirty: false});
            }
        });
    });

    /** Adds another item to the list */
    const addNewItem = () => {
        props.sdk.field.setValue([...state.items, createItem()]);
    };

    /** Creates an `onChange` handler for an item based on its `property`
     * @returns A function which takes an `onChange` event
    */
    const createOnChangeHandler = (item: Item, property: 'key' | 'value') => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const itemList = state.items.concat();
        const index = itemList.findIndex((i) => i.id === item.id);
        itemList.splice(index, 1, { ...item, [property]: e.target.value });
        props.sdk.field.setValue(itemList);
    };

    const dropDownChangeHandler = () => (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value

        // When the select is changed remove the current settings
        props.sdk.field.setValue([]);
        const settings = getClass(selected)
        const fields = settings.getFields()
        const items = buildFields(fields)
        setState({...state, items: items})
        props.sdk.field.setValue(state.items);

    };

    /** Deletes an item from the list */
    const deleteItem = (item: Item) => {
        props.sdk.field.setValue(state.items.filter((i) => i.id !== item.id));
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
                    {state.items.map((item) => {
                        const key = item.key.split('-')
                        const styledWord = key.map((word) => {
                            return word[0].toUpperCase() + word.substring(1);
                        }).join(" ");
                        console.log( 'value', item.value );
                        return (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <TextField
                                        id="value"
                                        name="value"
                                        labelText={styledWord}
                                        value={item.value ? item.value.join(',') : ''}
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
