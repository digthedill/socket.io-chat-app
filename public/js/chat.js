const socket = io();

//Elements
//DOM ELEMENTS start with $ by convention
const $form = document.querySelector("#chatForm");
const $formInput = $form.querySelector("input");
const $formButton = $form.querySelector("button");
const $sendLocationButton = document.querySelector("#sendLocation");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#locationMsg-template").innerHTML;

// options:
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})


socket.on("message", ({
    text,
    createdAt,
    username
}) => {
    const html = Mustache.render(messageTemplate, {
        username,
        message: text,
        msgTimeStamp: moment(createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", ({
    url,
    createdAt,
    username
}) => {
    console.log(url);
    const html = Mustache.render(locationTemplate, {
        username,
        location: url,
        locationTimeStamp: moment(createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);
});

$form.addEventListener("submit", (e) => {
    e.preventDefault();
    $formButton.setAttribute("disabled", "disabled");

    const msg = e.target.elements.message.value;

    socket.emit("sendMessage", msg, (error) => {
        $formButton.removeAttribute("disabled");
        $formInput.value = "";
        $formInput.focus();
        if (error) {
            console.log(error);
        } else {
            console.log("Message delieved!");
        }
    });
});

$sendLocationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported");
    } else {
        $sendLocationButton.setAttribute("disabled", "disabled");
        navigator.geolocation.getCurrentPosition((position) => {
            socket.emit(
                "sendLocation", {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                },
                () => {
                    $sendLocationButton.removeAttribute("disabled");
                    console.log("Location Shared");
                }
            );
        });
    }
});

socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})