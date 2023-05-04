const loaderContainer = document.querySelector('.loader-container');

function showLoader() {
  loaderContainer.style.display = 'block';
}

function hideLoader() {
  loaderContainer.style.display = 'none';
}

function runFunction() {
  showLoader();
  setTimeout(() => {
    hideLoader();
    alert('Function finished running!');
  }, 3000);
}
