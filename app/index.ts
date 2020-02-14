interface companiesAndUsersInterface {
    users: usersInterface,
    companies: companiesInterface;
}

const fetchWithTimeout = (timeout: number, promise: any) => {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            reject(new Error('Request Timed Out :('))
        }, timeout);
        promise.then(
            (response: any) => {
                console.log(response)
                const usersAndCompaniesData: companiesAndUsersInterface = resolve(response.json());
                return usersAndCompaniesData;
            }
    })
}

fetchWithTimeout(5000, fetch("http://localhost:3000/db"))
    .then(usersAndCompaniesData => workWithData(usersAndCompaniesData))
    .catch(timeOutError => console.log(timeOutError))

/*
const fetchAsync = async () => {
    const response = await fetch("http://localhost:3000/db");
    console.log(response);
    const usersAndCompaniesData: companiesAndUsersInterface = await response.json();
    return usersAndCompaniesData;
}
fetchAsync()
    .then(usersAndCompaniesData => workWithData(usersAndCompaniesData))
    .catch(err => console.log('Error: ', err))
*/
function ascending(naturalSorting: usersInterface): void{
    naturalSorting.sort((a: usersInterface, b: usersInterface) => a.uri.localeCompare(b.uri, undefined, { numeric: true, sensitivity: 'base' }));
}
//I wanna change /user/1 'string' into 1 'number'
function onlyNumber(stringElement: string): number{
    const result: RegExpMatchArray = stringElement.match(/\d+/g);
    return parseInt(result, 10);
}
interface usersInterface {
    name: string;
    uri: string;
    email: string;
    uris: urisInterface;
    filter(param : (item) => boolean) : usersInterface;
    sort(param : (a : usersInterface, b : usersInterface) => number) : void;
}
interface urisInterface {
    company: string
}
interface companiesInterface {
    name: string;
    uri: string;
    forEach(param : (company) => void, object : object) : void;
}
function workWithData(companiesAndUsers: companiesAndUsersInterface) {
    const allCompaniesObj: companiesInterface = <companiesInterface>companiesAndUsers.companies;
    const allUsersObj: usersInterface = companiesAndUsers.users;
    ascending(allUsersObj);
    let usersSortedByCompany: string[] = [];
    //Alternatively, we can replace forEach with for(const company of Object.values(allCompaniesObj))
    allCompaniesObj.forEach(company => {
            const companyName : string[] = [company.name];
            const usersWithTheSameCompany : usersInterface = allUsersObj.filter(item => company.uri === item.uris.company);
            companyName.push(usersWithTheSameCompany);//Object with Users data pushed to individual Company
            usersSortedByCompany.push(companyName); //Without this line, companyName isn't a function
        },

    usersSortedByCompany.reduce((accumulator: object, currentItem: string, index: number) => {
        accumulator[index] = currentItem;
        return accumulator;
    }, {});
    drawTable(usersSortedByCompany);
}

function drawTable(Data: object | string): void {
    for (const value of Object.values(Data)) {  //value[0] is a name of Company.
        const userData: usersInterface = value[1]; //value[1] is an object with all Users data for value[0].
        const userName: string[] = [];
        const emails: string[] = [];            //I pushed all data into new arrays.
        const usersPopulation: string[] = [];
        const companyNameInHeader: string[] = [];
        companyNameInHeader.push(value[0]);     //companyNameInHeader is a header in my table.
        for (const value of Object.values(userData)) {
            userName.push(value.name);
            emails.push(value.email);
            usersPopulation.push(value.uri)
        }
        function addCell(tableRow: HTMLTableRowElement, dataItemToDisplay: string): void {
            const tableDataCell: HTMLTableDataCellElement = document.createElement("td");
            tableDataCell.innerHTML = dataItemToDisplay;
            tableRow.appendChild(tableDataCell);
        }

        function addHeaderCell(tableRow: HTMLTableRowElement, headerItemToDisplay: string): void {
            const tableHeaderCell: HTMLTableHeaderCellElement = document.createElement("th");
            tableHeaderCell.innerHTML = headerItemToDisplay;
            tableRow.appendChild(tableHeaderCell);
        }

        function addRowInBodySection(table: HTMLTableElement, userName: string, email: string, usersPopulation: number): void {
            const tableRow: HTMLTableRowElement = document.createElement("tr");
            tableRow.className = 'data';  //display: none => change to table-row on click.
            addCell(tableRow, userName);
            addCell(tableRow, email);
            addCell(tableRow, usersPopulation);
            table.appendChild(tableRow);
        }

        function addRowInHeaderSection(divTarget : HTMLElement, table : HTMLTableElement, companyName : string) {
            const tableRow: HTMLTableRowElement = document.createElement("tr");
            const tableHead: HTMLTableSectionElement = document.createElement("thead");
            tableRow.className = 'header';
            addHeaderCell(tableRow, companyName);
            tableHead.appendChild(tableRow);
            table.appendChild(tableHead);
            divTarget.appendChild(table)
        }

        function newTable(): void {
            const division: HTMLElement = document.getElementById('div');
            const newTable: HTMLTableElement = document.createElement("table");
            newTable.className = 'MyTable table-bordered table-hover table-dark list-item';
            newTable.id = 'newTable';
            addRowInHeaderSection(division, newTable, companyNameInHeader)
            for (let i = 0; i < userName.length; i++) {
                addRowInBodySection(newTable, userName[i], emails[i], onlyNumber(usersPopulation[i]));
            }
        }
        newTable();
    }
    expandAndCollapse();
    pagination();
}
function pagination(): void {
    const items: object = $(".list-wrapper .list-item");
    const numItems: number = items.length;
    const perPage: number = 5;
    items.slice(perPage).hide();
    //@ts-ignore it's external lib included in index.html
    $('#pagination-container').pagination({
        items: numItems,
        itemsOnPage: perPage,
        prevText: "&laquo;", //html entity <<
        nextText: "&raquo;", //html entity >>
        onPageClick: function (pageNumber: number): void {
            const showFrom: number = perPage * (pageNumber - 1);
            const showTo: number = showFrom + perPage;
            items.hide().slice(showFrom, showTo).show();
        }
    })
}
function expandAndCollapse(): void {
    $('thead').click(function(){
        $(this).nextUntil('thead').css('display', function(){
            return this.style.display === 'table-row' ? 'none' : 'table-row';
        })
    })
}


