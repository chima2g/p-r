const {
  convertCSVStrToArr,
  convertArrayToCSVStr,
  convertCasesToGBP,
  bonusCalculator,
  getCommissionData,
  getCommissionSummaryData,
  getCaseCommissionData,
  CURRENCY_LOOKUP,
  BONUS_TYPE_1,
  BONUS_TYPE_2
} = require("../commission");

describe("convertCSVStrToArr", () => {
  test("convertCSVStrToArr returns an array given a CSV string with no cases", () => {
    const csvStr = "BrokerName,CaseId,CaseValue";

    const outputArr = [["BrokerName", "CaseId", "CaseValue"]];

    expect(convertCSVStrToArr(csvStr)).toEqual(outputArr);
  });

  test("convertCSVStrToArr returns an array given a single entry a CSV string", () => {
    const csvStr = "BrokerName,CaseId,CaseValue\r\n" + "Emma,1,£103133.02";

    const outputArr = [
      ["BrokerName", "CaseId", "CaseValue"],
      ["Emma", "1", "£103133.02"]
    ];

    expect(convertCSVStrToArr(csvStr)).toEqual(outputArr);
  });

  test("convertCSVStrToArr returns an array of all the values given multiple entries in a CSV string", () => {
    const csvStr =
      "BrokerName,CaseId,CaseValue\r\n" +
      "Emma,1,£103133.02\r\n" +
      "David,2,£607947.84\r\n" +
      "Ella,3,£638271.61\r\n" +
      "Mike,4,£120962.95";

    const outputArr = [
      ["BrokerName", "CaseId", "CaseValue"],
      ["Emma", "1", "£103133.02"],
      ["David", "2", "£607947.84"],
      ["Ella", "3", "£638271.61"],
      ["Mike", "4", "£120962.95"]
    ];

    expect(convertCSVStrToArr(csvStr)).toEqual(outputArr);
  });
});

describe("convertArrayToCSVStr", () => {
  test("convertArrayToCSVStr returns a CSV string for an array of data containing no entries", () => {
    const inputArr = [["BrokerName", "CaseId", "CaseValue"]];
    const csvStr = "BrokerName,CaseId,CaseValue";

    expect(convertArrayToCSVStr(inputArr)).toEqual(csvStr);
  });

  test("convertArrayToCSVStr returns a CSV string for an array of data containing a single entry", () => {
    const inputArr = [
      ["BrokerName", "CaseId", "CaseValue"],
      ["Emma", "1", "£103133.02"]
    ];

    const csvStr = "BrokerName,CaseId,CaseValue\r\n" + "Emma,1,£103133.02";

    expect(convertArrayToCSVStr(inputArr)).toEqual(csvStr);
  });

  test("convertArrayToCSVStr returns a CSV string for an array of data containing multiple entries", () => {
    const inputArr = [
      ["BrokerName", "CaseId", "CaseValue"],
      ["Emma", "1", "£103133.02"],
      ["David", "2", "£607947.84"],
      ["Ella", "3", "£638271.61"],
      ["Mike", "4", "£120962.95"]
    ];

    const csvStr =
      "BrokerName,CaseId,CaseValue\r\n" +
      "Emma,1,£103133.02\r\n" +
      "David,2,£607947.84\r\n" +
      "Ella,3,£638271.61\r\n" +
      "Mike,4,£120962.95";

    expect(convertArrayToCSVStr(inputArr)).toEqual(csvStr);
  });
});

describe("convertCasesToGBP", () => {
  test("convertCasesToGBP returns correctly given an empty array of cases", () => {
    const input_cases = [["BrokerName", "CaseId", "CaseValue"]];
    const output_cases = [["BrokerName", "CaseId", "CaseValue"]];
    expect(convertCasesToGBP(input_cases, CURRENCY_LOOKUP)).toEqual(
      output_cases
    );
  });

  test("convertCasesToGBP returns a single case given an array containing a single case", () => {
    const input_cases = [
      ["BrokerName", "CaseId", "CaseValue"],
      ["Stacy", "3379", "$474584.18"]
    ];
    const output_cases = [
      ["BrokerName", "CaseId", "CaseValue"],
      ["Stacy", "3379", "£379667.34"]
    ];
    expect(convertCasesToGBP(input_cases, CURRENCY_LOOKUP)).toEqual(
      output_cases
    );
  });

  test("convertCasesToGBP returns an array of cases changing the CaseValue amount to GBP given multiple cases", () => {
    const input_cases = [
      ["BrokerName", "CaseId", "CaseValue"],
      ["Rob", "3378", "£404006.99"],
      ["Stacy", "3379", "$474584.18"]
    ];
    const output_cases = [
      ["BrokerName", "CaseId", "CaseValue"],
      ["Rob", "3378", "£404006.99"],
      ["Stacy", "3379", "£379667.34"]
    ];
    expect(convertCasesToGBP(input_cases, CURRENCY_LOOKUP)).toEqual(
      output_cases
    );
  });
});

describe("bonusCalculator", () => {
  test("bonusCalculator returns no bonus for a case £100,000 or less", () => {
    expect(bonusCalculator("£100", 100000, 10000)).toBe(0);
  });

  test("bonusCalculator returns the correct bonus for a case over £100,000", () => {
    expect(bonusCalculator("£110000", 100000, 10000)).toBe(10);
    expect(bonusCalculator("£199999.99", 100000, 10000)).toBe(90);
    expect(bonusCalculator("£200000", 100000, 10000)).toBe(100);
  });

  test("bonusCalculator returns the correct bonus for a case over £250,000", () => {
    expect(bonusCalculator("£250000", 250000, 50000)).toBe(0);
    expect(bonusCalculator("£300000", 250000, 50000)).toBe(10);
    expect(bonusCalculator("£749999.99", 250000, 50000)).toBe(90);
    expect(bonusCalculator("£750000", 250000, 50000)).toBe(100);
  });
});

describe("getCommissionData", () => {
  test("getCommissionData returns commission data for array containing no entries", () => {
    const inputCaseA = [["BrokerName", "CaseId", "CaseValue"]];

    const outputCaseA1 = [
      ["BrokerName", "CaseId", "BaseCommission", "BonusCommission"]
    ];

    expect(getCommissionData(inputCaseA, BONUS_TYPE_1)).toEqual(outputCaseA1);

    const outputCaseA2 = [
      ["BrokerName", "CaseId", "BaseCommission", "BonusCommission"]
    ];

    expect(getCommissionData(inputCaseA, BONUS_TYPE_2)).toEqual(outputCaseA2);
  });

  test("getCommissionData returns commission data for both bonus structures in pounds", () => {
    const inputCaseA = [
      ["BrokerName", "CaseId", "CaseValue"],
      ["David", "2", "£607947.84"]
    ];

    const outputCaseA1 = [
      ["BrokerName", "CaseId", "BaseCommission", "BonusCommission"],
      ["David", "2", "£125", "£500"]
    ];

    expect(getCommissionData(inputCaseA, BONUS_TYPE_1)).toEqual(outputCaseA1);

    const outputCaseA2 = [
      ["BrokerName", "CaseId", "BaseCommission", "BonusCommission"],
      ["David", "2", "£125", "£570"]
    ];

    expect(getCommissionData(inputCaseA, BONUS_TYPE_2)).toEqual(outputCaseA2);
  });

  test("getCommissionData returns commission data for both bonus structures in dollars", () => {
    const inputCaseB = [
      ["BrokerName", "CaseId", "CaseValue"],
      ["Dave", "3382", "$532231.95"]
    ];

    const outputCaseB1 = [
      ["BrokerName", "CaseId", "BaseCommission", "BonusCommission"],
      ["Dave", "3382", "£125", "£320"]
    ];

    expect(getCommissionData(inputCaseB, BONUS_TYPE_1)).toEqual(outputCaseB1);

    const outputCaseB2 = [
      ["BrokerName", "CaseId", "BaseCommission", "BonusCommission"],
      ["Dave", "3382", "£125", "£350"]
    ];

    expect(getCommissionData(inputCaseB, BONUS_TYPE_2)).toEqual(outputCaseB2);
  });
});

describe("getCommissionSummaryData", () => {
  test("getCommissionSummaryData returns an array of total commission data for an array of cases", () => {
    const caseData = [
      ["BrokerName", "CaseId", "BaseCommission", "BonusCommission"],
      ["Emmá", "12", "£125", "£0"],
      ["Emmá", "12", "£125", "£60"]
    ];
    expect(getCommissionSummaryData(caseData)).toEqual([
      ["BrokerName", "TotalCommission"],
      ["Emmá", "£310"]
    ]);
  });
});

describe("getCaseCommissionData", () => {
  test("getCaseCommissionData returns a CSV string of commission data for a given CSV string of broker data", () => {
    const csvStr =
      "BrokerName,CaseId,BaseCommission,BonusCommission\r\n" +
      "Emma,1,£125,£100.00\r\n" +
      "Emma,2,£125,£200.00\r\n" +
      "Emma,3,£125,£300.00\r\n" +
      "David,4,£125,£400.00\r\n" +
      "David,5,£125,£500.00\r\n" +
      "David,6,£125,£600.00";

    const output =
      "BrokerName,TotalCommission\r\n" + "Emma,£975\r\n" + "David,£1875";

    expect(getCaseCommissionData(csvStr, getCommissionSummaryData)).toEqual(
      output
    );
  });
});
