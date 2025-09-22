const connectButton = document.getElementById("connectSerial");
let port; // Declaring a global variable
let terminalContainer = document.getElementById('terminal');

// Вывод в терминал
function log(data, type = '') {
    terminalContainer.insertAdjacentHTML('beforeend',
        '<div' + (type ? ' class="' + type + '"' : '') + '>' + data + '</div>');
    terminalContainer.scrollTop = terminalContainer.scrollHeight;
    let el = terminalContainer.querySelectorAll('div');
    if (el.length > 20)
        el[0].remove();
}

connectButton.addEventListener('click', async () => {
    try {
        const newport = await navigator.serial.requestPort();
        port = newport; // Assigning the port to the global variable
        await port.open({ baudRate: 115200 });
        readLoop();
        // Continue connecting to the device attached to |port|.
    } catch (e) {
        // The prompt has been dismissed without selecting a device.
        console.error("Error requesting or opening serial port:", e);
    }
});



navigator.serial.addEventListener("connect", (e) => {
    // Connect to `e.target` or add it to a list of available ports.
    // readLoop();
});

navigator.serial.addEventListener("disconnect", (e) => {
    // Remove `e.target` from the list of available ports.
    e.target.close();
});

function findSequence(arr, seq) {
    for (let i = 0; i <= arr.length - seq.length; i++) {
        let found = true;
        for (let j = 0; j < seq.length; j++) {
            if (arr[i + j] !== seq[j]) {
                found = false;
                break;
            }
        }
        if (found) {
            return i; // Возвращаем индекс начала последовательности
        }
    }
    return -1; // Последовательность не найдена
}

const arr = [1, 2, 3, 4, 5, 6, 7];
const seqStart = [0xF4, 0xF3, 0xF2, 0xF1];
const seqStop = [0xF8, 0xF7, 0xF6, 0xF5];


async function readLoop() {
    // var ReceivedData;
    while (port.readable) {
        const reader = port.readable.getReader();
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    // |reader| has been canceled.
                    break;
                }
                // Do something with |value|...

                var indexStart = findSequence(value, seqStart);

                if (indexStart !== -1) {
                    indexStart += seqStart.length;
                    console.log(`Последовательность найдена с индекса: ${indexStart}`); // Вывод: Последовательность найдена с индекса: 2
                    const indexStop = findSequence(value, seqStop);
                    if (indexStop !== -1) {
                        console.log(`Последовательность stop с индекса: ${indexStop}`);
                        const slicedNumbers = value.slice(indexStart, indexStop); //
                        console.log(slicedNumbers);
                    }
                    else{
                        console.log("Последовательность stop не найдена");
                    }
                }
                 else {
                    console.log("Последовательность не найдена");
                }
            }
        } catch (error) {
            // Handle |error|...
            console.error("Error read serial port:", error);
        } finally {
            reader.releaseLock();
        }
    }
}


async function writeToPort() {
    if (port && port.writable) {
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode("Hello, Serial!"));
        writer.releaseLock();
    }
};