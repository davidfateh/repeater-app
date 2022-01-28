import {Item} from './Item';

export abstract class BaseSettings {
    json: any

    getFields(): JSON {
        return this.json.fields
    }

    getValidationFields(): any {
        return this.json.validation
    }

    /**
     * Validate the json fields against the
     * */
    validate(items: Item[]) : boolean {
        const validationFields = this.getValidationFields()

        items.forEach(item => {
            const validationField = validationFields[item.key]
            // Reset the errors before running the validation again.
            item.error = ''
            // If there is a validation field which matches the item.
            if (validationField){
                if (validationField === 'string' && typeof item.value === validationField){
                   console.log( 'PASSED STRING: '+ item.key,validationField );
                   return
                } else if (validationField === 'number' &&
                    typeof parseFloat(item.value) === validationField &&
                    item.value.match(/^\d*(\.\d+)?$/) &&
                    !isNaN(parseFloat(item.value))){
                    console.log( 'PASSED NUM: ' + item.key, parseFloat(item.value) );
                    return
                } else if (item.value === ''){
                    console.log( 'value is empty so do nothing' );
                    return
                }
                console.log( item.key + ' IS INVALID');
                item.error = 'This field is invalid, should be a ' + validationField
            }
        })

        return false
    }

}
