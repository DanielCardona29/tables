import { LitElement, html, } from 'lit-element';
import { getComponentSharedStyles } from '@bbva-web-components/bbva-core-lit-helpers';
import styles from './TrainingPanelAccountsUi-styles.js';


import '@bbva-web-components/bbva-web-table/index';
import './components/accounts/accounst-table.js';
import './components/transactions/transactions-table.js';

export class TrainingPanelAccountsUi extends LitElement {
  static get is() {
    return 'training-panel-accounts-ui';
  }

  // Declare properties
  static get properties() {
    return {
      data: { type: Array, },
    };
  }

  // Initialize properties
  constructor() {
    super();
    this.data = [];
  }

  static get styles() {
    return [
      styles,
      getComponentSharedStyles('training-panel-accounts-ui-shared-styles')
    ];
  }

  firstUpdated() {
    const _data = JSON.parse(JSON.stringify(this.data));
    _data.forEach(item => {
      item.id = Math.random().toString(36).substr(2, 10);;
    });
  }

  // Define a template
  render() {
    return html`
      <collapsable-table .data=${this.data}></collapsable-table>
    `;
  }
}
