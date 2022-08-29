//Show same navigation bar on the top of each page
showNavigationBar = () => {
    $(".header-section").load("navigationBar.html");
}

//show form container
const showFormContainer = (containerElement) => {
    const maxNightsAvailable = 10;
    containerElement.innerHTML = `
        <div class="grid-item">
        <i class="bi bi-x-circle"></i>
         <label>Equipment Type</label>
             <select id="selectedEquipmentType">
                <option value="Show All">Show All</option>
                <option value="Single Tent">Single Tent</option>
                <option value="3 Tents">3 Tents</option>
                <option value="Trailer up to 18ft">Trailer up to 18ft</option>
            </select>
        </div>

        <div class="grid-item" id="nightsAvailables">
            <label>Nights</label>
        </div>
        <div class="grid-item">
            <a href="chooseCampsite.html" id="clickOnButton">
            <button class="custom-button">Reserve</button>
            </a>
        </div>
    `

    const nightsAvailablesContainer = document.querySelector("#nightsAvailables");
    //Create and append select list
    let selectList = document.createElement("select");
    selectList.id = "selectedNight";
    nightsAvailablesContainer.appendChild(selectList);
    //Create and append the options
    for (let i = 1; i <= maxNightsAvailable; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = i;
        selectList.appendChild(option);
    }
}

// showFormContainer(document.querySelector(".grid-container"));

const pageLoaded = () => {
    showNavigationBar();
    showFormContainer(document.querySelector(".grid-container"));

    // listeners for the select dropdown
    document.querySelector("#selectedEquipmentType").addEventListener("change", getUserSelection);
    document.querySelector("#selectedNight").addEventListener("change", getUserSelection);
}
document.addEventListener("DOMContentLoaded", pageLoaded)

//get the selected value and save them into local storage
let dataSelected = [];
const getUserSelection = () => {
    let selectedType = document.querySelector("#selectedEquipmentType").value;
    let selectedNight = document.querySelector("#selectedNight").value;
    document.getElementById("clickOnButton").innerHTML = `
    <a href="chooseCampsite.html?=${selectedType}">
    <button class="custom-button">Reserve</button>
    </a>
    `
    
    dataSelected = [selectedType, selectedNight];
    localStorage.setItem("dataSelected", JSON.stringify(dataSelected));
}
