import loadWasm from './myrustlib/src/lib.rs';

loadWasm().then(result => {
  console.log(result.instance.exports.add(1, 2));
});
