import cartSettingsJson from '../templates/cart-settings.json';
import { BaseSettings } from './BaseSettings';

export class CartSettings extends BaseSettings {
  constructor() {
    super();
    this.json = cartSettingsJson;
  }
}
