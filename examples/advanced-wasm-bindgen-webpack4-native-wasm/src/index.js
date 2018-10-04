import { wasmBooted, hello_world } from '../../advanced-wasm-bindgen/src/lib.rs';

const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const outputElement = document.getElementById('output');

const update = () => {
  const firstName = firstNameInput.value;
  const lastName = lastNameInput.value;
  wasmBooted.then(() => outputElement.textContent = hello_world(firstName, lastName));
};

firstNameInput.addEventListener('input', update);
lastNameInput.addEventListener('input', update);
update();
