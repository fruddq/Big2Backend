const calculateCapitalGrowth = ({ initCapital, monthlySavingAmount, months, roi, fee }) => {
  let profit
  let profitBeforeFee
  let newAmount
  let roiValue = roi / 100 + 1

  for (let i = 1; i <= months; i++) {
    let currentSavings = i === 1 ? 0 : monthlySavingAmount
    newAmount = (initCapital + currentSavings) * roiValue
    profitBeforeFee = newAmount - (initCapital + currentSavings)
    profit = profitBeforeFee * (1 - fee)
    initCapital = initCapital + currentSavings + profit
  }

  return initCapital.toLocaleString('sv-SE')
}

const bajs = {
  initCapital: 500,
  monthlySavingAmount: 100,
  months: 2,
  roi: 100,
  fee: 0.3,
}
console.log(calculateCapitalGrowth(bajs))
