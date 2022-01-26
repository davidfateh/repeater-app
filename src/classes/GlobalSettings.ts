import globalSettingsJson from '../templates/global-settings.json';
import {BaseSettings} from './BaseSettings';

export class GlobalSettings extends BaseSettings{
    constructor() {
        super();
        this.json = globalSettingsJson
    }
}
