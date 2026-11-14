// Purchase is a parent module. Each purchase type gets its own sub-page under /purchase/<id>.
// To add a new purchase type later (e.g. accessories, regulators), add an entry here,
// create its page component, and add a <Route path="<id>"> under the "purchase" route in App.js.
const PURCHASE_CATEGORIES = [
  {
    id: 'lpg',
    label: 'LPG Purchase',
    path: '/purchase/lpg',
    description: 'LPG cylinder refills by size and registration number'
  }
];

export const DEFAULT_PURCHASE_PATH = PURCHASE_CATEGORIES[0].path;

export default PURCHASE_CATEGORIES;
