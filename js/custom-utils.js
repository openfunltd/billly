function getStat() {
  return new Promise((resolve, reject) => {
    url = 'https://ly.govapi.tw/stat';
    $.getJSON(url, function(data) {
      resolve(data.bill.terms);
    });
  });
}

function getTerm(stat) {
  const GET_term = document.location.search.match(/term=([0-9]*)/);
  let term = (GET_term) ? GET_term[1] : '';
  termStat = stat.filter((termStat) => termStat.term == term)[0];
  if (term === '' || termStat === undefined) {
    term = stat[0].term;
  }
  return term;
}

function getSessionPeriod(term, stat) {
  const GET_sessionPeriod = document.location.search.match(/sessionPeriod=([0-9]*)/);
  let sessionPeriod = (GET_sessionPeriod) ? GET_sessionPeriod[1] : '';
  if (sessionPeriod === '') {
    termStat = stat.filter((termStat) => termStat.term == term)[0];
    sessionPeriod = termStat.sessionPeriod_count[0].sessionPeriod;
  }
  return sessionPeriod;
}

function renderTermOptions(stat, term) {
  let termOptionsText = stat.reduce((acc, termStat) => {
    theTerm = termStat.term;
    if (theTerm != term) {
      acc += ` <a href='.?term=${theTerm}'>第${theTerm}屆</a>`;
    } else {
      acc += ` <span>第${theTerm}屆</span>`
    }
    return acc;
  }, '');
  termOptionsText = '屆期:' + termOptionsText;
  const termsP = document.getElementById("term");
  termsP.innerHTML = termOptionsText
  termsP.style.display = 'block';
}

function renderSessionPeriodOptions(stat, term, sessionPeriod) {
  sessionPeriods = stat.filter((theTerm) => theTerm.term == term)[0].sessionPeriod_count;
  let sessionPeriodOptionsText = sessionPeriods.reduce((acc, sessionPeriodStat) => {
    theSessionPeriod = sessionPeriodStat.sessionPeriod;
    if (theSessionPeriod != sessionPeriod) {
      acc += ` <a href='.?term=${term}&sessionPeriod=${theSessionPeriod}'>第${theSessionPeriod}會期</a>`
    } else {
      acc += ` <span>第${theSessionPeriod}會期</span>`;
    }
    return acc;
  }, '');
  sessionPeriodOptionsText = '會期:' + sessionPeriodOptionsText;
  const sessionPeriodP = document.getElementById("sessionPeriod");
  sessionPeriodP.innerHTML = sessionPeriodOptionsText;
  sessionPeriodP.style.display = 'block';
}

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

function getLaws(url) {
  return new Promise((resolve, reject) => {
    $.getJSON(url, function(data) {
      resolve(data.laws);
    });
  });
}

async function getLawNameMap(bills) {
  lawIds = [];
  urlBase = 'https://ly.govapi.tw/law?';
  lawCnt = 0;
  for (bill of bills) {
    if (bill.laws === undefined) {
      continue;
    }
    for (law of bill.laws) {
      if (!lawIds.includes(law)) {
        lawIds.push(law);
      }
    }
  }
  lawIdsChunk = []
  chunkSize = 200;
  for (let i=0; i < lawIds.length; i += chunkSize) {
    lawIdsChunk.push(lawIds.slice(i, i + chunkSize));
  }
  laws = [];
  for (lawIds of lawIdsChunk) {
    query = '';
    for (lawID of lawIds) {
      query += `&id=${lawID}`;
    }
    const url = urlBase + query.substring(1) + '&limit=200';
    laws = laws.concat(await getLaws(url));
  }
  lawNameMap = laws.reduce((acc, curr) => {
    acc[curr.id] = curr.name;
    return acc
  }, {});
  return lawNameMap;
}

function buildLawNames(laws, lawNameMap) {
  if (laws === undefined) {
    return '';
  }
  result = '';
  for (lawID of laws) {
    result += `, ${lawNameMap[lawID]}`
  }
  if (result.length > 0) {
    return result.substring(2);
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
    initComplete: function () {
      this.api()
        .columns()
        .every(function () {
          let column = this;
          if (this.index() === 0) {
            return;
          }
          let title = this.footer().textContent;
          let input = document.createElement('input');
          input.placeholder = title;
          column.footer().replaceChildren(input);
          input.addEventListener('keyup', () => {
            if (column.search() !== this.value) {
              column.search(input.value).draw();
            }
          });
        });
    },
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
