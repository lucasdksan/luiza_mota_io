function applyFiltersToInstallmentsList(installmentsList, filteringRules) {
  let filteredInstallmentsList = installmentsList;

  if (filteringRules.paymentSystemName) {
    filteredInstallmentsList = filteredInstallmentsList.filter(
      installmentsOption =>
        installmentsOption.PaymentSystemName ===
        filteringRules.paymentSystemName
    );
  }

  if (filteringRules.installmentsQuantity) {
    filteredInstallmentsList = filteredInstallmentsList.filter(
      installmentsOption =>
        installmentsOption.NumberOfInstallments ===
        filteringRules.installmentsQuantity
    );
  }

  return filteredInstallmentsList;
}

export function pickMaxInstallmentsOption(installmentsList, filteringRules) {
  const filteredInstallmentsList = filteringRules
    ? applyFiltersToInstallmentsList(installmentsList, filteringRules)
    : installmentsList;

  let [maxInstallmentOption] = filteredInstallmentsList;

  filteredInstallmentsList.forEach(installmentOption => {
    if (
      installmentOption.NumberOfInstallments >
      maxInstallmentOption.NumberOfInstallments
    ) {
      maxInstallmentOption = installmentOption;
    }
  });

  return maxInstallmentOption;
}