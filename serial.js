const connectButton = document.getElementById("connectSerial");
let port; // Declaring a global variable
let terminalContainer = document.getElementById('terminal');

const seqStart = [0xF4, 0xF3, 0xF2, 0xF1];
const seqStop = [0xF8, 0xF7, 0xF6, 0xF5];

function radarData(idTarget, Angle, Distance, SpeedDirection, Speed, SignalToNoise) {
    this.idTarget = idTarget;
    this.Angle = Angle;//Unit: degree
    this.Distance = Distance;//Unit: meter
    this.SpeedDirection = SpeedDirection;//01: Approach  00: Move away
    this.Speed = Speed;//Unit:km/h
    this.SignalToNoise = SignalToNoise//;0 to 255 Same as left 
}

const indicData = document.getElementById('blinking-indicator');

//test
let testRadar = [
    new radarData(1, 45, 100, 1, 3, 200)
];
testRadar.push(new radarData(2, -10, 100, 0, 5, 180));

console.log(testRadar.length);

const intervalNewDat = setInterval(function () {
    for (let i = 0; i < testRadar.length; i++) {
        if (testRadar[i].SpeedDirection == 1) {
            if ((testRadar[i].Distance - testRadar[i].Speed) > 1) {
                testRadar[i].Distance = testRadar[i].Distance - testRadar[i].Speed;
            } else {
                testRadar[i].SpeedDirection = 0;

            }
        } else {
            if (testRadar[i].Distance <= 150) {
                testRadar[i].Distance = testRadar[i].Distance + testRadar[i].Speed;
            } else {
                testRadar[i].SpeedDirection = 1;
                testRadar[i].Angle = getRandomInt(-45, 45);
                testRadar[i].Speed = getRandomInt(1, 10);
                testRadar[i].SignalToNoise = getRandomInt(100, 255);
            }
        }
    }


    blinkingIndicator();
    //   counter++;
    //   console.log(`Interval count: ${counter}`);
    //   if (counter >= 5) {
    //     clearInterval(intervalId); // Stop the interval after 5 executions
    //   }
}, 1000); // Execute every 1 second

function blinkingIndicator() {
    indicData.classList.add('active'); // Добавляет класс 'active'
    var bl = setInterval(() => {
        indicData.classList.remove('active'); // удаляет класс 'active'
        clearInterval(bl);
    }, 500); // Интервал 500 миллисекунд
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Пример использования:
let randomValue = getRandomInt(10, 50);
console.log(randomValue); // случайное число от 10 до 50 включительно



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


//var myItems = [new Item(1, 'john', 'au'), new Item(2, 'mary', 'us')];


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
                    else {
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