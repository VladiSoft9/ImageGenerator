// Dark mode toggler, saving and applying preffered theme

function initializeTheme() {
 
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const themeToApply = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  if (themeToApply === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  
  updateThemeToggle();
}

function toggleTheme() {

  document.body.classList.toggle('dark-theme');
  
  const isDark = document.body.classList.contains('dark-theme');
  const newTheme = isDark ? 'dark' : 'light';
  
  localStorage.setItem('theme', newTheme);
  
  updateThemeToggle();
}

function updateThemeToggle() {
  const themeLogo = document.getElementById('themeLogo');
  const themeName = document.getElementById('themeName');
  
  if(document.body.classList.contains('dark-theme')){
        themeLogo.classList.remove('fa-moon')
        themeLogo.classList.add('fa-sun')
        themeName.textContent = 'Light Mode'

    }

    else{
        themeLogo.classList.remove('fa-sun')
        themeLogo.classList.add('fa-moon')
        themeName.textContent = 'Dark Mode'
    }

}

document.addEventListener('DOMContentLoaded', initializeTheme);
