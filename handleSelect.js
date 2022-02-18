const charsChainSelect = document.querySelector('#chars-chain-select');

function setSelectOptions() {
  // clear select options
  charsChainSelect.innerHTML = '';

  // set values
  configs.forEach(({ chain }) => {
    const option = document.createElement('option');
    option.value = chain;
    option.innerText = chain;
    charsChainSelect.appendChild(option);
  });

  // set initial value
  charsChainSelect.value = configChoice.chain;
}

function handleOnSelectChange(e) {
  configChoiceI = configs.findIndex(({ chain }) => chain === e.target.value);
  handleConfigChange(configChoiceI);
}
charsChainSelect.addEventListener('change', handleOnSelectChange);
