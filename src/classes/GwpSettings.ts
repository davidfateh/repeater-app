import GwpSettingsJson from '../templates/gwp-settings.json';
import {BaseSettings} from './BaseSettings';

export class GwpSettings extends BaseSettings{
    constructor() {
        super();
        this.json = GwpSettingsJson
    }
}
