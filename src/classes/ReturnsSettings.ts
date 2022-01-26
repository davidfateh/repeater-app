import returnsSettingsJson from '../templates/returns-settings.json';
import {BaseSettings} from './BaseSettings';

export class ReturnSettings extends BaseSettings{
    constructor() {
        super();
        this.json = returnsSettingsJson
    }
}
