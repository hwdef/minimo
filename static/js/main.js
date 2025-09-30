(function () {
  const ready = (fn) => {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  };

  ready(() => {
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    const toggler = document.getElementById('sidebar-toggler');
    const overlay = sidebar ? sidebar.querySelector('.sidebar-overlay') : null;
    const mobileQuery = window.matchMedia('(max-width: 1024px)');

    const updateAccessibility = () => {
      if (!sidebar) {
        return;
      }

      if (!mobileQuery.matches) {
        sidebar.removeAttribute('aria-hidden');
        body.classList.remove('has-sidebar-open');
        if (toggler) {
          toggler.setAttribute('aria-expanded', 'false');
        }
        return;
      }

      const open = body.classList.contains('has-sidebar-open');
      sidebar.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (toggler) {
        toggler.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    };

    const setSidebarState = (open) => {
      if (!sidebar) {
        return;
      }

      body.classList.toggle('has-sidebar-open', open);
      updateAccessibility();
    };

    if (toggler && sidebar) {
      toggler.addEventListener('click', () => {
        const open = !body.classList.contains('has-sidebar-open');
        setSidebarState(open);
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => setSidebarState(false));
    }

    if (sidebar) {
      sidebar.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          if (mobileQuery.matches) {
            setSidebarState(false);
          }
        });
      });
    }

    updateAccessibility();
    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener('change', updateAccessibility);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(updateAccessibility);
    }
  });
})();
