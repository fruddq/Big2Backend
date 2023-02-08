const calculateCapitalGrowth = (
  initCapital: number,
  monthlySavingAmount: number,
  months: number,
  roi: number,
  fee: number,
) => {
  let profit: number
  let profitBeforeFee: number
  let newAmount: number
  let roiValue: number = roi / 100 + 1

  for (let i = 1; i <= months; i++) {
    let currentSavings = i === 1 ? 0 : monthlySavingAmount
    newAmount = (initCapital + currentSavings) * roiValue
    profitBeforeFee = newAmount - (initCapital + currentSavings)
    profit = profitBeforeFee * (1 - fee)
    initCapital = initCapital + currentSavings + profit
  }

  return initCapital.toLocaleString('sv-SE')
}

console.log(calculateCapitalGrowth(500, 100, 2, 100, 0.3))
console.log()
