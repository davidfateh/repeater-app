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
        console.log( 'validationFields', validationFields);

        items.forEach(item => {
            console.log( 'validation item', item );
            const validationField = validationFields[item.key]
            console.log( 'validationField', validationField );
            // If there is a validation field which matches the item.
            if (validationField){
                console.log( 'validationField', validationField );
                console.log( 'typeof item.value', typeof item.value );
                if (typeof item.value === validationField){
                    console.log( 'validation for item' + item.key + 'passes validation'  );
                }
            }
        })

        return false
    }

}
