document.getElementById('tradeForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const entryPrice = parseFloat(document.getElementById('entryPrice').value);
    const stopLoss = parseFloat(document.getElementById('stopLoss').value);
    const capital = parseFloat(document.getElementById('capital').value);

    const resultsDiv = document.getElementById('results');

    // Input validation
    if (entryPrice <= 0 || stopLoss <= 0 || capital <= 0) {
        resultsDiv.innerHTML = `<h2 style="color: red;">Please enter valid positive numbers.</h2>`;
        return;
    }

    const brokerage = 0.0003;
    const stt = 0.00025;
    const etc = 0.0000307;
    const stamp = 0.00003;
    const sebi = 0.000001;

    // Helper function to calculate charges
    function calculateCharge(q, entry, stopLoss) {
        const brokerageCharge = Math.min((q * (entry + stopLoss)) * brokerage, 40);
        const sttCharge = entry > stopLoss
            ? (stopLoss * q) * stt
            : (entry * q) * stt;
        const etcCharge = (q * (entry + stopLoss)) * etc;
        const stampCharge = entry > stopLoss
            ? (entry * q) * stamp
            : (stopLoss * q) * stamp;
        const sebiCharge = (q * (entry + stopLoss)) * sebi;
        const gst = (brokerageCharge + sebiCharge + etcCharge) * 0.18;
        return brokerageCharge + sttCharge + etcCharge + stampCharge + sebiCharge + gst;
    }

    // Helper function to calculate charges on target
    function calculateChargeOnTarget(q, entry, target) {
        const brokerageCharge = Math.min((q * (entry + target)) * brokerage, 40);
        const sttCharge = entry > target
            ? (entry * q) * stt
            : (target * q) * stt;
        const etcCharge = (q * (entry + target)) * etc;
        const stampCharge = entry > target
            ? (target * q) * stamp
            : (entry * q) * stamp;
        const sebiCharge = (q * (entry + target)) * sebi;
        const gst = (brokerageCharge + sebiCharge + etcCharge) * 0.18;
        return brokerageCharge + sttCharge + etcCharge + stampCharge + sebiCharge + gst;
    }

    let q = 1;
    const maxLoss = capital * 0.02; // Maximum loss (2% of capital)
    const lossPerShare = entryPrice > stopLoss
        ? entryPrice - stopLoss
        : stopLoss - entryPrice;

    let totalLoss = 0;
    let targetPrice = 0;
    const maxQuantity = Math.floor((capital * 5) / entryPrice);

    while (totalLoss < maxLoss) {
        totalLoss = (lossPerShare * q) + calculateCharge(q, entryPrice, stopLoss);

        if (totalLoss > maxLoss) {
            // Correct target price logic
            targetPrice = entryPrice > stopLoss
                ? entryPrice + (lossPerShare * 2) // For entry > stop loss
                : entryPrice - (lossPerShare * 2); // For entry < stop loss

            let modifiedTarget = targetPrice;
            let profitPerShare = entryPrice > modifiedTarget
                ? entryPrice - modifiedTarget
                : modifiedTarget - entryPrice;

            let totalProfit = (profitPerShare * q) - calculateChargeOnTarget(q, entryPrice, modifiedTarget);

            while (totalProfit < maxLoss * 2) {
                profitPerShare = entryPrice > modifiedTarget
                    ? entryPrice - modifiedTarget
                    : modifiedTarget - entryPrice;

                totalProfit = (profitPerShare * q) - calculateChargeOnTarget(q, entryPrice, modifiedTarget);

                modifiedTarget = entryPrice > modifiedTarget
                    ? modifiedTarget - 0.05 // Adjust downward
                    : modifiedTarget + 0.05; // Adjust upward

                if (totalProfit > maxLoss * 2) {
                    resultsDiv.innerHTML = `
                        <h2>Quantity: ${Math.min(q - 1, maxQuantity)}</h2>
                        <h2>Maximum Quantity: ${maxQuantity}</h2>
                        <h2>Target Price: ${modifiedTarget.toFixed(2)}</h2>
                        <h2>Stop Loss: ${stopLoss}</h2>
                    `;
                    return;
                }
            }
        }
        q += 1;
    }
});
