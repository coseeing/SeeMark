const createDOMFromHTML = (htmlString) => {
  const container = document.createElement('div');
  container.innerHTML = htmlString;

  return container;
};

export default createDOMFromHTML;
