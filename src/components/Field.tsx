import React, { useEffect, useState } from "react";
import {
  Button,
  EditorToolbarButton,
  Option,
  SelectField,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField
} from "@contentful/forma-36-react-components";
import tokens from "@contentful/forma-36-tokens";
import { FieldExtensionSDK } from "@contentful/app-sdk";
import { v4 as uuid } from "uuid";

interface FieldProps {
  sdk: FieldExtensionSDK;
}

/** An Item which represents an list item of the repeater app */
interface Item {
  id: string;
  key: string;
  value: string;
  thirdField: string;
}

/** A simple utility function to create a 'blank' item
 * @returns A blank `Item` with a uuid
 */
function createItem(): Item {
  return {
    id: uuid(),
    key: "",
    value: "",
    thirdField: ""
  };
}

/** The Field component is the Repeater App which shows up
 * in the Contentful field.
 *
 * The Field expects and uses a `Contentful JSON field`
 */
const Field = (props: FieldProps) => {
  const {
    thirdFieldName = "Third Field Name",
    thirdFieldOptions = "",
    valueName = "Value",
    itemName = "Item Name",
    keyOptions = ""
  } = props.sdk.parameters.instance as any;
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
  const createOnChangeHandler =
    (item: Item, property: "key" | "value" | "thirdField") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const itemList = items.concat();
      const index = itemList.findIndex((i) => i.id === item.id);

      itemList.splice(index, 1, { ...item, [property]: e.target.value });

      props.sdk.field.setValue(itemList);
    };

  /** Deletes an item from the list */
  const deleteItem = (item: Item) => {
    props.sdk.field.setValue(items.filter((i) => i.id !== item.id));
  };

  const createSelectOptionsForThirdFieldOption = () => {
    const options: JSX.Element[] = [];
    const keys = [""].concat(
      thirdFieldOptions.split(";").map((item: string) => item.trim())
    );

    if (keys?.length > 0) {
      keys.forEach((key: string) => {
        options.push(
          <Option key={key} value={key}>
            {key}
          </Option>
        );
      });
    }
    return options;
  };

  const createSelectOptionsForKey = () => {
    const options: JSX.Element[] = [];
    const keys = [""].concat(
      keyOptions.split(";").map((item: string) => item.trim())
    );

    if (keys?.length > 0) {
      keys.forEach((key: string) => {
        options.push(
          <Option key={key} value={key}>
            {key}
          </Option>
        );
      });
    }
    return options;
  };

  /** Determines the correct TableCell content based on presence of "key options" on the instnace */
  const renderKeyTableCell = (item: Item) => {
    if (keyOptions?.length > 0) {
      return (
        <SelectField
          className="TypeDropDown_Select"
          value={item.key}
          id="key"
          name="key"
          labelText={itemName}
          onChange={createOnChangeHandler(item, "key")}
        >
          {createSelectOptionsForKey()}
        </SelectField>
      );
    } else {
      return (
        <TextField
          id="key"
          name="key"
          labelText={itemName}
          value={item.key}
          onChange={createOnChangeHandler(item, "key")}
        />
      );
    }
  };

  const renderThirdFieldTableCell = (item: Item) => {
    if (keyOptions?.length > 0) {
      return (
        <SelectField
          className="TypeDropDown_Select"
          value={item.thirdField}
          id="thirdField"
          name="thirdField"
          labelText={thirdFieldName}
          onChange={createOnChangeHandler(item, "thirdField")}
        >
          {createSelectOptionsForThirdFieldOption()}
        </SelectField>
      );
    } else {
      return (
        <TextField
          id="thirdField"
          name="thirdField"
          labelText={thirdFieldName}
          value={item.thirdField}
          onChange={createOnChangeHandler(item, "thirdField")}
        />
      );
    }
  };

  return (
    <div>
      <Table>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{renderKeyTableCell(item)}</TableCell>
              <TableCell>
                <TextField
                  id="value"
                  name="value"
                  labelText={valueName}
                  value={item.value}
                  onChange={createOnChangeHandler(item, "value")}
                />
              </TableCell>
              <TableCell>{renderThirdFieldTableCell(item)}</TableCell>
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
