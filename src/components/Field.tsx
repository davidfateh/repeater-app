import React, { useEffect, useState } from 'react';
import {
    Button,
    EditorToolbarButton,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TextField, Select, Option, Subheading
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { v4 as uuid } from 'uuid';

interface FieldProps {
    sdk: FieldExtensionSDK;
}

/** An Item which represents an list item of the repeater app */
interface Item {
    id: string;
    key: string;
    value: string;
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

/** The Field component is the Repeater App which shows up
 * in the Contentful field.
 *
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {
    const { valueName = 'Value' } = props.sdk.parameters.instance as any;
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        // This ensures our app has enough space to render
        props.sdk.window.startAutoResizer();

        // Every time we change the value on the field, we update internal state
        props.sdk.field.onValueChanged((value: Item[]) => {
            if (Array.isArray(value)) {
                setItems(value);
            }
        });
    });

    /** Adds another item to the list */
    const addNewItem = () => {
        props.sdk.field.setValue([...items, createItem()]);
    };

    /** Creates an `onChange` handler for an item based on its `property`
     * @returns A function which takes an `onChange` event
    */
    const createOnChangeHandler = (item: Item, property: 'key' | 'value') => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const itemList = items.concat();
        const index = itemList.findIndex((i) => i.id === item.id);

        itemList.splice(index, 1, { ...item, [property]: e.target.value });

        props.sdk.field.setValue(itemList);
    };

    const dropDownChangeHandler = () => (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value
        // When the select is changed remove the current settings
        props.sdk.field.setValue([]);
        if (selected === 'returnsSettings'){
            const items = [
                {
                    id: uuid(),
                    key: 'returns-cta-button-copy',
                    value: '',
                },
                {
                    id: uuid(),
                    key: 'returns-menu-terms-copy',
                    value: '',
                },
                {
                    id: uuid(),
                    key: 'returns-menu-terms-copy-cta-link',
                    value: '',
                },
                {
                    id: uuid(),
                    key: 'returns-menu-terms-copy-cta-text',
                    value: '',
                },
            ]
            props.sdk.field.setValue(items);
        }
    };

    /** Deletes an item from the list */
    const deleteItem = (item: Item) => {
        props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
    };

    return (
        <div>
            <div className="TypeDropDown" style={{marginBottom: '15px'}}>
                <Select className="TypeDropDown_Select" onChange={dropDownChangeHandler()}>
                    <Option value="globalSettings">Global Settings</Option>
                    <Option value="returnsSettings">Returns Settings</Option>
                </Select>
            </div>
            <Table>
                <TableBody>
                    {items.map((item) => {
                        const key = item.key.split('-')
                        const styledWord = key.map((word) => {
                            return word[0].toUpperCase() + word.substring(1);
                        }).join(" ");
                        return (
                            <TableRow key={item.id}>
                                {/*  <TableCell>
                               <TextField
                                    id="key"
                                    name="key"
                                    labelText="Setting Name"
                                    value={item.key}
                                    onChange={createOnChangeHandler(item, 'key')}
                                    textInputProps={{disabled: true}}
                                />
                            </TableCell>*/}
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
                                <TableCell align="right">
                                    <EditorToolbarButton
                                        label="delete"
                                        icon="Delete"
                                        onClick={() => deleteItem(item)}
                                    />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            <Button
                buttonType="naked"
                onClick={addNewItem}
                icon="PlusCircle"
                style={{ marginTop: tokens.spacingS }}
            >
                Add Item
            </Button>
        </div>
    );
};

export default Field;
