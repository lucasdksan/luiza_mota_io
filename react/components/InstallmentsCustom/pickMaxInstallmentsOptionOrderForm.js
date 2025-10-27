function applyFiltersToInstallmentsList(orderForm, filteringRules) {
    let { installmentOptions, paymentSystems } = orderForm.paymentData;

    const paymentSystemMap = paymentSystems.reduce((acc, system) => {
        acc[system.id] = system.name;
        return acc;
    }, {});

    let installmentsList = installmentOptions.flatMap(option => {
        return option.installments.map(installment => ({
            paymentSystemId: option.paymentSystem,
            paymentSystemName: paymentSystemMap[option.paymentSystem],
            count: installment.count,
            interestRate: installment.interestRate,
            value: installment.value,
            total: installment.total
        }));
    });

    if (filteringRules.paymentSystemName) {
        installmentsList = installmentsList.filter(
            i => i.paymentSystemName === filteringRules.paymentSystemName
        );
    }

    if (filteringRules.installmentsQuantity) {
        installmentsList = installmentsList.filter(
            i => i.count === filteringRules.installmentsQuantity
        );
    }

    return installmentsList;
}

export function pickMaxInstallmentsOptionOrderForm(orderForm, filteringRules) {
    const filteredList = filteringRules
        ? applyFiltersToInstallmentsList(orderForm, filteringRules)
        : applyFiltersToInstallmentsList(orderForm, {})

    if (filteredList.length === 0) return null;

    return filteredList.reduce((max, curr) =>
        curr.count > max.count ? curr : max
    ); 
}
