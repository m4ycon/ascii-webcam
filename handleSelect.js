const charsChainSelect = document.querySelector('#chars-chain-select');

function setSelectOptions() {
  // clear select options
  charsChainSelect.innerHTML = '';

  // set values
  chars.forEach(chain => {
    const option = document.createElement('option');
    option.value = chain;
    option.innerText = chain;
    charsChainSelect.appendChild(option);
  });

  // set initial value
  charsChainSelect.value = charsChain;
}

function handleOnSelectChange() {
  charsChain = charsChainSelect.value;
  nColors = charsChain.length;
  setInitialValues();
}
charsChainSelect.addEventListener('change', handleOnSelectChange);
