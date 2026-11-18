import { LOW_STOCK_LIMIT } from '../utils/format.js';

// Shows the available copies. Turns red with a "Low stock" label when fewer than 2 remain.
export default function StockBadge({ quantity }) {
  const low = quantity < LOW_STOCK_LIMIT;
  return (
    <span className={`badge ${low ? 'badge-low' : 'badge-ok'}`}>
      {quantity === 0 ? 'Out of stock' : low ? `Low stock: ${quantity}` : `${quantity} available`}
    </span>
  );
}
