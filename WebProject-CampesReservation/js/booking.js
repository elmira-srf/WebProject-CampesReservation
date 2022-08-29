//Show same navigation bar on the top of each page
showNavigationBar = () => {
    $(".header-section").load("navigationBar.html");
}

//global variables
let maxAllowed = 10;
let currentCampsite = [];
let nightlyRate = 47.50;
const salesTax = 0.13;
const KEY_NAME = "reservationList";

//define a reserved list to store reservation information
class reserved {
    constructor(siteNumber, reservedNights) {
        this.siteNumber = siteNumber;
        this.reservedNights = reservedNights;
    }
}

// get reservation data from local storage
let reservations = localStorage.getItem("reservationList") == null ? [] : JSON.parse(localStorage.getItem("reservationList"));

//Azadeh has implemented this function
const displayPage = (containerElement) => {
    containerElement.innerHTML = `
        <div class="page-button">
            <button id="btn-choose">1. CHOOES A SITE</button>
            <button id="btn-pay">2. REVIEW AND PAY</button>
        </div>
        `
    let currentCampsiteObjects = getCurrentCampsite();

    containerElement.innerHTML += `
    <div class="reservation-section">
        <div class="campsiteDetails">
            <p id="top">1. SITE INFORMATION</p>
            <p>Site: ${currentCampsiteObjects.siteNumber}</p>
            <p>Equipment: ${currentCampsiteObjects.equipment} </p>
            <div class="featureIcon">
            ${showFeaturesIcon(currentCampsiteObjects).innerHTML}
            </div>
            <p>Availability: ${calculateNightAvailability(currentCampsiteObjects)} of 10 days</p>
        </div>

        <div class="guestDetail">
            <p id="top">2. GUEST DETAILS</p>
                <div class="selectorTag">
                    <lable>Number of Nights:</lable>
                    <input value="0" type="number" min="0" max="${maxAllowed}" id="numberOfNights">
                 </div>

            <div class="getInfo">
                <input type ="text" placeholder="Enter name" id="enteredName">
                <input type ="email" placeholder="Enter email" id="enteredemail">
                <button id="reserveButton">RESERVE</button>
            </div>
        </div>
    </div>
    <div class="receipt">
    </div>
    `
}

const pageLoaded = () => {
    showNavigationBar();
    displayPage(document.querySelector(".thirdPage-mainContainer"));
    document.querySelector("#reserveButton").addEventListener("click", generateReceipt);
    document.getElementById("btn-choose").classList.remove("selected")
    document.getElementById("btn-pay").classList.add("selected")
}
document.addEventListener("DOMContentLoaded", pageLoaded)

const getCurrentCampsite = () => {
    let currCampsite = localStorage.getItem("currentCampsite");
    currentCampsite = JSON.parse(currCampsite);
    return currentCampsite;
}

//Azadeh has implemented this function
const generateReceipt = (evt) => {
    const elementClicked = evt.target
    if (elementClicked.tagName === "BUTTON") {
        //A randomly generated reservation number
        let randomNumber = Math.floor(1000 + Math.random() * 9000);

        // - get the name and email entered in the box
        const nameEntered = document.querySelector("#enteredName").value;
        const emailEntered = document.querySelector("#enteredemail").value;
        console.log(nameEntered);
        console.log(emailEntered);
        if (nameEntered === "" || emailEntered === "") {
            alert("Please Enter Name and Email");
            return
        }

        const numberOfNights = document.querySelector("#numberOfNights").value;
        
        if (numberOfNights == 0) {
            alert("Please select at least one night");
        } else {
            makeReservation(numberOfNights)
            let [subtotal, tax, total] = costCalculation(numberOfNights);
            pageLoaded();

            let containerElement = document.querySelector(".receipt");
            containerElement.innerHTML = `
                <h2>Reservation #RES- ${randomNumber}</h2>
                <p>Name: ${nameEntered} </p>
                <p>Email: ${emailEntered} </p>
                <p>Num Nights: ${numberOfNights} </p>
                <p>Nightly Rate: ${nightlyRate} </p>
                <p>Subtotal: ${subtotal} </p>
                <p>Tax: ${tax} </p>
                <p>Total: ${total} </p>
            `
        }
    }
}

const costCalculation = (numberOfNights) => {
    nightlyRate = 47.50;
    if (currentCampsite.hasPower || currentCampsite.isPremium) {
        if (currentCampsite.isPremium) {
            nightlyRate = nightlyRate + (nightlyRate * 0.2);
        }
        if (currentCampsite.hasPower) {
            nightlyRate += 5;
        }
    }

    let subtotal = numberOfNights * nightlyRate;
    let tax = subtotal * salesTax;
    let total = subtotal + tax;
    return [parseFloat(subtotal).toFixed(2), parseFloat(tax).toFixed(2), parseFloat(total).toFixed(2)]
}

const makeReservation = (numberOfNights) => {
    if (localStorage.hasOwnProperty(KEY_NAME) === true) {
        console.log("localstorage already contains the list of reservations");
        if (reservations?.some(elem => elem.siteNumber === currentCampsite.siteNumber)) {
            console.log(`this sites already has a reservation : ${currentCampsite.siteNumber}`);
            //if yes, increase the reserved nights
            //findIndex - returns index of the matching object or -1
            let indexOfObjToReplace = reservations.findIndex(elem => elem.siteNumber === currentCampsite.siteNumber);
            //get the existing object
            let objectToUpdate = reservations[indexOfObjToReplace];
            console.log(objectToUpdate);
            //modify reserved nights
            objectToUpdate.reservedNights = parseInt(numberOfNights) + parseInt(objectToUpdate.reservedNights)

            //replace the object in the list
            reservations[indexOfObjToReplace] = objectToUpdate;
            localStorage.setItem(KEY_NAME, JSON.stringify(reservations));
        } else {
            console.log(`there is no reservation on this site: ${currentCampsite.siteNumber}`);
            //if not, add new reservation in the list
            const reservationToBeAdded = new reserved(currentCampsite.siteNumber, parseInt(numberOfNights));
            reservations.push(reservationToBeAdded);
            localStorage.setItem(KEY_NAME, JSON.stringify(reservations));

        } 
        return reservations
    } else {
        //there is no reservation list
        console.log("localstorage does not have any list of reservations...creating a new list");
        const reservationToBeAdded = new reserved(currentCampsite.siteNumber, parseInt(numberOfNights))
        reservations.push(reservationToBeAdded);
        localStorage.setItem(KEY_NAME, JSON.stringify(reservations));
    }
}

const calculateNightAvailability = (currentCampsite) => {
    for (let i = 0; i < reservations.length; i++) {
        if (currentCampsite.siteNumber === reservations[i].siteNumber) {
            maxAllowed = 10 - reservations[i].reservedNights;
            return 10 - reservations[i].reservedNights;
        }
    }
    return 10;
}

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