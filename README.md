# Introduction

Completed tech test

# Installation (linux)

- Clone the repo from your terminal using the following command:

```bash
git clone https://github.com/chima2g/pure-retirement.git 
```
- Run `cd ./pure-retirement`
- Run `npm i` 
- Run `npm test` to run the unit tests
- Run `npm start` to generate the required csv files  
This generates files basicPay.csv
bonus1Pay.csv
bonus2Pay.csv
bonusSummary.csv

# Assumptions

- Bonus is not paid on a pro-rata basis, e.g. bonus is only paid for each whole amount of £10,000 over £100,000
- It doesn't matter that values output to CSV are not padded to 2 decimal places as in the orignal CSV
- CSVs for each of the two bonus structures will be generated from the original CSV provided
- The order that broker total commision is written to file is not important
- CSV files will be less than 1073741824 characters. (The longest CSV is 69320 characters.)