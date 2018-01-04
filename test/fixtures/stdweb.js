import loadWasm from './mystdweblib/src/main.rs';

loadWasm().then(result => {
  console.log(result.add(1, 2));
});
