import collectionSubnavSettingsJson from '../templates/collection-subnav-settings.json';
import { BaseSettings } from './BaseSettings';

export class CollectionSubnavSettings extends BaseSettings {
  constructor() {
    super();
    this.json = collectionSubnavSettingsJson;
  }
}
