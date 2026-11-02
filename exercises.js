console.log("Hola desde exercises.js"); 

function greetDeclaration(name = "friend") {
    return "Hello, " + name + "!";
}

const greetExpression = function (name = "friend") {
    return "Hello, " + name + "!";
};

const greetArrow = (name = "friend") => "Hello, " + name + "!";



function squareDeclaration(n) {
    return n * n;
}

const squareExpression = function (n) {
    return n * n;
};

const squareArrow = (n) => n * n;



function sumArrayDeclaration(numbers) {
    let total = 0;
    for (let i = 0; i < numbers.length; i++) {
        total = total + numbers[i];
    }
    return total;
}

const sumArrayExpression = function (numbers) {
    let total = 0;
    for (let i = 0; i < numbers.length; i++) {
        total = total + numbers[i];
    }
    return total;
};

const sumArray = (numbers) => {
    let total = 0;
    for (let i = 0; i < numbers.length; i++) {
        total = total + numbers[i];
    }
    return total;
};


function celsiusToFahrenheitDeclaration(celsius) {
    return (celsius * 9 / 5) + 32;
}

const celsiusToFahrenheitExpression = function (celsius) {
    return (celsius * 9 / 5) + 32;
};

const celsiusToFahrenheit = (celsius) => (celsius * 9 / 5) + 32;

function fizzBuzz(n) {
    for (let i = 1; i <= n; i++) {
        if (i % 3 === 0 && i % 5 === 0) {
            console.log("FizzBuzz");
        } else if (i % 3 === 0) {
            console.log("Fizz");
        } else if (i % 5 === 0) {
            console.log("Buzz");
        } else {
            console.log(i);
        }
    }
}
function findMax(numbers) {
    if (numbers.length === 0) {
        return undefined;
    }

    let maximo = numbers[0];

    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] > maximo) {
            maximo = numbers[i];
        }
    }

    return maximo;
}
function isPalindrome(str) {
    const limpio = str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const alReves = limpio.split("").reverse().join("");
    return limpio === alReves;
}
//Validadores
function validateEmail(email) {
    const posArroba = email.indexOf("@");
    if (posArroba < 1) {
        return false;
    }

    const posPunto = email.indexOf(".", posArroba);
    if (posPunto < posArroba + 2) {
        return false;
    }

    if (posPunto === email.length - 1) {
        return false;
    }

    return true;
} 
function validatePassword(password) {
    if (password.length < 8) {
        return false;
    }

    let tieneLetra = false;
    let tieneDigito = false;

    for (let i = 0; i < password.length; i++) {
        const caracter = password[i].toLowerCase();

        if ("abcdefghijklmnopqrstuvwxyz".includes(caracter)) {
            tieneLetra = true;
        }
        if ("0123456789".includes(caracter)) {
            tieneDigito = true;
        }
    }

    return tieneLetra && tieneDigito;
}

function validateLoginForm(email, password) {
    const errors = [];

    if (!validateEmail(email)) {
        errors.push("El correo no tiene un formato válido");
    }

    if (!validatePassword(password)) { //EL ! es para negar la funcion//
        errors.push("La contraseña debe tener al menos 8 caracteres, una letra y un dígito");
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

console.assert(greetDeclaration("Ana") === "Hello, Ana!", "greet con nombre");
console.assert(greetDeclaration() === "Hello, friend!", "greet por defecto");
console.assert(greetExpression("Ana") === "Hello, Ana!", "greetExpression");
console.assert(greetArrow("Ana") === "Hello, Ana!", "greetArrow");

console.assert(squareDeclaration(5) === 25, "square");
console.assert(squareExpression(5) === 25, "squareExpression");
console.assert(squareArrow(5) === 25, "squareArrow");

console.assert(sumArray([1, 2, 3, 4]) === 10, "sumArray basico");
console.assert(sumArray([]) === 0, "sumArray vacio");

console.assert(celsiusToFahrenheit(0) === 32, "0 grados");
console.assert(celsiusToFahrenheit(100) === 212, "100 grados");
console.assert(celsiusToFahrenheit(-40) === -40, "-40 grados");

const sociosPorPista = [12, 28, 7, 34, 19, 22];
console.log("Pista con más reservas esta semana:", findMax(sociosPorPista));

const nombresPistas = ["Central", "Panoramica", "Reconocer"];
console.log("¿'Reconocer' es palíndromo?", isPalindrome(nombresPistas[2]));

console.assert(findMax([3, 7, 2, 9, 1]) === 9, "findMax basic");
console.assert(findMax([-5, -2, -9]) === -2, "findMax negatives");
console.assert(findMax([]) === undefined, "findMax empty");

console.assert(isPalindrome("racecar") === true, "isPalindrome basic");
console.assert(isPalindrome("A man, a plan, a canal: Panama") === true, "isPalindrome punctuation");
console.assert(isPalindrome("hello") === false, "isPalindrome false case");

console.assert(validateEmail("fan@riverside.fc") === true, "email valid");
console.assert(validateEmail("fan@riversidefc") === false, "email needs a dot");
console.assert(validateEmail("fanriverside.fc") === false, "email needs an @");

console.assert(validatePassword("Season2026") === true, "password ok");
console.assert(validatePassword("short1") === false, "password too short");
console.assert(validatePassword("allletters") === false, "password needs a digit");

console.assert(validateLoginForm("fan@riverside.fc", "Season2026").valid === true, "form valid");
console.assert(validateLoginForm("nope", "x").errors.length === 2, "form reports both errors");