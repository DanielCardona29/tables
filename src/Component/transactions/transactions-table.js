import { html, css } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { bbvaDocument, bbvaConfiguration } from '@bbva-web-components/bbva-foundations-icons';
import { BbvaWebTable } from '@bbva-web-components/bbva-web-table';
import '@bbva-web-components/bbva-web-table-header/bbva-web-table-header.js';
import '@bbva-web-components/bbva-web-table-body/bbva-web-table-body.js';
import '@bbva-web-components/bbva-web-table-row-group/bbva-web-table-row-group.js';

import styles from './transactionsTable-styles.js';
import { getComponentSharedStyles } from '@bbva-web-components/bbva-core-lit-helpers';

bbvaDocument();
bbvaConfiguration();

class TransactionsTable extends BbvaWebTable {
    static get is() {
        return 'transactions-table';
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
            }
        }
    }

    constructor() {
        super();
        this.size = 'l';
        this.data = [];
    }

    static get styles() {
        return [
            super.styles,
            styles,
            getComponentSharedStyles('transactions-table-shared-styles')
        ]
    }

    render() {
        return html`
    <table>
        <colgroup>
            <col class="dates" span="2" />
            <col class="main" />
            <col class="amount" />
            <col class="actions" span="2" />
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
        return 3;
    }

    /** SECTION TEMPLATES */

    get _headTpl() {
        return html`
    <tr>
        <th>
            <bbva-web-table-header-text>Fecha Op.</bbva-web-table-header-text>
        </th>
    
        <th>
            <bbva-web-table-header-text>Descripcion</bbva-web-table-header-text>
        </th>
        <th>
            <bbva-web-table-header-text variant="amount">Monto</bbva-web-table-header-text>
        </th>
    
    </tr>
    `;
    }
    /* eslint-enable class-methods-use-this */

    get _bodyTpl() {
        return this.data.map(item => item.type === 'summary' ? this._groupRow(item) : this._contentRow(item));
    }

    firstUpdated() {
        this.data = this.data.map((transaction) => {
            transaction.operationDate = new Date(transaction.operationDate).toLocaleDateString();
            return transaction;
        })
    }

    /** ROW & CELL TEMPLATES */

    _contentRow(item) {
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
        return html`
    <tr data-state="${ifDefined(item.status)}">
        <td>
            <bbva-web-table-body-date
                .date="${(new Date(item.operationDate).getDate()) + ' - ' + (months[new Date(item.operationDate).getMonth()])}"
                .year="${new Date(item.operationDate).getFullYear()}" size="${this.size}">
            </bbva-web-table-body-date>
        </td>
        <td>
            <bbva-web-table-body-text size="${this.size}">
                ${item.concept}
            </bbva-web-table-body-text>
        </td>
        <td>
            <bbva-web-table-body-amount .amount="${item.localAmount.amount}" class=${item.localAmount.amount < 0 ? 'rest': 'plus'} .currency="${item.localAmount.currency}" size="${this.size}"></bbva-web-table-body-amount>
        </td>
    </tr>
    `;
    }

    _groupRow(item) {
        return html`
    <tr>
        <td></td>
        <td colspan="${this.totalColumns - 4}">
            <bbva-web-table-row-group .amount="${item.amount.value}">${item.description}</bbva-web-table-row-group>
        </td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    `;
    }

    /** ACTION EVENT HANDLERS */
    _onContentOptionsClick(e, item) {
        this.dispatchEvent(new CustomEvent('item-options-click', {
            bubbles: true,
            detail: item.id
        }));
    }
}

customElements.define(TransactionsTable.is, TransactionsTable);