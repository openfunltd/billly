$(document).ready(main());

async function main(tableId) {
  term = 11;
  sessionPeriod = 1;

  const bills_1 = await getLawBills(term, sessionPeriod, '委員提案');
  const bills_2 = await getLawBills(term, sessionPeriod, '政府提案');
  let bills = bills_1.concat(bills_2);
  let rows = [];

  for (bill of bills) {
    releaseDate = bill.mtime.substr(0, 10);
    proposalID = bill.提案編號 ?? 'No Data';
    proposer = getProposer(bill.提案人, bill['提案單位/提案委員']);
    billName = parseBillName(bill.議案名稱);
    links = buildLinks(bill.billNo, proposalID);
    row = [links, releaseDate, proposalID, proposer, billName];
    rows.push(row);
  }

  renderDataTable(rows);
}
