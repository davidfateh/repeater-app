export abstract class BaseSettings {
    json: any

    getFields(): JSON {
        const fields = this.json.fields
        return fields
    }

    /**
     * Validate the json fields against the
     * */
    validate(): boolean {
        return true
    }

}
