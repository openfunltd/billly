function getLawBills(term, sessionPeriod, proposal_type) {
  return new Promise((resolve, reject) => {
    const url = `https://ly.govapi.tw/bill/?term=${term}&sessionPeriod=${sessionPeriod}` +
      `&bill_type=法律案&bill_type=修憲案&proposal_type=${proposal_type}` +
      "&limit=2000&field=提案人";
    $.getJSON(url, function(data) {
      resolve(data.bills);
    });
  });
}

function buildLinks(billNo, proposalID) {
  links = `<a href="https://ppg.ly.gov.tw/ppg/bills/${billNo}/details">公報網</a>`;
  links += ', ';
  if (proposalID === undefined) {
    links += '<span>law-diff<span>';
  } else {
    links += `<a href="https://openfunltd.github.io/law-diff/bills.html?billNo=${billNo}">law-diff</a>`
  }
  links += ', ';
  links += `<a href="https://ly.govapi.tw/bill/${billNo}">API</a>`
  return links;
}

function parseBillName(billName) {
  if (billName.substring(0, 2) === "廢止") {
    billName = billName.split("，")[0];
    billName = billName.replace(/[「」]/g, '');
  } else {
    const startIdx = billName.indexOf("「");
    const endIdx = billName.indexOf("」");
    billName = billName.substring(startIdx + 1, endIdx);
  }
  return billName;
}

function getProposer(proposers, proposal_from) {
  if (proposers != undefined) {
    return proposers[0];
  }
  if (proposal_from != undefined) {
    return proposal_from;
  }
  return 'No Data';
}

function renderDataTable(rows) {
  const table = $('#data-table').DataTable({
    keys: true,
    scrollX: true,
    columnDefs: [
        { orderable: false, targets: 'nosort' }
    ],
    fixedHeader: true,
    dom: '<<"row"<"col"B><"col filter_adjust"f>>>rtip',
    buttons: [
        'pageLength', 'copy', 'excel'
    ],
    order: [0, 'desc'],
  });

  table.rows.add(rows).draw(false);
  table.columns.adjust().draw();
}
