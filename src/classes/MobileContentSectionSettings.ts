import mobileContentSectionSettingsJson from '../templates/mobile-nav-content-settings.json';
import { BaseSettings } from './BaseSettings';

export class MobileContentSectionSettings extends BaseSettings {
  constructor() {
    super();
    this.json = mobileContentSectionSettingsJson;
  }
}
