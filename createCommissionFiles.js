let fs = require("fs");
const {
  getCommissionData,
  getCommissionSummaryData,
  createCommissionCSV,
  BONUS_TYPE_1,
  BONUS_TYPE_2
} = require("./commission");

createCommissionCSV("Cases.csv", "./basicPay.csv", caseData =>
  getCommissionData(caseData)
);

createCommissionCSV("Cases.csv", "bonus1Pay.csv", caseData =>
  getCommissionData(caseData, BONUS_TYPE_1)
);

createCommissionCSV("Cases.csv", "bonus2Pay.csv", caseData =>
  getCommissionData(caseData, BONUS_TYPE_2)
);

createCommissionCSV(
  "bonus2Pay.csv",
  "bonusSummary.csv",
  getCommissionSummaryData
);
