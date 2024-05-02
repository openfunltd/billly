function getLawBills(term, sessionPeriod, proposal_type) {
  return new Promise((resolve, reject) => {
    const url = `https://ly.govapi.tw/bill/?term=${term}&sessionPeriod=${sessionPeriod}` +
      `&bill_type=法律案&bill_type=修憲案&proposal_type=${proposal_type}` +
      "&limit=2000&field=提案人&field=對照表&field=laws";
    $.getJSON(url, function(data) {
      resolve(data.bills);
    });
  });
}

function getLawNames(laws) {
  lawNames = '';
  for (law of laws) {
    lawNames += ', ';
    lawNames += `<a href="https://ly.govapi.tw/law/${law}">${law}</a>`
  }
  if (lawNames.length > 0) {
    return lawNames.substring(2);
  }
  return '';
}

function buildLinks(billNo, lawDiff) {
  links = `<a href="https://ppg.ly.gov.tw/ppg/bills/${billNo}/details">公報網</a>`;
  links += ', ';
  if (lawDiff === undefined) {
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
  } else if (billName.substring(0, 3) === "擬撤回") {
    return billName;
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
        { orderable: false, targets: 'nosort' },
        { className: 'dt-center', targets: 1},
    ],
    fixedHeader: true,
    dom: '<<"row"<"col"B><"col filter_adjust"f>>>rtip',
    buttons: [
        'pageLength', 'copy', 'excel'
    ],
    order: [2, 'desc'],
  });

  table.rows.add(rows).draw(false);
  table.columns.adjust().draw();
}
