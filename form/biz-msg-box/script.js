// bottom menu icons start
var callCont = document.querySelector(".call-container");
var telegramCont = document.querySelector(".telegram-container");
var emailCont = document.querySelector(".email-container");
var urlCont = document.querySelector(".url-container");

function comeFromBlock(containerName) {
    setTimeout(function () {
        containerName.style.display = "flex";
        containerName.style.transform = "scale(.3) rotateZ(360deg)";

    }, 500);
    setTimeout(function () {
        containerName.style.transform = "scale(.8) rotateZ(0deg)";
        containerName.style.opacity = "1";
    }, 1000);
}

// comeFromBlock(telegramCont);
comeFromBlock(callCont);
// comeFromBlock(urlCont);
comeFromBlock(emailCont);
// bottom menu icons end

// country select start
function toggleCon() {
    document.querySelector(`#country-select`).querySelector(".dropdown").classList.toggle(`active`);
    document.querySelector(`#country-select`).querySelector(".val").classList.toggle(`active`);
}
function fetchCountryData(callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            callback(data);
        }
    };
    xhr.open('GET', 'https://www.playabacusindia.com/form/tele-abacus/database/all.json', true);
    xhr.send();
}
function populateSelect() {
    fetchCountryData(function (countries) {
        var select = document.getElementById('country-select').querySelector(".dropdown").querySelector(".items");
        countries.forEach(function (country) {
            if (country.idd.suffixes) {
                var option = document.createElement('div');
                if (country.idd.suffixes.length == 1) {
                    option.innerHTML = `<img src="${country.flags.png}"> <span>${country.name.common} (${country.idd.root + country.idd.suffixes[0]})</span>`;
                    option.setAttribute('data-flag', country.flags.png);
                    option.setAttribute('data-name', country.idd.root + country.idd.suffixes);
                    option.addEventListener('click', () => {
                        document.getElementById('country-select').querySelector(".val").innerHTML = `<img src="${country.flags.png}">` + country.idd.root + country.idd.suffixes[0];
                        document.getElementById('country-select').querySelector(".val").dataset.value = country.idd.root + country.idd.suffixes[0];
                        toggleCon();
                    })
                } else {
                    option.innerHTML = `<img src="${country.flags.png}"> <span>${country.name.common} (${country.idd.root})</span>`;
                    option.setAttribute('data-flag', country.flags.png);
                    option.setAttribute('data-name', country.idd.root + country.idd.suffixes);
                    option.addEventListener('click', () => {
                        document.getElementById('country-select').querySelector(".val").innerHTML = `<img src="${country.flags.png}">` + country.idd.root;
                        document.getElementById('country-select').querySelector(".val").dataset.value = country.idd.root;
                        toggleCon();
                    })
                }
                select.prepend(option);
            }
        });

        const containerDiv = document.getElementById('country-select').querySelector(".dropdown");
        let divs = containerDiv.querySelectorAll('.items div');

        document.getElementById('searchInput').addEventListener('input', function () {
            let searchText = document.getElementById('searchInput').value.toLowerCase();
            divs.forEach(div => {
                console.log(div)
                let divText = div.querySelector("span").textContent.toLowerCase();
                console.log(divText)
                if (divText.includes(searchText)) {
                    div.classList.remove('hidden');
                    div.style.display = 'flex'; // Show the matched div
                    containerDiv.scrollTo(0, div.offsetTop); // Scroll to the matched div
                } else {
                    div.classList.add('hidden');
                    div.style.display = 'none'; // Hide the unmatched div
                }
            });
        });


    });



}
populateSelect();

// country select end


// form box start

function msgBox() {
    document.querySelector("#tele-chatbox-unique").classList.toggle("active")
}
var captchaNumber;
var canvas = document.getElementById("captchaCanvas");
var ctx = canvas.getContext("2d");

function createCaptcha() {
    captchaNumber = Math.floor(1000 + Math.random() * 9000);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff"; // Set fill color to white
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with white
    ctx.font = "30px cursive";
    ctx.fillStyle = "rgb(223, 42, 23)" // Set text color to black
    ctx.fillText(captchaNumber, 10, 30);

    for (var i = 0; i < canvas.width; i++) {
        for (var j = 0; j < canvas.height; j++) {
            if (Math.random() > 0.6) { // Increase the noise probability
                var data = ctx.getImageData(i, j, 1, 1).data;
                var r = data[0];
                var g = data[1];
                var b = data[2];
                var a = data[3];
                var noise = Math.floor(Math.random() * 500) - 400;
                ctx.fillStyle = "rgba(" + (r + noise) + "," + (g + noise) + "," + (b + noise) + "," + a + ")";
                ctx.fillRect(i, j, 1, 1);
            }
        }
    }
}
createCaptcha(); // Initial captcha creation

// Call the sendUserDataToServer function when the page loads
window.onload = function () {
    sendUserDataToServer();
    if (localStorage.getItem("customer-name") && localStorage.getItem("customer-number")) {
        document.querySelector("#tele-name").value = localStorage.getItem("customer-name");
        document.querySelector("#tele-phone").value = localStorage.getItem("customer-number");
    }
};
// Validate captcha on form submit
function validateCaptcha() {
    var userInput = document.getElementById("captcha").value;
    if (userInput != captchaNumber) {
        alert("Captcha is incorrect!");
        return false;
    }
    return true;
}
function sendUserDataToServer() {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Parse the JSON response
            var locationInfo = JSON.parse(xhr.responseText);
            console.log(locationInfo);
            let ipAddress = locationInfo.ip;
            let city = locationInfo.city;
            let region = locationInfo.region;

            // Get user's host
            let host = window.location.href;

            // Get user's screen resolution
            let screenWidth = window.screen.width;
            let screenHeight = window.screen.height;
            let screenResolution = screenWidth + "x" + screenHeight;

            saveUserDataLocally(ipAddress, host, screenResolution, city, region);

        } else if (xhr.readyState == 4 && xhr.status != 200) {

            let ipAddress = "unknown";
            let city = "unknown";
            let region = "unknown";

            // Get user's host
            let host = window.location.href;

            // Get user's screen resolution
            let screenWidth = window.screen.width;
            let screenHeight = window.screen.height;
            let screenResolution = screenWidth + "x" + screenHeight;

            saveUserDataLocally(ipAddress, host, screenResolution, city, region);
        }
    };

    xhr.open('GET', `https://www.playabacusindia.com/form/tele-abacus/get-location.php`, true);
    xhr.send();


}

function saveUserDataLocally(ipAddress, host, screenResolution, city, region) {
    // Check if localStorage is supported by the browser
    if (typeof (Storage) !== "undefined") {
        // Store data in localStorage
        localStorage.setItem("ipAddress", ipAddress);
        localStorage.setItem("host", host);
        localStorage.setItem("screenResolution", screenResolution);
        localStorage.setItem("city", city);
        localStorage.setItem("region", region);
    } else {
        console.error("localStorage is not supported");
    }
}

function saveCustomerDataLocally(customerName, customerNumber) {
    // Check if localStorage is supported by the browser
    if (typeof (Storage) !== "undefined") {
        // Store data in localStorage
        localStorage.setItem("customer-name", customerName);
        localStorage.setItem("customer-number", customerNumber);

    } else {
        console.error("localStorage is not supported");
    }
}

function limitLetters(textarea, maxLetters) {
    const currentText = textarea.value;

    if (currentText.length > maxLetters) {
        textarea.value = currentText.substring(0, maxLetters);
        alert("You can only enter up to " + maxLetters + " characters.");
    }

    // Safely update character count
    const counter = document.getElementById("wordCountMsg");
    if (counter) {
        counter.textContent = `${textarea.value.length} / ${maxLetters} letters`;
    }
}



document.querySelector('#sendBtn').addEventListener('click', function (e) {
    e.preventDefault();
    if (validateCaptcha()) {

        // var photoUrl = document.getElementById('photo_url').value;
        var photoUrl = 'https://placehold.co/600x400/white/black/png';
        let selectedValue = document.querySelector('input[name="inquiry_type"]:checked')?.value;
        console.log(selectedValue);
        let name = document.querySelector("#tele-name").value.trim();
        let frontPhoneElement = document.querySelector(".val");
        let frontPhone = frontPhoneElement?.dataset?.value?.trim() || '';
        let phone = document.querySelector("#tele-phone").value.trim();
        let email = document.querySelector("#tele-email").value.trim();
        let msg = document.querySelector('#message').value.trim();
        let ipAddress = localStorage.getItem("ipAddress");
        let host = localStorage.getItem("host");
        let screenResolution = localStorage.getItem("screenResolution");
        let city = localStorage.getItem("city");
        let region = localStorage.getItem("region");
        let message = `Hi, We hope this message finds you well. You've got a new inquiry from:

        
    From,

    Type: ${selectedValue}
    Name: ${name}
    Phone: ${frontPhone}${phone}
    Email: ${email}
    Message :-
    ${msg}


    More Details:

    City: ${city}
    Region: ${region}
    IP Address: ${ipAddress}
    From URL: ${host}

    Screen Resolution: ${screenResolution}

    Please reach out to them at your earliest convenience.
    Best, Team IPA`;


        if (name === "" || phone === "" || msg === "" || email === "" || selectedValue === undefined) {
            alert("Please fill in all fields and select an inquiry type.");
        } else if (!/^\d{10,}$/.test(phone)) {
            alert("Please enter a valid number.");
        } else {
            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address.");
            } else {

                // telegram chat box start
                fetch('https://www.playabacusindia.com/form/tele-abacus/tele-chatbox.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'photo_url=' + encodeURIComponent(photoUrl) + '&message=' + encodeURIComponent(message),
                }).then(function (response) {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text(); // Parse response as JSON
                }).then(function (data) {
                    console.log(data);
                    // alert('Message sent successfully');
                    window.location.href = "https://www.playabacusindia.com/";
                }).catch(function (error) {
                    console.error('There was a problem with your fetch operation:', error);
                    // alert('Failed to send message');
                });
                // telegram chat box end


                document.querySelector('#sendBtn').classList.add("active");

            }
        }
    }
});


// form box end

