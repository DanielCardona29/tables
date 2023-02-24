/* eslint-disable no-unused-vars */
import { css, unsafeCSS } from 'lit-element';
import * as foundations from '@bbva-web-components/bbva-foundations-styles';
const { bbvaToken, bbvaSpacer8, bbvaFont } = foundations;

export default css`col .actions,
col .amount {
  width: 0.1%;
}
col .main {
  width: 50%;
}

.rest {
  color: red;
}

.plus {
  color: green;
}

.sr-only {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}
`;