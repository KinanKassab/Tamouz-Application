export class ThemeManager {
  static init(): void {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('scout-app-theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    this.setTheme(theme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('scout-app-theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  static setTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('scout-app-theme', theme);
  }

  static toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  static getCurrentTheme(): 'light' | 'dark' {
    return document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
  }
}