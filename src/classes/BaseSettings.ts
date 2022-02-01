import {Item} from './Item';
import {v4 as uuid} from 'uuid';

export abstract class BaseSettings {
    json: any

    /*
    * Get the fields from the fields array in the JSON file.
    * */
    getFieldsJson(): any {
        return this.json.fields
    }

    public getFields(): any {
        const fields = this.getFieldsJson()
        const helpTextFields = this.getHelpTextFields()
        const fieldKeys = Object.keys(fields)
        return [...Array(fieldKeys.length)].map((_, i) => {
            const fieldName = fieldKeys[i]
            const field = fields[fieldName];
            const helpText = helpTextFields[fieldName] ?? ''
            return {
                id: uuid(),
                key: fieldName,
                value: field,
                error: '',
                helpText: helpText
            }
        })
    }

    /*
    * Get the fields that are used for validation rules.
    * */
    getValidationFields(): any {
        return this.json.validation
    }

    /**
     * Validate the json fields against the
     * */
    validate(items: Item[]): boolean {
        const validationFields = this.getValidationFields()

        items.forEach(item => {
            const validationField = validationFields[item.key]
            // Reset the errors before running the validation again.
            item.error = ''
            // If there is a validation field which matches the item.
            if (validationField) {
                const isValidNumber = item?.value?.match(/^\d*(\.\d+)?$/)
                if (validationField.includes('>')) {
                    // Check to see if we need to do a greater than check on an int
                    const numberCheck = validationField.split('>')?.[1]?.trim()
                    const numCheckInt = parseInt(numberCheck)
                    if (!isNaN(numCheckInt)) {
                        if (parseInt(item.value) > numberCheck) {
                            return
                        }
                    }
                } else if (validationField.includes('<')) {
                    // Check to see if we need to do a less thank check on a int.
                    const numberCheck = validationField.split('<')?.[1]?.trim()
                    const numCheckInt = parseInt(numberCheck)
                    if (!isNaN(numCheckInt)) {
                        if (parseInt(item.value) < numberCheck) {
                            return
                        }
                    }
                } else if (validationField === 'string' && typeof item?.value === validationField) {
                    return
                } else if (validationField === 'number' &&
                    typeof parseFloat(item?.value) === validationField &&
                    isValidNumber &&
                    !isNaN(parseFloat(item?.value))) {
                    // Check to make sure the value passes being converted into a number.
                    // Also check via regex that is only has numbers or is a valid float.
                    return
                } else if (item?.value === '') {
                    // If value is empty do nothing.
                    return
                }
                item.error = 'This field is invalid, should be a ' + validationField
            }
        })

        return false
    }

    private getHelpTextFields(): any {
        return this.json.helpText
    }
}
