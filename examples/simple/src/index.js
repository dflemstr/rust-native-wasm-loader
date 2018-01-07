import loadAdd from './lib.rs'

loadAdd().then(result => {
  const add = result.instance.exports['add'];
  console.log('return value was', add(2, 3));
});
