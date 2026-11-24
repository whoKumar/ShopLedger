const assert = require('node:assert/strict');
const test = require('node:test');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

const cases = [
  {
    name: '#1001 uses 5% and 12% GST without a coupon',
    order: {
      id: 1001,
      coupon: '',
      items: [
        { name: 'Rice', hsn: '1006', price: 100, qty: 2 },
        { name: 'Ghee', hsn: '0405', price: 150, qty: 1 }
      ]
    },
    totals: { subtotal: 350, discount: 0, tax: 28, cgst: 14, sgst: 14, total: 378 },
    lineGst: [[5, 10], [12, 18]]
  },
  {
    name: '#1002 calculates GST after applying SAVE10',
    order: {
      id: 1002,
      coupon: 'SAVE10',
      items: [
        { name: 'Rice', hsn: '1006', price: 640, qty: 1 },
        { name: 'Sunflower oil', hsn: '1512', price: 190, qty: 2 }
      ]
    },
    totals: { subtotal: 1020, discount: 102, tax: 45.90, cgst: 22.95, sgst: 22.95, total: 963.90 },
    lineGst: [[5, 28.80], [5, 17.10]]
  },
  {
    name: '#1004 caps SAVE10 at ₹150 on a ₹2,240 subtotal',
    order: {
      id: 1004,
      coupon: 'SAVE10',
      items: [{ name: 'Groundnut oil', hsn: '1508', price: 1120, qty: 2 }]
    },
    totals: { subtotal: 2240, discount: 150, tax: 104.50, cgst: 52.25, sgst: 52.25, total: 2194.50 },
    lineGst: [[5, 104.50]]
  },
  {
    name: 'CURRENT BEHAVIOUR: #1008 uses 18% GST on every item without a coupon',
    order: {
      id: 1008,
      coupon: '',
      items: [
        { name: 'Tea', hsn: '0902', gstRate: 18, price: 140, qty: 1 },
        { name: 'Syrup', hsn: '2106', price: 180, qty: 2 }
      ]
    },
    totals: { subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590 },
    lineGst: [[18, 25.20], [18, 64.80]]
  }
];

for (const { name, order, totals, lineGst } of cases) {
  test(name, () => {
    const printed = invoice.computeInvoiceFigures(order);
    const checkout = pricing.computeTotals(order.items, order.coupon);

    for (const [field, expected] of Object.entries(totals)) {
      assert.equal(printed[field], expected, `invoice ${field}`);
      assert.equal(checkout[field], expected, `checkout ${field}`);
    }

    assert.deepEqual(printed.rows.map(row => [row.gstPercent, row.lineTax]), lineGst);
    assert.deepEqual(checkout.lines.map(line => [line.gstPercent, line.tax]), lineGst);
  });
}

test('invoice uses each HSN slab after applying the capped coupon', () => {
  const order = {
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', hsn: '1006', price: 1120, qty: 1 },
      { name: 'Ghee', hsn: '0405', price: 1120, qty: 1 }
    ]
  };
  const printed = invoice.computeInvoiceFigures(order);
  const checkout = pricing.computeTotals(order.items, order.coupon);

  assert.equal(printed.total, 2267.65);
  assert.equal(printed.total, checkout.total);
  assert.equal(printed.subtotal, 2240);
  assert.equal(printed.discount, 150);
  assert.equal(printed.tax, 177.65);
  assert.deepEqual(printed.rows.map(row => [row.gstPercent, row.lineTax]), [
    [5, 52.25],
    [12, 125.40]
  ]);
});
