$(document).ready(main());

async function main(tableId) {
  term = 11;
  sessionPeriod = 1;

  const bills_1 = await getLawBills(term, sessionPeriod, '委員提案');
  const bills_2 = await getLawBills(term, sessionPeriod, '政府提案');
  const bills = bills_1.concat(bills_2);
  const lawNameMap = await getLawNameMap(bills);
  let rows = [];

  for (bill of bills) {
    releaseDate = bill.mtime.substr(0, 10);
    hasLawDiff = (bill.對照表 === undefined) ? '❌' : '✅'; 
    proposalID = bill.提案編號 ?? 'No Data';
    proposer = getProposer(bill.提案人, bill['提案單位/提案委員']);
    billName = parseBillName(bill.議案名稱);
    lawNames = buildLawNames(bill.laws, lawNameMap);
    links = buildLinks(bill.billNo, bill.對照表);
    row = [links, hasLawDiff, releaseDate, proposalID, proposer, billName, lawNames];
    rows.push(row);
  }

  renderDataTable(rows);
}
