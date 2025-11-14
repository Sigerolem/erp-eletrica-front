export function calculateProfit({
  cost,
  value,
  profit,
}: {
  cost?: number;
  value?: number;
  profit?: number;
}) {
  if (!cost && !value && !profit) {
    return { cost: 0, value: 0, profit: 0 };
  }
  if (value == undefined) {
    if (profit == undefined) {
      return { cost: cost!, profit: 0, value: cost! };
    } else if (cost == undefined) {
      return { cost: 0, value: 0, profit };
    } else {
      if (profit > 100_00) {
        return { cost: 0, profit: 100_00, value: cost };
      }
      const newValue = Math.round((cost * 100_00) / (100_00 - profit));
      return { cost, profit, value: newValue };
    }
  }

  if (profit == undefined) {
    if (cost == undefined) {
      return { value, cost: value, profit: 0 };
    } else {
      if (cost == 0) {
        return { cost, value, profit: 100_00 };
      }
      if (value == 0) {
        return { cost, value, profit: 0 };
      }
      const newProfit = Math.round((1 - cost / value) * 100_00);
      return { cost, value, profit: newProfit };
    }
  }

  const newCost = value - (value * profit) / 100_00;

  return { profit, value, cost: newCost };
}
