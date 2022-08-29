//Show same navigation bar on the top of each page
showNavigationBar = () => {
    $(".header-section").load("navigationBar.html");
}

//get reserved site information
let reservations = localStorage.getItem("reservationList") == null ? [] : JSON.parse(localStorage.getItem("reservationList"));
console.log(reservations);

//global variables
const maxNightsAvailable = 10;
let [type, night] = [];

let EquipmentTypeSelected = "";
let nightNumberSelected = 0; // default value

let siteNumberList = [];

let allCampsites = [];

// get selected data from landing page
const getCampsiteFromPrevScreen = () => {
    let queryString = location.search;
    let [type, night] = localStorage.getItem("dataSelected") == null ? ["Show All", "1"] : JSON.parse(localStorage.getItem("dataSelected"));
    if (queryString === "") {
        // user comes to the second screen by clicking on link of navigation bar
        EquipmentTypeSelected = "Show All"
        nightNumberSelected = "1";

    } else {
        // user comes to the second screen by clicking on reserve button
        console.log(`selectedEquipmentType: ${type}`);
        console.log(`selectedNight: ${night}`);
        EquipmentTypeSelected = type;
        nightNumberSelected = night;
    }

    changeSelected();

}

//create and show top section of the page
const showtopSection = (containerElement) => {
    containerElement.innerHTML = `
        <div class="page-button">
            <button id="btn-choose">1. CHOOES A SITE</button>
            <button id="btn-pay">2. REVIEW AND PAY</button>
        </div>

        <div class="filters">
            <div class="column">
                <label>Filter by equipment:</label>
                <select id="equipmentTypeID">
                    <option value="Show All">Show All</option>
                    <option value="Single Tent">Single Tent</option>
                    <option value="3 Tents">3 Tents</option>
                    <option value="Trailer up to 18ft">Trailer up to 18ft</option>
                </select>
            </div>
            <div class="column" id="nightsAvailables">
                <label>Filter by Available Nights: </label>
            </div> 
        </div>

        <section>
        <div class="site">

        </div>
    </section>
    `


    const nightsAvailablesContainer = document.querySelector("#nightsAvailables");
    //Create and append select list
    let selectList = document.createElement("select");
    selectList.id = "nightID";
    nightsAvailablesContainer.appendChild(selectList);
    //Create and append the options
    for (let i = 0; i <= maxNightsAvailable; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = i;
        option.selected = false;
        selectList.appendChild(option);
    }
}

const pageLoaded = () => {
    showNavigationBar();
    showtopSection(document.querySelector(".secondPage-mainContainer"));
    getCampsiteFromPrevScreen();
    fetchCampsites();

    document.querySelector("#equipmentTypeID").addEventListener("change", equipmentTypeChanged);
    document.querySelector("#nightID").addEventListener("change", availableNightsChanged);

    document.getElementById("btn-choose").classList.add("selected")
    document.getElementById("btn-pay").classList.remove("selected")
}
document.addEventListener("DOMContentLoaded", pageLoaded)


//change default value of filters
const changeSelected = () => {
    const selectedNight = document.querySelector('#nightID');
    const selectedType = document.querySelector('#equipmentTypeID');
    const typeOptions = Array.from(selectedType.options);
    const nightOptions = Array.from(selectedNight.options);
    const typeOptionToSelect = typeOptions.find(item => item.text === EquipmentTypeSelected);
    const optionToSelect = nightOptions.find(item => item.text === nightNumberSelected);
    optionToSelect.selected = true;
    typeOptionToSelect.selected = true;
};

const jsonURL = "Campsite.json";

const fetchCampsites = async () => {
    try {
        const responseFromJson = await fetch(jsonURL);
        const jsonData = await responseFromJson.json();

        allCampsites = jsonData;
        console.log(`data received from JSON file : ${jsonData}`);

        document.querySelector(".site").innerHTML = "";

        filteringProcess(jsonData);

    } catch (err) {
        console.log(`error while fetching data from JSON file : ${err}`);
    }
};

//Elmira has implemented this function
const filteringProcess = (jsonData) => {
    //when equipmnet type is show all, filter by night number
    if (EquipmentTypeSelected == "Show All") {
        filterByNight(jsonData);

        // listeners for the click button
        document.querySelector(".site").addEventListener("click", goToNextPage);

    } else {
        for (let i = 0; i < jsonData.length; i++) {
            //define a list to store those campsite which has the selected Equipment  
            let equppedCampsite = [];
            for (let j = 0; j < jsonData[i].equipment.length; j++) {
                if (EquipmentTypeSelected === jsonData[i].equipment[j]) {
                    equppedCampsite.push(jsonData[i]);
                }
            }

            filterByNight(equppedCampsite);

            // listeners for the click button
            document.querySelector(".site").addEventListener("click", goToNextPage);
        }
    }
}

//Elmira has implemented this function
const filterByNight = (campsite) => {
    let campsiteFound = false;
    if (!reservations.length == 0) {
        for (let n = 0; n < campsite.length; n++) {
            for (let k = 0; k < reservations.length; k++) {
                if (campsite[n].siteNumber === reservations[k].siteNumber) {
                    campsiteFound = true;
                    if (10 - reservations[k].reservedNights >= nightNumberSelected) {
                        showSite(campsite[n]);
                    }
                }
            }

            // if the campsite is not reserved, show the campsite with no reservation
            if (!campsiteFound) {
                showSite(campsite[n])
            }
            campsiteFound = false;
        }
    } else {
        for (let n = 0; n < campsite.length; n++) {
            showSite(campsite[n]);
        }
    }
}

const equipmentTypeChanged = () => {
    document.querySelector("#nightID").value = 0;
    nightNumberSelected = 0;
    EquipmentTypeSelected = document.querySelector("#equipmentTypeID").value;
    fetchCampsites();
}


const availableNightsChanged = () => {
    document.querySelector("#equipmentTypeID").value = "Show All";
    EquipmentTypeSelected = "Show All"
    nightNumberSelected = document.querySelector("#nightID").value;
    fetchCampsites();
}

const goToNextPage = (evt) => {
    const elementClicked = evt.target
    if (elementClicked.tagName === "BUTTON") {
        const id = elementClicked.getAttribute("data-campsite-id");
        let currcampID = findSelectedCampsite(parseInt(id));
        localStorage.setItem("currentCampsite", JSON.stringify(currcampID));
        window.location.href = "booking.html";
    }
}


const findSelectedCampsite = (id) => {
    // search by siteNumber
    for (let i = 0; i < allCampsites.length; i++) {
        if (allCampsites[i].siteNumber === id) {
            // return campsite
            console.log(`Available sites : ${allCampsites[i]}`);
            return allCampsites[i];
        }
    }
    // otherwise, no matching campsite found
    return null
}

//show list of campsites' information
const showSite = (currentCampsite) => {
    document.querySelector(".site").innerHTML += `
    <div class="camp">
        <div>
        <img src="${currentCampsite.image} " class="largeImage" />
        </div>

        <div class="siteInfo">
            <div>
                <p>SITE: ${currentCampsite.siteNumber}</p>
                <p>Equipment: ${currentCampsite.equipment}</p>
            </div>
            <div>
                <p>AVAILABILITY: ${calculateCampsiteAvailableNights(currentCampsite.siteNumber)} OF 10 DAYS</p>
                <div class="nightIcon">
                ${showNightIcon(currentCampsite.siteNumber).innerHTML}
                </div>
            </div>
            <div>
                <p>SITE FEATURES</p>
                <div class="featureIcon">
                ${showFeaturesIcon(currentCampsite).innerHTML}
                </div>
            </div>
        </div>


        <div>
        <button class="booking" data-campsite-id="${currentCampsite.siteNumber}">Book Site</button>
        </div>
    </div>
    `

}

//show campsites' features by Icon
const showFeaturesIcon = (currentCampsite) => {
    let containerElement = document.getElementsByClassName("featureIcon");
  
    containerElement.innerHTML = '';
    if (currentCampsite.hasPower) {
        containerElement.innerHTML += `
            <i class="fa fa-plug" aria-hidden="true" id="plugId"></i>
            `
    }
    if (currentCampsite.isPremium) {
        containerElement.innerHTML += `
            <i class="fa fa-coffee" aria-hidden="true"></i>
            `
    }
    if (currentCampsite.isRadioFree) {
        containerElement.innerHTML += `
            <i class="fa fa-music" aria-hidden="true"></i>
            `
    }
    if (!currentCampsite.hasPower && !currentCampsite.isPremium && !currentCampsite.isRadioFree) {
        containerElement.innerHTML = '';
        containerElement.innerHTML = `
            <p class="noFeature">No Feature Available</p>
            `;
    }

    return containerElement;
}

//show campsites' available nights by circle
const showNightIcon = (siteNumber) => {
    let containerElement = document.getElementsByClassName("nightIcon");
   
    containerElement.innerHTML = '';
    for (let j = 1; j <= 10 - calculateCampsiteAvailableNights(siteNumber); j++) {
        containerElement.innerHTML += `
            <i class="fa fa-times-circle-o redCircle" aria-hidden="true"></i>
            `
    }
    for (let j = 1; j <= calculateCampsiteAvailableNights(siteNumber); j++) {
        containerElement.innerHTML += `
            <i class="fa fa-circle-thin greenCircle" aria-hidden="true"></i> 
            `
    }
    return containerElement;
}

//calculate and return available nights number
const calculateCampsiteAvailableNights = (siteNumber) => {
    let currentAvailableNights = 10;
    if (reservations.some(elem => elem.siteNumber === siteNumber)) {
        //if yes, calculate available nights
        let indexOfObjToReplace = reservations.findIndex(elem => elem.siteNumber === siteNumber);
        currentAvailableNights = 10 - parseInt(reservations[indexOfObjToReplace].reservedNights);
    }
    return currentAvailableNights;
}