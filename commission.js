let fs = require("fs");

const BASE_COMMISSION = 125; // The standard amount of commission each broker receives for a case
const BONUS_AMOUNT = 10; //The amount of bonus a broker receives for hitting target

//Constants used to indicate which bonus structure is being applied
const BONUS_TYPE_1 = 1;
const BONUS_TYPE_2 = 2;

//The amount a case has to be above before a broker can begin to receive bonus for each bonus structure
const THRESHOLD_AMOUNT_1 = 100000;
const THRESHOLD_AMOUNT_2 = 250000;

//The target brokers have to hit in order to receive bonus for each bonus structure
const TARGET_AMOUNT_1 = 10000;
const TARGET_AMOUNT_2 = 50000;

const CURRENCY_LOOKUP = { $: 0.8 }; //Lookup object for converting foreign currencies into GBP

/**
 * Converts a CSV string to an array of data
 * @param {str} csvStr    A CSV string taken from file input
 * @return {array}        The CSV string formatted as an array of data
 */
const convertCSVStrToArr = csvStr => {
  const lines = csvStr.split("\r\n"); //Get each line of the CSV string
  const reducer = (accumulator, line) => {
    //Convert each line to an array of values and add that to the two dimensionsal array to be returned
    accumulator.push(line.split(","));
    return accumulator;
  };

  return lines.reduce(reducer, []);
};

console.log(
  [0, 1, 2, 3, 4].reduce((accumulator, currentValue, currentIndex, array) => {
    accumulator.push(currentValue);
    return accumulator;
  }, [])
);

/**
 * Converts an array of data to a CSV string
 * @param {array} dataArr     An array of data to be converted to a CSV string
 * @return {str}              A CSV string to be output to file
 */
const convertArrayToCSVStr = dataArr => {
  //Convert the CSV array data to a string and write it to file
  let csvStr = "";

  dataArr.forEach((csvLine, index) => {
    csvStr += csvLine.join(",");
    if (index !== dataArr.length - 1) csvStr += "\r\n";
  });

  return csvStr;
};

/**
 * Converts the CaseValue amount in an array brokerCases from USD to GBP where applicable.
 * If a currency isn't listed in the conversionLookup, the CaseValue is set to £NaN
 * @param {array} brokerCases     An array of broker cases
 * @return {array}                An array of broker cases with CaseValues converted to GBP
 */
const convertCasesToGBP = (brokerCases, conversionLookup) => {
  const [header, ...cases] = brokerCases;

  const converted = brokerCases.slice(1).map(brokerCase => {
    const [BrokerName, CaseId, CaseValue] = brokerCase;

    if (CaseValue.startsWith("£")) return brokerCase;
    else {
      const conversionRate = conversionLookup[CaseValue.slice(0, 1)];
      const gbpVal = parseFloat(CaseValue.slice(1) * conversionRate).toFixed(2); //Calculate the converted amount

      return [BrokerName, CaseId, `£${gbpVal}`]; //return a new array with the converted amount
    }
  });

  converted.unshift(header);

  return converted;
};

/**
 * Calculates the amount of bonus a broker should receive. Assumes bonus is not paid on a
 * pro-rata basis, e.g. bonus is only paid for each whole amount of £10,000 over £100,000
 * @param {string} caseValue        The CaseValue amount in float format, e.g. £10000.00
 * @param {number} threshold        A float value representing the amount that the caseValue must exceed before a broker can receive bonus
 * @param {number} target           The target amount as a float. Bonus is paid for every target amount that the CaseValue is above the threshold
 * @return {array}                  An array of broker cases including their commission
 */
const bonusCalculator = (caseValue, threshold, target) => {
  const caseValueAsFloat = parseFloat(caseValue.substring(1)); //Convert caseValue into float format
  let totalBonus = 0;

  //If the broker has hit the bonus threshold, calculate their bonus
  if (caseValueAsFloat > threshold)
    totalBonus =
      parseInt((caseValueAsFloat - threshold) / target) * BONUS_AMOUNT;

  return totalBonus;
};

/**
 * Generates an array of broker information which includes their commission based on the given bonus structure
 * Assumes it doesn't matter that the output data is not padded to 2 decimal places as in the orignal CSV
 * Also assumes CSVs for each bonus structure will be generated from the original CSV provided
 * @param {array} brokerCases           The original broker cases.
 * @param {number} bonusCalculation     An integer value representing the commission structure used to calculate bonuses.
 * @return {array}                      An array of broker cases including their commission
 */
const getCommissionData = (brokerCases, bonusCalculation) => {
  const gBPBrokerCases = convertCasesToGBP(brokerCases, CURRENCY_LOOKUP);

  let commisionArr = gBPBrokerCases.slice(1).map(brokerCase => {
    const [BrokerName, CaseId, CaseValue] = brokerCase;

    //Commission array including the base commission amount
    const commissionArr = [BrokerName, CaseId, `£${BASE_COMMISSION}`];

    if (bonusCalculation) {
      //Calculate the bonus amount for the first bonus structure
      let bonus = bonusCalculator(
        CaseValue,
        THRESHOLD_AMOUNT_1,
        TARGET_AMOUNT_1
      );

      //Add the additional bonus on if this is for the second bonus structure
      if (bonusCalculation === BONUS_TYPE_2)
        bonus += bonusCalculator(
          CaseValue,
          THRESHOLD_AMOUNT_2,
          TARGET_AMOUNT_2
        );

      commissionArr.push(`£${bonus}`); //Add the bonus to the commission array
    }

    return commissionArr; // Return the commission array
  });

  //Add the CSV header onto the beginning of the array
  const header = ["BrokerName", "CaseId", "BaseCommission", "BonusCommission"];
  commisionArr.unshift(header);

  return commisionArr;
};

/**
 * Generates an array of brokers and their commission totals. Assumes order of cases is not important
 * Assumes it doesn't matter that the output data is not padded to 2 decimal places as in the orignal CSV
 * @param {array} brokerCases       An array of broker cases
 * @return {array}                  An array of brokers and their commission totals
 */
const getCommissionSummaryData = brokerCases => {
  const summaryObj = {}; //Lookup object to keep track of each broker's total commission

  brokerCases.slice(1).forEach(brokerCase => {
    const [BrokerName, CaseId, BaseCommission, BonusCommission] = brokerCase;

    let currentTotal = 0;

    //Get the broker's current total from the lookup object
    if (summaryObj.hasOwnProperty([BrokerName]))
      currentTotal = summaryObj[BrokerName];

    //Add the commissions to the current total in the lookup object
    summaryObj[BrokerName] =
      currentTotal +
      parseFloat(BaseCommission.substring(1)) +
      parseFloat(BonusCommission.substring(1));
  });

  const summaryArr = [["BrokerName", "TotalCommission"]];

  //Convert the lookup object to an array correctly formatted for csv parsing
  Object.keys(summaryObj).forEach(key => {
    const summary = [];
    summary.push(key);
    summary.push(`£${summaryObj[key]}`);
    summaryArr.push(summary);
  });

  return summaryArr;
};

/**
 * Reads the broker cases from CSV file and outputs a new CSV file condensing each broker's total commission into a single entry
 * Assumes csv files will be less than 1073741824 characters. (Longest is 69320)
 * @param {string} inputFileName            The location of the input CSV file
 * @param {string} outputFileName           The location to output the generated CSV
 * @param {function} dataGenerator          A function which converts broker case data into broker commission data
 * @return {void}
 */
const createCommissionCSV = (inputFileName, outputFileName, dataGenerator) => {
  let csvStr = fs.readFileSync(inputFileName, "utf8").trim();
  csvStr = getCaseCommissionData(csvStr, dataGenerator);
  fs.writeFileSync(outputFileName, csvStr, "utf8");
};

/**
 * Takes a csv string of broker cases and returns their corresponding commission data as a csv string
 * @param {string} csvStr             A CSV string of broker cases
 * @param {function} dataGenerator    A function that coverts broker cases to commission data
 * @return {string}                   Commission data as a CSV string
 */
const getCaseCommissionData = (csvStr, dataGenerator) => {
  const csvArr = convertCSVStrToArr(csvStr);
  const commissionData = dataGenerator(csvArr);
  return convertArrayToCSVStr(commissionData);
};

module.exports = {
  convertCSVStrToArr,
  convertArrayToCSVStr,
  convertCasesToGBP,
  bonusCalculator,
  getCommissionData,
  getCommissionSummaryData,
  getCaseCommissionData,
  createCommissionCSV,
  BONUS_TYPE_1,
  BONUS_TYPE_2,
  CURRENCY_LOOKUP
};
