import React, { useEffect, useState } from 'react';
import {
    Button,
    EditorToolbarButton,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TextField,
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { v4 as uuid } from 'uuid';

interface FieldProps {
    sdk: FieldExtensionSDK;
}

interface Item {
    id: string;
    key: string;
    value: string;
}

function createItem(): Item {
    return {
        id: uuid(),
        key: '',
        value: '',
    };
}

const Field = (props: FieldProps) => {
    const { valueName = 'Value' } = props.sdk.parameters.instance as any;
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        props.sdk.window.startAutoResizer();

        props.sdk.field.onValueChanged((value: Item[]) => {
            if (Array.isArray(value)) {
                setItems(value);
            }
        });
    });

    const addNewItem = () => {
        props.sdk.field.setValue([...items, createItem()]);
    };

    const updateItemName = (item: Item, property: 'key' | 'value') => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const itemList = items.concat();
        const index = itemList.findIndex((i) => i.id === item.id);

        itemList.splice(index, 1, { ...item, [property]: e.target.value });

        props.sdk.field.setValue(itemList);
    };

    const deleteItem = (item: Item) => {
        props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
    };

    return (
        <div>
            <Table>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <TextField
                                    id="key"
                                    name="key"
                                    labelText="Item Name"
                                    value={item.key}
                                    onChange={updateItemName(item, 'key')}
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    id="value"
                                    name="value"
                                    labelText={valueName}
                                    value={item.value}
                                    onChange={updateItemName(item, 'value')}
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
                    ))}
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
