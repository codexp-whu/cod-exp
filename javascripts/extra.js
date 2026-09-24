console.log("extra.js loaded");

fetch("https://codexp-whu.goatcounter.com/counter/TOTAL.json")
    .then(response => {
        console.log("GoatCounter status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("GoatCounter data:", data);

        const el = document.querySelector("#visitor-count");

        console.log("visitor element:", el);

        if (el) {
            el.textContent = data.count;
        }
    })
    .catch(error => {
        console.error("GoatCounter error:", error);
    });