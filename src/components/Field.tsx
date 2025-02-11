import React, { useEffect, useState } from 'react';
import tokens from '@contentful/forma-36-tokens';
import { FieldExtensionSDK } from '@contentful/app-sdk';
import { v4 as uuid } from 'uuid';
import {Button, Table, FormControl, TextInput, Textarea, IconButton, HelpText, Checkbox} from "@contentful/f36-components";
import { PlusCircleIcon, DeleteIcon } from "@contentful/f36-icons";
import { Pagination } from '@contentful/f36-pagination';
import styled, { keyframes } from 'styled-components';

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

function removeDuplicates(a: number[]) {
    return a.sort((a, b) => a - b).filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

const SearchCheckboxLabel = styled(FormControl.Label)`
  font-size: ${tokens.fontSizeS};
  color: ${tokens.colorTextLightest};
`;
const SearchCheckbox = styled(Checkbox)`
    margin: 0.2rem 2px 0 5px;
`

/** The Field component is the Repeater App which shows up 
 * in the Contentful field.
 * 
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {
    const { 
        valueName = 'Value', 
        keyName = "Item Name", 
        multiLineValues = false,
        usePagination = false,
        defaultPageItems = 100,
        useSearch = false,
    } = props.sdk.parameters.instance as any;
    const [items, setItems] = useState<Item[]>([]);
    const [page, setPage] = useState(0);
    const [pageItems, setPageItems] = useState(defaultPageItems);
    const [searchString, setSearchString] = useState('');
    const [lastEditedItemId, setLastEditedItemId] = useState<string | null>(null);
    const [searchSettings, setSearchSettings] = useState({
        key: true,
        value: true,
    });

    useEffect(() => {
        // This ensures our app has enough space to render
        props.sdk.window.startAutoResizer();

        // Every time we change the value on the field, we update internal state
        props.sdk.field.onValueChanged((value: Item[]) => {
            if (Array.isArray(value)) {
                setItems(value);
            }
        });
    }, [props.sdk.field, props.sdk.window]);

    /** Adds another item to the list */
    const addNewItem = () => {
        const newItem = createItem();
        setLastEditedItemId(newItem.id);
        props.sdk.field.setValue([...items, newItem]);
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

        setLastEditedItemId(item.id);
    };

    /** Deletes an item from the list */
    const deleteItem = (item: Item) => {
        props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
    };

    const filteredItems = items.filter(item =>
        !useSearch
        || searchString === ''
        || item.id === lastEditedItemId
        || (searchSettings.key && item.key?.toString()?.toLowerCase()?.includes(searchString))
        || (searchSettings.value && item.value?.toString()?.toLowerCase()?.includes(searchString))
    );
    let displayItems = filteredItems;
    let numPages = 1
    if (usePagination) {
        displayItems = displayItems.slice(page * pageItems, page * pageItems + pageItems)
        numPages = Math.ceil(filteredItems.length / pageItems)
    }

    const pagination = (usePagination)
        ? (<Pagination
            activePage={page}
            onPageChange={setPage}
            itemsPerPage={pageItems}
            showViewPerPage
            viewPerPageOptions={removeDuplicates([20, 50, 100, defaultPageItems])}
            onViewPerPageChange={setPageItems}
            totalItems={filteredItems.length}
            style={{ marginTop: tokens.spacingS, marginBottom: tokens.spacingS }}
          />)
        : null;

    const newitem = (page === numPages - 1)
        ? (
            <Button
                variant="transparent"
                onClick={addNewItem}
                startIcon={<PlusCircleIcon />}
                style={{ marginTop: tokens.spacingS }}>
                Add Item
            </Button>
        )
        : null;

    const itemInput = (item: Item) => multiLineValues
        ? <Textarea
            name="value"
            value={item.value}
            onChange={createOnChangeHandler(item, 'value')} />
        : <TextInput
            name="value"
            value={item.value}
            onChange={createOnChangeHandler(item, 'value')} />

    const onSearchUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setLastEditedItemId(null);
        setSearchString(e.target.value.toLowerCase());
    }

    const searchSettingsUpdate = (value: any) => {
        if (!value.key && !value.value) {
            return;
        }
        setSearchSettings(value);
    }

    const searchInput = useSearch
        ? <div>
            <FormControl.Label style={{fontSize: tokens.fontSizeS}}>Search items:</FormControl.Label>
            <TextInput
                name="search"
                value={searchString}
                style={{
                    display: "inline-block",
                    fontSize: tokens.fontSizeS,
                    minHeight: "calc(" + tokens.fontSizeS + " + 5px)",
                    padding: "10",
                    width: "50%",
                    marginLeft: tokens.spacingS,
                }}
                onChange={onSearchUpdate}
            />
            <div style={{
                display: "flex",
                fontSize: tokens.fontSizeS,
                color: tokens.colorTextLightest
            }}>
                <SearchCheckboxLabel>Search in:</SearchCheckboxLabel>
                <SearchCheckbox
                    name="search-keys"
                    id="search-keys"
                    isChecked={searchSettings.key}
                    onChange={(e: any) => searchSettingsUpdate({...searchSettings, key: e.target.checked})}
                ></SearchCheckbox>
                <SearchCheckboxLabel>keys</SearchCheckboxLabel>
                <SearchCheckbox
                    name="search-values"
                    id="search-values"
                    isChecked={searchSettings.value}
                    onChange={(e: any) => searchSettingsUpdate({...searchSettings, value: e.target.checked})}
                >
                </SearchCheckbox>
                <SearchCheckboxLabel>values</SearchCheckboxLabel>
            </div>
        </div>
        : null;

    return (
        (<div>
            {searchInput}
            {pagination}
            <Table>
                <Table.Body>
                    {displayItems.map((item) => (
                        <Table.Row key={item.id}>
                            <Table.Cell>
                                <FormControl id="key">
                                    <FormControl.Label>{keyName}</FormControl.Label>
                                    <TextInput name="key" value={item.key} onChange={createOnChangeHandler(item, 'key')} />
                                </FormControl>
                            </Table.Cell>
                            <Table.Cell>
                                <FormControl id="value">
                                    <FormControl.Label>{valueName}</FormControl.Label>
                                    {itemInput(item)}
                                </FormControl>
                            </Table.Cell>
                            <Table.Cell align="right">
                                <IconButton
                                    icon={<DeleteIcon variant="muted"/>}
                                    aria-label="delete"
                                    variant="transparent"
                                    onClick={() => deleteItem(item)}
                                />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
            {newitem}
            {pagination}
        </div>)
    );
};

export default Field;
