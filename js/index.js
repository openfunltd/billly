$(document).ready(main());

async function main(tableId) {
  const stat = await getStat();
  term = getTerm(stat);
  sessionPeriod = getSessionPeriod(term, stat);

  renderTermOptions(stat, term);
  renderSessionPeriodOptions(stat, term);

  const bills = await getTermLawBills(term, stat);
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
