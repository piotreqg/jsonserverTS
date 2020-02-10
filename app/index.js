fetch("http://localhost:3000/db", { method: 'get' })
    .then(function (response) { return response.json(); })
    .then(function (myJSONData) { return workWithData(myJSONData); });
function ascending(naturalSorting) {
    naturalSorting.sort(function (a, b) { return a.uri.localeCompare(b.uri, undefined, { numeric: true, sensitivity: 'base' }); });
}
//I wanna change /user/1 'string' into 1 'number'
function onlyNumber(stringElement) {
    var result = stringElement.match(/\d+/g);
    return parseInt(result, 10);
}
function workWithData(companiesAndUsers) {
    var allUsersObj = companiesAndUsers.users;
    var allCompaniesObj = companiesAndUsers.companies;
    ascending(allUsersObj);
    var usersSortedByCompany = [];
    // @ts-ignore
    allCompaniesObj.forEach(function (company) {
        var companyName = [company.name];
        var usersWithTheSameCompany = allUsersObj.filter(function (item) { return company.uri === item.uris.company; });
        companyName.push(usersWithTheSameCompany); //Object with Users data pushed to individual Company
        usersSortedByCompany.push(companyName); //Without this line, companyName isn't a function
    }, usersSortedByCompany.reduce(function (accumulator, currentItem, index) {
        accumulator[index] = currentItem;
        return accumulator;
    }, {}));
    drawTable(usersSortedByCompany);
}
function drawTable(Data) {
    var _loop_1 = function (value) {
        var userData = value[1]; //value[1] is an object with all Users data for value[0].
        var userName = [];
        var emails = []; //I pushed all data into new arrays.
        var usersPopulation = [];
        var companyNameInHeader = [];
        companyNameInHeader.push(value[0]); //companyNameInHeader is a header in my table.
        for (var _i = 0, _a = Object.values(userData); _i < _a.length; _i++) {
            var value_1 = _a[_i];
            userName.push(value_1.name);
            emails.push(value_1.email);
            usersPopulation.push(value_1.uri);
        }
        function addCell(tableRow, dataItemToDisplay) {
            var tableDataCell = document.createElement("td");
            tableDataCell.innerHTML = dataItemToDisplay;
            tableRow.appendChild(tableDataCell);
        }
        function addHeaderCell(tableRow, headerItemToDisplay) {
            var tableHeaderCell = document.createElement("th");
            tableHeaderCell.innerHTML = headerItemToDisplay;
            tableRow.appendChild(tableHeaderCell);
        }
        function addRowInBodySection(table, userName, email, usersPopulation) {
            var tableRow = document.createElement("tr");
            tableRow.className = 'data'; //display: none => change to table-row on click.
            addCell(tableRow, userName);
            addCell(tableRow, email);
            addCell(tableRow, usersPopulation);
            table.appendChild(tableRow);
        }
        function addRowInHeaderSection(divTarget, table, companyName) {
            var tableRow = document.createElement("tr");
            var tableHead = document.createElement("thead");
            tableRow.className = 'header';
            addHeaderCell(tableRow, companyName);
            tableHead.appendChild(tableRow);
            table.appendChild(tableHead);
            divTarget.appendChild(table);
        }
        function newTable() {
            var division = document.getElementById('div');
            var newTable = document.createElement("table");
            newTable.className = 'MyTable table-bordered table-hover table-dark list-item';
            newTable.id = 'newTable';
            addRowInHeaderSection(division, newTable, companyNameInHeader);
            for (var i = 0; i < userName.length; i++) {
                addRowInBodySection(newTable, userName[i], emails[i], onlyNumber(usersPopulation[i]));
            }
        }
        newTable();
    };
    for (var _i = 0, _a = Object.values(Data); _i < _a.length; _i++) {
        var value = _a[_i];
        _loop_1(value);
    }
    expandAndCollapse();
    pagination();
}
function pagination() {
    var items = $(".list-wrapper .list-item");
    var numItems = items.length;
    var perPage = 5;
    items.slice(perPage).hide();
    //@ts-ignore it's external lib included in index.html
    $('#pagination-container').pagination({
        items: numItems,
        itemsOnPage: perPage,
        prevText: "&laquo;",
        nextText: "&raquo;",
        onPageClick: function (pageNumber) {
            var showFrom = perPage * (pageNumber - 1);
            var showTo = showFrom + perPage;
            items.hide().slice(showFrom, showTo).show();
        }
    });
}
function expandAndCollapse() {
    $('thead').click(function () {
        $(this).nextUntil('thead').css('display', function () {
            return this.style.display === 'table-row' ? 'none' : 'table-row';
        });
    });
}
