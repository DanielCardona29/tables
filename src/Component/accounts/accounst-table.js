import { html, css } from 'lit-element';
import { bbvaAttached, bbvaConfiguration } from '@bbva-web-components/bbva-foundations-icons';
import { BbvaWebTable } from '@bbva-web-components/bbva-web-table';
import '@bbva-web-components/bbva-web-table-header/bbva-web-table-header.js';
import '@bbva-web-components/bbva-web-table-body/bbva-web-table-body.js';
import '@bbva-web-components/bbva-web-table-row-group/bbva-web-table-row-group.js';
import '@bbva-web-components/bbva-web-table-panel-info/bbva-web-table-panel-info.js';
import '@bbva-web-components/bbva-core-collapse/bbva-core-collapse.js';



import '@training/training-account-dm/training-account-dm';
import '../transactions/transactions-table.js'

import styles from './collapsebleTable-styles.js'
import { getComponentSharedStyles } from '@bbva-web-components/bbva-core-lit-helpers';

bbvaAttached();
bbvaConfiguration();

/**
 * Merges two arrays of objects, comparing them in base of a prop, and adding missing keys from old item to the new item
 * @param { Array } oldData Old array of objects
 * @param { Array } newData New array of objects
 * @param { String } comparingProp Key to use for object comparison
 */
function mergeData(oldData, newData, comparingProp = 'id') {
  const result = [];
  const data = JSON.parse(JSON.stringify(newData));
  data.forEach(item => {
    const oldItem = oldData.find(el => el[comparingProp] === item[comparingProp]);
    if (oldItem) {
      result.push({ ...oldItem, ...item });
    } else {
      result.push(item);
    }
  });
  return result;
};

class ExampleTableCollapsibleRows extends BbvaWebTable {
  static get is() {
    return 'collapsable-table';
  }

  static get properties() {
    return {
      /**
       * Size for table body contents; available values are 'l', 'm' and 's'
       */
      size: {
        type: String,
        reflect: true
      },
      /**
       * Data for table body rows
       */
      data: {
        type: Array
      },
      /**
       * Copy of data array, includes states result of user interaction
       */
      _data: {
        type: Array
      },

      isLoadingData: {
        type: Boolean
      }
    }
  }

  constructor() {
    super();
    this.size = 'l';
    this.data = [];
    this._data = [];
  }

  updated(props) {
    super.updated && super.updated(props);
    if (props.has('data')) {
      this._data = mergeData(this._data, this.data, 'id');
    }
  }

  static get styles() {
    return [super.styles, styles, getComponentSharedStyles('collapsable-table-shared-styles')]
  }

  render() {
    return html`
    <training-account-dm id='dm-accounts' @accounts-transactions-success=${this._onTransactionsResponseSuccess}>
    </training-account-dm>
    <table>
      <colgroup>
        <col class="main" />
        <col class="date" />
        <col class="amounts" span="2" />
      </colgroup>
      <thead>
        ${this._headTpl}
      </thead>
      <tbody>
        ${this._bodyTpl}
      </tbody>
    </table>
    `;
  }

  /* eslint-disable class-methods-use-this */
  get totalColumns() {
    return 7;
  }

  /** SECTION TEMPLATES */

  get _headTpl() {
    return html`
      <tr>
        <th>
          <bbva-web-table-header-text>Cuenta</bbva-web-table-header-text>
        </th>
        <th>
          <bbva-web-table-header-text variant="amount">Disponible</bbva-web-table-header-text>
        </th>
        <th><span class="sr-only">Adjuntos</span></th>
      </tr>
    `;
  }
  /* eslint-enable class-methods-use-this */

  get _bodyTpl() {
    return this._data.map(item => this._contentRow(item));
  }

  /** ROW & CELL TEMPLATES */

  _contentRow(item) {
    return html`
      <tr data-actionable @click="${() => this._rowClick(item)}">
        <td>
          <bbva-web-table-body-text .description="${item.alias}" size="${this.size}">${item.number}
          </bbva-web-table-body-text>
        </td>
        <td>
          <bbva-web-table-body-amount .amount="${item.availableBalance.currentBalances[0].amount}"
            .currency="${item.availableBalance.currentBalances[0].currency}" size="${this.size}">
          </bbva-web-table-body-amount>
        </td>
        <td>
          <bbva-web-table-body-action icon="bbva:attached" aria-label="Download detail" size="${this.size}"
            @click="${(e) => { this._onContentDownloadClick(e, item) }}"></bbva-web-table-body-action>
        </td>
      </tr>
      
      ${item.opened ? this._detailRow(item) : ''}
    `;
  }


  _detailRow(item) {
    return html`
      <tr>
        <td colspan="${this.totalColumns}">
          <bbva-core-collapse @transitioning-changed="${(e) => this._onCollapseTransitionChange(e, item)}" keep-focus
            .opened="${this._collapseUnfoldedStatus(item)}">
      
            ${this._detailContent(item)}
      
          </bbva-core-collapse>
        </td>
      </tr>
    `;
  }

  /* eslint-disable class-methods-use-this */
  _detailContent(item) {
    return item.movementsList ? html`
      <transactions-table .data=${item.movementsList}></transactions-table>
    ` : html`
      <bbva-web-table-panel-info loading-text="Loading..." loading> </bbva-web-table-panel-info>
    `;
  }

  _rowActionCell(item) {
    return html`
      <td data-row-action>
        <button aria-expanded="${item.opened}">
          <span>Toggle item detail</span>
        </button>
      </td>
    `;
  }
  /* eslint-enable class-methods-use-this */

  /** ACTION CLICK */

  async _rowClick(i) {
    const item = i;
    if (item.opened) {
      item._unfolded = false;
      this.requestUpdate('_data');
      return;
    }
    this._data.filter(el => el.opened).forEach(el => {
      const element = el;
      element._unfolded = false
    });
    this._sendDetailClick(item);
    item._openInit = true;
    item._unfolded = false;
    item.opened = true;
    this.requestUpdate('_data');

    await this.updateComplete;
    item._unfolded = true;
    this.requestUpdate('_data');
    item._openInit = false;


    //Pedimos los datos para las tarjetas
    const _accountsDm = this.shadowRoot.querySelector('#dm-accounts');
    _accountsDm.getAccountsTransactions(item.accountId);
  }

  _sendDetailClick(item) {
    this.dispatchEvent(new CustomEvent('item-detail-click', {
      bubbles: true,
      detail: {
        id: item.id
      }
    }));
  }

  /** Allows to have initially opened items */
  _collapseUnfoldedStatus(i) {
    const item = i;
    if (item._unfolded === undefined && item.opened) {
      item._unfolded = true;
      this.requestUpdate('_data');
      this._sendDetailClick(item);
    }
    return item._unfolded;
  }

  _onCollapseTransitionChange(e, i) {
    const item = i;
    const transitionEnded = !e.detail.value;
    if (!item._unfolded && transitionEnded && !item._openInit) {
      item.opened = false;
      this.requestUpdate('_data');
    }
  }

  /** ACTION EVENT HANDLERS */

  _onContentDownloadClick(e, item) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('item-download-click', {
      bubbles: true,
      detail: item.id
    }));
  }

  _onContentOptionsClick(e, item) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('item-options-click', {
      bubbles: true,
      detail: item.id
    }));
  }

  _onTransactionsResponseSuccess(event) {
    const { detail: { response }, detail } = event;
    
    if (detail.status !== 200)return;

    const consult = JSON.parse(response).data;

    const accounts = this._data.map((account) => {
      if (account.accountId === consult[0].contract.id) {

        account.movementsList = consult.map((transaction) => {

          let status = ''

          switch (transaction.status.id) {
            case "SETTLED":
              status = 'success'
              break;
            case "PENDING":
              status = 'success'
              break;
            case "SENT":
              status = 'success'
              break;
            case "RETURNED":
              status = 'error'
              break;
            case "REJECTED":
              status = 'error'
              break;
            case "AUTHORIZATION_PENDING":
              status = 'error'
              break;
            case "CANCELED":
              status = 'error'
              break;
            default:
              break;
          }

          return {
            id: transaction.id,
            status: status,
            operationDate: transaction.operationDate,
            localAmount: transaction.localAmount,
            concept: transaction.concept
          }
        });
      }
      return account;
    });

    this._data = accounts;

  }
}

customElements.define(ExampleTableCollapsibleRows.is, ExampleTableCollapsibleRows);